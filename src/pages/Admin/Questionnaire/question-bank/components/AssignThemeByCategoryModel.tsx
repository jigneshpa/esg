import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Select,
  Stack
} from '@chakra-ui/react';

import { STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';
import { useAppDispatch } from '@/store/hooks';
import { setRefetchQuery } from '@/store/slices/refresh/refreshSlice';

// import useLoadOptions, { ApiType } from '@/hooks/useLoadOptions';

const themeOptions = [
  { value: 'Environmental', label: 'Environmental' },
  { value: 'Social', label: 'Social' },
  { value: 'Governance', label: 'Governance' }
];

interface AssignThemeByCategoryModelProps {
  categories: { name: string, id: string }[];
  questions: any[];
}

const AssignThemeByCategoryModel = ({ categories, questions }: AssignThemeByCategoryModelProps) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { notify } = useAppContext();
  const dispatch = useAppDispatch();
  const [categoryThemeMap, setCategoryThemeMap] = useState<{ [catId: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const handleModal = useCallback(() => setIsModalOpen(!isModalOpen), [isModalOpen]);
  const { qbankId } = useParams();

  const handleThemeChange = (catId: string, theme: string) => {
    setCategoryThemeMap(prev => ({ ...prev, [catId]: theme }));
  };

  const [updateQuestions] = questionnaireApi.useUpdateQuestionsMutation();

  // Populate categoryThemeMap with existing theme values from questions
  useEffect(() => {
    if (questions && questions.length > 0) {
      const initialThemeMap: { [catId: string]: string } = {};
      questions.forEach(question => {
        if (question.category?.id && question.theme) {
          initialThemeMap[question.category.id] = question.theme;
        }
      });
      setCategoryThemeMap(initialThemeMap);
    }
  }, [questions]);

  const handleAssign = async () => {
    setLoading(true);
    const questionsToUpdate: any[] = [];
    Object.entries(categoryThemeMap).forEach(([catId, theme]) => {
      console.log('theme is : ', theme);
      // if (theme) {
      const questionsInCategory = questions.filter(q => q.category?.id == catId);
      questionsInCategory.forEach(q => {
        const contentObj: any = {};
        if (q.checkboxOptions && q.type === 'checkbox') {
          contentObj.checkboxOptions = q.checkboxOptions;
        }
        if (q.dropDownOptions && q.type === 'dropDown') {
          contentObj.dropDownOptions = q.dropDownOptions;
        }
        if (q.compare && q.type === 'compare') {
          contentObj.compare = q.compare;
        }
        if (q.tableOptions && q.type === 'table') {
          contentObj.tableOptions = q.tableOptions;
        }
        questionsToUpdate.push({
          id: q.id,
          title: q.title,
          type: q.type,
          institutions: q.institution,
          frameworks: q.framework,
          industries: q.industry,
          question_bank_id: Number(qbankId),
          is_required: q.is_required || false,
          has_attachment: q.has_attachment || false,
          has_remarks: q.has_remarks || false,
          content: JSON.stringify(contentObj),
          scope: q.scope,
          is_not_question: q.is_not_question || false,
          theme: theme || null
        });
      });
      // }
    });

    try {
      if (questionsToUpdate.length > 0) {
        await updateQuestions({ questions: questionsToUpdate }).unwrap();
        notify({
          type: STATUS.SUCCESS,
          message: 'successfully updated'
        });
        dispatch(setRefetchQuery({ queryKey: 'questionBankList', value: true }));
      }
    } catch (error) {
      // Optionally, you can show an error message here
      console.error('Failed to assign themes:', error);
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <Button
        fontSize={'0.9em'}
        fontWeight={700}
        w="auto"
        h="44px"
        bg="#137E59"
        onClick={handleModal}
        _hover={{
          opacity: 0.8
        }}
      >
        Assign Theme By Category
      </Button>
      <Drawer isOpen={isModalOpen} onClose={handleModal} placement="right" size="md">
        <DrawerOverlay />
        <DrawerContent bgColor="#FFF" borderRadius={'16px 0 0 16px'}>
          <DrawerHeader
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
            borderBottomWidth="1px"
            fontSize="18px"
            fontWeight={600}
          >
            Assign Theme By Category
            <DrawerCloseButton position={'static'} />
          </DrawerHeader>
          <DrawerBody bgColor="#FFF" pt={6}>
            <Stack spacing={4}>
              {categories.map(cat => (
                <Box key={cat.id} display="flex" alignItems="center" justifyContent="space-between">
                  <Box fontWeight={500}>{cat.name}</Box>
                  <Select
                    placeholder="Select Theme"
                    value={categoryThemeMap[cat.id] || ''}
                    onChange={e => handleThemeChange(cat.id, e.target.value)}
                    w="220px"
                  >
                    {themeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Box>
              ))}
            </Stack>
            <Button
              colorScheme="blue"
              mt={6}
              isDisabled={Object.values(categoryThemeMap).filter(Boolean).length === 0}
              onClick={handleAssign}
              w="100%"
              isLoading={loading}
              loadingText="Assigning..."
            >
              Assign
            </Button>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default AssignThemeByCategoryModel;

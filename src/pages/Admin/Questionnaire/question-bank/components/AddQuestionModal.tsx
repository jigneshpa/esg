import { useCallback, useRef, useState } from 'react';
import { MdOutlineAdd } from 'react-icons/md';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Icon,
  SimpleGrid,
  Stack
} from '@chakra-ui/react';

import { CustomTabs } from '@/components';
// import useLoadOptions, { ApiType } from '@/hooks/useLoadOptions';
import useUploadQuestionnaire from '@/hooks/useUploadQuestionnaire';

import AddAttributesForm from './AddAttributesForm';
import AddQuestionContainer from './AddQuestionContainer';

const AddQuestionModal = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const handleModal = useCallback(() => setIsModalOpen(!isModalOpen), [isModalOpen]);
  const [isSubmittingQuestions, setIsSubmittingQuestions] = useState<boolean>(false);
  const { setSelectedFiles, handleExportAndClose, isUploading } = useUploadQuestionnaire(handleModal);
  const addQuestionContainerRef = useRef<any>();

  const handleIsSubmittingQuestions = (state: boolean) => {
    setIsSubmittingQuestions(state);
  };

  const handleSaveQuestions = () => {
    if (addQuestionContainerRef.current) {
      addQuestionContainerRef.current?.submitAll();
    }
  };

  const [activeTab, setActiveTab] = useState<number>(0);
  const tabTitles = [
    // 'Upload Questions',
    'Add Question',
    'Attributes'
  ];
  const tabContents = [
    // <FileUpload
    //   key={0}
    //   setSelectedFiles={setSelectedFiles}
    //   acceptedFileTypes={{
    //     accept: {
    //       'text/xlsx': ['.xlsx'],
    //       'text/csv': ['.csv']
    //     }
    //   }}
    //   recomendations={BULK_RECOMEDTIONS.BULK_QUESTIONS}
    //   uploadInfo={{
    //     uploadname: 'questions',
    //     csv: import.meta.env.VITE_UPLOAD_QUESTIONS_CSV,
    //     xlsx: import.meta.env.VITE_UPLOAD_QUESTIONS_XLSX
    //   }}
    // />,
    <AddQuestionContainer
      ref={addQuestionContainerRef}
      handleModal={handleModal}
      key={1}
      handleIsSubmittingQuestions={handleIsSubmittingQuestions}
    />,
    <Stack key={2} spacing={6} width="100%">
      <SimpleGrid columns={1} spacing={4}>
        <AddAttributesForm standardType="institution" />
        <AddAttributesForm standardType="department" />
        <AddAttributesForm standardType="framework" />
        <AddAttributesForm standardType="industry" />
      </SimpleGrid>
    </Stack>
  ];

  const renderButton = () => {
    switch (activeTab) {
      case 0:
        return (
          <Button isLoading={isUploading} onClick={handleExportAndClose}>
            Save Questionnaire
          </Button>
        );
      case 1:
        return (
          <Button isLoading={isSubmittingQuestions} onClick={handleSaveQuestions}>
            Save
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Button
        fontSize={'0.9em'}
        fontWeight={700}
        w="auto"
        h="44px"
        isLoading={isUploading}
        leftIcon={<Icon as={MdOutlineAdd} fontSize={'20px'} />}
        bg="#137E59"
        onClick={handleModal}
        _hover={{
          opacity: 0.8
        }}
      >
        Add Question/s
      </Button>
      <Drawer isOpen={isModalOpen} placement="right" onClose={handleModal} size="lg">
        <DrawerOverlay />
        <DrawerContent w="100%">
          <DrawerHeader
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
            bg="#FFF"
            borderBottom="1px solid #D9D9D9"
            fontSize="18px"
            fontWeight="600"
          >
            Add New Question
            <DrawerCloseButton position={'static'} />
          </DrawerHeader>
          <DrawerBody bgColor="#FFF">
            <CustomTabs
              title={tabTitles}
              content={tabContents}
              activeIndex={activeTab}
              onChange={(index: number) => setActiveTab(index)}
            />
          </DrawerBody>
          <DrawerFooter bgColor="#FAFAFA" borderTop="1px solid #D9D9D9">
            <Button variant="outline" mr={3} onClick={handleModal}>
              Close
            </Button>
            <>{renderButton()}</>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default AddQuestionModal;

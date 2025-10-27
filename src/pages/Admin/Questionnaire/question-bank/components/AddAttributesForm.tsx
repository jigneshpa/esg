import { useEffect, useState } from 'react';
import { Box, Card, CardHeader, VStack } from '@chakra-ui/react';

import { useAddDepartment } from '@/hooks/useAddDepartment';
import { useAddQuestionBank } from '@/hooks/useAddQuestionBank';
import { useAddIndustry } from '@/hooks/useAddIndustry';
import { useAddInstitution } from '@/hooks/useAddInstitution';
import useDeleteDepartment from '@/hooks/useDeleteDepartment';
import useDeleteQuestionBank from '@/hooks/useDeleteQuestionBank';
import useDeleteIndustry from '@/hooks/useDeleteIndustry';
import useDeleteInstitution from '@/hooks/useDeleteInstitution';
import { useEditDepartment } from '@/hooks/useEditDepartment';
import { useEditQuestionBank } from '@/hooks/useEditQuestionBank';
import { useEditIndustry } from '@/hooks/useEditIndustry';
import { useEditInstitution } from '@/hooks/useEditInstitution';
import useLoadOptions from '@/hooks/useLoadOptions';

import { Select } from './AddAttriburesSelect';

interface AddAttributesFormProps {
  standardType: 'framework' | 'institution' | 'department' | 'scope' | 'industry';
  onlyDepartment?: boolean;
}

const AddAttributesForm: React.FC<AddAttributesFormProps> = ({ standardType }) => {
  const [data, setData] = useState<any[]>([]);

  // const loadOptions = useLoadOptions(standardType);
  const { loadOptions } = useLoadOptions(standardType);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await loadOptions('', [], { page: 1 });
        setData(response.options);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [loadOptions]);

  /**
  |--------------------------------------------------
  | Call all hooks and select the relevant one later based on standardType
  |--------------------------------------------------
  */

  //add
  const addQuestionBankHook = useAddQuestionBank();
  const addInstitutionHook = useAddInstitution();
  const addDepartmentHook = useAddDepartment();
  const addIndustryHook = useAddIndustry();

  //edit
  const editQuestionBankHook = useEditQuestionBank();
  const editInstitutionHook = useEditInstitution();
  const editDepartmentHook = useEditDepartment();
  const editIndustryHook = useEditIndustry();

  //delete

  const deleteQuestionBankHook = useDeleteQuestionBank();
  const deleteInstitutionHook = useDeleteInstitution();
  const deleteDepartmentHook = useDeleteDepartment();
  const deleteIndustryHook = useDeleteIndustry();

  /**
|--------------------------------------------------
| Select the hook's values based on standardType
|--------------------------------------------------
*/

  let addHook, editHook, deleteHook;

  switch (standardType) {
    case 'framework':
      addHook = addQuestionBankHook;
      editHook = editQuestionBankHook;
      deleteHook = deleteQuestionBankHook;
      break;
    case 'institution':
      addHook = addInstitutionHook;
      editHook = editInstitutionHook;
      deleteHook = deleteInstitutionHook;
      break;
    case 'department':
      addHook = addDepartmentHook;
      editHook = editDepartmentHook;
      deleteHook = deleteDepartmentHook;
      break;
    default:
      addHook = addIndustryHook;
      editHook = editIndustryHook;
      deleteHook = deleteIndustryHook;
      break;
  }

  const fieldName = (standardType: AddAttributesFormProps['standardType']): string => {
    let name = '';
    switch (standardType) {
      case 'framework':
        name = 'ESG Standard';
        break;

      case 'institution':
        name = 'Institution';
        break;

      case 'department':
        name = 'Department';
        break;

      case 'industry':
        name = 'Industry';
        break;
      default:
        name = '';
    }
    return name;
  };

  return (
    <VStack justify="space-between" pt="2px" w="100%" spacing={6} align="stretch">
      <Card w="100%" maxH="500px" boxShadow="md" borderRadius="lg">
        <CardHeader fontWeight="bold" backgroundColor="gray.50" py={1}>
          {fieldName(standardType)}
        </CardHeader>
        <Box maxH="250px">
          <VStack w="100%" p={4} spacing={4} align="stretch">
            <Select
              data={data}
              addHook={addHook}
              editHook={editHook}
              deleteHook={deleteHook}
              standardType={standardType}
              placeholder={`Type to search or create ${fieldName(standardType)}`}
            />
          </VStack>
        </Box>
      </Card>
    </VStack>
  );
};

export default AddAttributesForm;

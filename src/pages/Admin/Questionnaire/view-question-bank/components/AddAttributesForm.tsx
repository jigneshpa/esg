import { Controller } from 'react-hook-form';
import { Button, FormControl, FormErrorMessage, FormLabel, HStack, Input } from '@chakra-ui/react';

import { useAddDepartment } from '@/hooks/useAddDepartment';
import { useAddQuestionBank } from '@/hooks/useAddQuestionBank';
import { useAddInstitution } from '@/hooks/useAddInstitution';

const AddAttributesForm = ({ onlyDepartment = false }: any) => {
  const {
    control: questionBankControl,
    handleSubmit: handleQuestionBankSubmit,
    onSubmit: onQuestionBankSubmit,
    errors: questionBankErrors,
    isLoading: isQuestionBankLoading
  } = useAddQuestionBank();

  const {
    control: institutionControl,
    handleSubmit: handleInstitutionSubmit,
    onSubmit: onInstitutionSubmit,
    errors: institutionErrors,
    isLoading: isInstitutionLoading
  } = useAddInstitution();

  const {
    control: departmentControl,
    handleSubmit: handleDepartmentSubmit,
    onSubmit: onDepartmentSubmit,
    errors: departmentErrors,
    isLoading: isDepartmentLoading
  } = useAddDepartment();

  return (
    <>
      <HStack justify="space-between" pt="20px">
        {!onlyDepartment && (
          <form onSubmit={handleQuestionBankSubmit(onQuestionBankSubmit)}>
            <HStack maxW="270px" width="100%" alignItems="flex-end" mr="auto">
              <FormControl id="framework" isInvalid={!!questionBankErrors.framework}>
                {questionBankErrors.framework ? (
                  <FormErrorMessage>{questionBankErrors.framework?.message}</FormErrorMessage>
                ) : (
                  <FormLabel>ESG Standard</FormLabel>
                )}
                <Controller
                  name="framework"
                  control={questionBankControl}
                  render={({ field }) => <Input placeholder="ESG Standard" {...field} />}
                />
              </FormControl>
              <Button isLoading={isQuestionBankLoading} type="submit">
                Save
              </Button>
            </HStack>
          </form>
        )}

        {!onlyDepartment && (
          <form onSubmit={handleInstitutionSubmit(onInstitutionSubmit)}>
            <HStack maxW="270px" width="100%" alignItems="flex-end" mr="auto">
              <FormControl id="institution" isInvalid={!!institutionErrors.institution}>
                {institutionErrors.institution ? (
                  <FormErrorMessage>{institutionErrors.institution?.message}</FormErrorMessage>
                ) : (
                  <FormLabel>Institution</FormLabel>
                )}
                <Controller
                  name="institution"
                  control={institutionControl}
                  render={({ field }) => <Input placeholder="Institution" {...field} />}
                />
              </FormControl>
              <Button isLoading={isInstitutionLoading} type="submit">
                Save
              </Button>
            </HStack>
          </form>
        )}
      </HStack>
      <HStack justify="space-between" pt="20px">
        <form onSubmit={handleDepartmentSubmit(onDepartmentSubmit)}>
          <HStack maxW="270px" width="100%" alignItems="flex-end" mr="auto">
            <FormControl id="institution" isInvalid={!!departmentErrors.department}>
              {departmentErrors.department ? (
                <FormErrorMessage>{departmentErrors.department?.message}</FormErrorMessage>
              ) : (
                <FormLabel>Department</FormLabel>
              )}
              <Controller
                name="department"
                control={departmentControl}
                render={({ field }) => <Input placeholder="Department" {...field} />}
              />
            </FormControl>
            <Button isLoading={isDepartmentLoading} type="submit">
              Save
            </Button>
          </HStack>
        </form>
      </HStack>
    </>
  );
};

export default AddAttributesForm;

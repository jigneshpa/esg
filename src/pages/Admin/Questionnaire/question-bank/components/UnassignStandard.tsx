import { FC, useState } from 'react';
import { MdOutlineAssignmentTurnedIn } from 'react-icons/md';
import Select from 'react-select';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Icon,
  Spinner,
  Text,
  VStack
} from '@chakra-ui/react';

import { customStyles, Placeholder } from '@/components/common/InputOption';
import { MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { companyApi } from '@/store/api/company/companyApi';
import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';
import { useAppSelector } from '@/store/hooks';
import { selectUserRole } from '@/store/slices/user/userSelectors';

const UnassignStandard: FC<{ isDisabled: boolean, questionBankId: number }> = ({ isDisabled, questionBankId }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCompanies, setSelectedCompanies] = useState<{ value: number, label: string }[]>([]);
  const [errors, setErrors] = useState<{ companies?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unassignResults, setUnassignResults] = useState<{
    success: { companyName: string }[],
    failed: { companyName: string }[],
    notAssigned: { companyName: string }[]
  }>({ success: [], failed: [], notAssigned: [] });

  const userRole = useAppSelector(selectUserRole);
  const companyId = Number(sessionStorage.getItem('companyId'));
  const { data: companyData, isLoading: isCompanyLoading } = companyApi.useGetAllCompaniesQuery({});
  const { data: questionBankData } = questionnaireApi.useGetQuestionnaireBankListQuery({});
  const [unassignStandardFromCompany] = questionnaireApi.useUnassignStandardFromCompanyMutation();
  const { notify } = useAppContext();

  const handleModal = () => {
    setIsModalOpen(!isModalOpen);
    setSelectedCompanies([]);
    setErrors({});
    setUnassignResults({ success: [], failed: [], notAssigned: [] });
  };

  const validateForm = () => {
    const newErrors: { companies?: string } = {};

    if (!selectedCompanies || selectedCompanies.length === 0) {
      newErrors.companies = 'At least one company is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setUnassignResults({ success: [], failed: [], notAssigned: [] });

    try {
      const results = {
        success: [] as { companyName: string }[],
        failed: [] as { companyName: string }[],
        notAssigned: [] as { companyName: string }[]
      };

      // Make API calls for all selected companies
      const unassignmentPromises = selectedCompanies.map(async company => {
        try {
          const response = await unassignStandardFromCompany({
            question_bank_id: questionBankId,
            company_id: company.value
          }).unwrap();

          if (response.data?.message?.includes('not assigned') || response.data?.message?.includes('not found')) {
            return { type: 'notAssigned', companyName: company.label };
          } else {
            return { type: 'success', companyName: company.label };
          }
        } catch (error: any) {
          console.error(`Error unassigning standard from company ${company.value}:`, error);

          if (error?.data?.message?.includes('not assigned') || error?.data?.message?.includes('not found')) {
            return { type: 'notAssigned', companyName: company.label };
          } else {
            return { type: 'failed', companyName: company.label };
          }
        }
      });

      // Wait for all unassignments to complete
      const unassignmentResults = await Promise.all(unassignmentPromises);

      // Categorize results
      unassignmentResults.forEach(result => {
        if (result.type === 'success') {
          results.success.push({ companyName: result.companyName });
        } else if (result.type === 'failed') {
          results.failed.push({ companyName: result.companyName });
        } else if (result.type === 'notAssigned') {
          results.notAssigned.push({ companyName: result.companyName });
        }
      });

      setUnassignResults(results);

      // Clear selected companies immediately after processing
      setSelectedCompanies([]);

      // Show notification based on results
      const totalSuccess = results.success.length;
      const totalFailed = results.failed.length;
      const totalNotAssigned = results.notAssigned.length;

      if (totalSuccess > 0) {
        notify({
          type: STATUS.SUCCESS,
          message: `Successfully unassigned standard from ${totalSuccess} compan${totalSuccess === 1 ? 'y' : 'ies'}`
        });
      }

      if (totalFailed > 0) {
        notify({
          type: STATUS.ERROR,
          message: `Failed to unassign standard from ${totalFailed} compan${totalFailed === 1 ? 'y' : 'ies'}`
        });
      }

      if (totalNotAssigned > 0) {
        notify({
          type: STATUS.WARNING,
          message: `Standard was not assigned to ${totalNotAssigned} compan${totalNotAssigned === 1 ? 'y' : 'ies'}`
        });
      }

      // Close modal if all unassignments were successful or not assigned
      if (totalFailed === 0) {
        setTimeout(() => {
          handleModal();
        }, 2000);
      }
    } catch (error) {
      console.error('Error in unassignment:', error);
      notify({
        type: STATUS.ERROR,
        message: MESSAGE.SOMEHING_WENT_WRONG,
        description: 'Failed to unassign standard from companies'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompanyChange = (options: any) => {
    setSelectedCompanies(options || []);
    setErrors(prev => ({ ...prev, companies: undefined }));
  };

  const filteredCompanies =
    companyData?.data
      ?.filter((item: any) => userRole !== 'user-admin' || item.id === companyId || item.parentId === companyId)
      ?.map((item: any) => ({
        value: item.id,
        label: item.name
      })) || [];

  const selectedStandard = questionBankData?.data?.results?.find((standard: any) => standard.id === questionBankId);
  const hasResults =
    unassignResults.success.length > 0 || unassignResults.failed.length > 0 || unassignResults.notAssigned.length > 0;

  return (
    <>
      <Button
        isDisabled={isDisabled}
        fontSize={'0.9em'}
        fontWeight={700}
        w="auto"
        h="44px"
        leftIcon={<Icon as={MdOutlineAssignmentTurnedIn} fontSize={'20px'} />}
        bg="#DC2626"
        color="white"
        onClick={handleModal}
        _hover={{
          opacity: 0.8
        }}
      >
        Unassign Standard
      </Button>

      <Drawer isOpen={isModalOpen} onClose={handleModal} placement="right" size="md">
        <DrawerOverlay />
        <form onSubmit={handleSubmit}>
          <DrawerContent bgColor="#FFF" maxW="500px" w="100%">
            <DrawerHeader
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              borderBottomWidth="1px"
              fontSize="18px"
              fontWeight={600}
            >
              Unassign Standard
              <DrawerCloseButton position={'static'} />
            </DrawerHeader>
            <DrawerBody bgColor="#FFF" p="24px">
              <VStack spacing={4} align="stretch">
                <Box p={4} bg="red.50" borderRadius="md">
                  <Text fontSize="sm" color="red.600">
                    You are about to unassign <strong>{selectedStandard?.name || 'this standard'}</strong> from{' '}
                    <strong>
                      {selectedCompanies.length} compan{selectedCompanies.length === 1 ? 'y' : 'ies'}
                    </strong>
                    . This action cannot be undone.
                  </Text>
                </Box>

                <FormControl isInvalid={!!errors.companies}>
                  <FormLabel>
                    Companies<span style={{ color: 'red' }}>*</span>
                  </FormLabel>
                  <Select
                    components={{ Placeholder }}
                    menuPortalTarget={document.body}
                    styles={{
                      ...customStyles,
                      menuPortal: (base: any) => ({ ...base, zIndex: 9999 })
                    }}
                    placeholder="Select Companies"
                    options={filteredCompanies}
                    isLoading={isCompanyLoading}
                    onChange={handleCompanyChange}
                    value={selectedCompanies}
                    menuPosition="fixed"
                    isDisabled={isSubmitting}
                    isMulti
                  />
                  {errors.companies && <FormErrorMessage>{errors.companies}</FormErrorMessage>}
                </FormControl>

                {hasResults && (
                  <VStack spacing={3} align="stretch">
                    {unassignResults.success.length > 0 && (
                      <Alert status="success">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>Successfully Unassigned!</AlertTitle>
                          <AlertDescription>
                            <Text fontWeight="bold">
                              Standard unassigned from {unassignResults.success.length} compan
                              {unassignResults.success.length === 1 ? 'y' : 'ies'}:
                            </Text>
                            <VStack align="start" mt={2} spacing={1}>
                              {unassignResults.success.map((item, index) => (
                                <Text key={item.companyName} fontSize="sm">
                                  • {item.companyName}
                                </Text>
                              ))}
                            </VStack>
                          </AlertDescription>
                        </Box>
                      </Alert>
                    )}

                    {unassignResults.notAssigned.length > 0 && (
                      <Alert status="warning">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>Not Assigned</AlertTitle>
                          <AlertDescription>
                            <Text fontWeight="bold">
                              Standard was not assigned to {unassignResults.notAssigned.length} compan
                              {unassignResults.notAssigned.length === 1 ? 'y' : 'ies'}:
                            </Text>
                            <VStack align="start" mt={2} spacing={1}>
                              {unassignResults.notAssigned.map((item, index) => (
                                <Text key={item.companyName} fontSize="sm">
                                  • {item.companyName}
                                </Text>
                              ))}
                            </VStack>
                          </AlertDescription>
                        </Box>
                      </Alert>
                    )}

                    {unassignResults.failed.length > 0 && (
                      <Alert status="error">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>Unassignment Failed</AlertTitle>
                          <AlertDescription>
                            <Text fontWeight="bold">
                              Failed to unassign from {unassignResults.failed.length} compan
                              {unassignResults.failed.length === 1 ? 'y' : 'ies'}:
                            </Text>
                            <VStack align="start" mt={2} spacing={1}>
                              {unassignResults.failed.map((item, index) => (
                                <Text key={item.companyName} fontSize="sm">
                                  • {item.companyName}
                                </Text>
                              ))}
                            </VStack>
                          </AlertDescription>
                        </Box>
                      </Alert>
                    )}
                  </VStack>
                )}
              </VStack>
            </DrawerBody>
            <DrawerFooter bgColor="#FAFAFA" borderTop="1px solid #D9D9D9">
              <HStack gap="20px">
                <Button variant="outline" onClick={handleModal} isDisabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  bg={'red.600'}
                  color="white"
                  type="submit"
                  isDisabled={selectedCompanies.length === 0 || isSubmitting}
                  leftIcon={isSubmitting ? <Spinner size="sm" /> : undefined}
                  _hover={{ bg: 'red.700' }}
                >
                  {isSubmitting ? 'Unassigning...' : 'Unassign Standard'}
                </Button>
              </HStack>
            </DrawerFooter>
          </DrawerContent>
        </form>
      </Drawer>
    </>
  );
};

export default UnassignStandard;

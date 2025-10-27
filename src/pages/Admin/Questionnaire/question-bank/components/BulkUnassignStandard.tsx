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
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
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

import CustomModalHeader from '../../../../../components/CustomModalHeader/CustomModalHeader';

interface BulkUnassignStandardProps {
  isDisabled: boolean;
  selectedStandards: number[];
  onClearSelection?: () => void;
}

const BulkUnassignStandard: FC<BulkUnassignStandardProps> = ({ isDisabled, selectedStandards, onClearSelection }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCompanies, setSelectedCompanies] = useState<{ value: number, label: string }[]>([]);
  const [errors, setErrors] = useState<{ companies?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unassignResults, setUnassignResults] = useState<{
    success: { id: number, name: string, companyName: string }[],
    failed: { id: number, name: string, companyName: string }[],
    notAssigned: { id: number, name: string, companyName: string }[]
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
      // Create a map of standard IDs to names using the existing data
      const standardsMap = new Map();

      if (questionBankData?.data?.results) {
        questionBankData.data.results.forEach((standard: any) => {
          standardsMap.set(standard.id, standard.name);
        });
      }

      const results = {
        success: [] as { id: number, name: string, companyName: string }[],
        failed: [] as { id: number, name: string, companyName: string }[],
        notAssigned: [] as { id: number, name: string, companyName: string }[]
      };

      // Create all combinations of standards and companies
      const allUnassignmentPromises: Promise<{
        type: string,
        standardId: number,
        standardName: string,
        companyId: number,
        companyName: string
      }>[] = [];

      selectedStandards.forEach(standardId => {
        selectedCompanies.forEach(company => {
          const promise = unassignStandardFromCompany({
            question_bank_id: standardId,
            company_id: company.value
          })
            .unwrap()
            .then(response => {
              const standardName = standardsMap.get(standardId) || `Standard ${standardId}`;

              if (response.data?.message?.includes('not assigned') || response.data?.message?.includes('not found')) {
                return {
                  type: 'notAssigned',
                  standardId,
                  standardName,
                  companyId: company.value,
                  companyName: company.label
                };
              } else {
                return {
                  type: 'success',
                  standardId,
                  standardName,
                  companyId: company.value,
                  companyName: company.label
                };
              }
            })
            .catch(error => {
              console.error(`Error unassigning standard ${standardId} from company ${company.value}:`, error);
              const standardName = standardsMap.get(standardId) || `Standard ${standardId}`;

              if (error?.data?.message?.includes('not assigned') || error?.data?.message?.includes('not found')) {
                return {
                  type: 'notAssigned',
                  standardId,
                  standardName,
                  companyId: company.value,
                  companyName: company.label
                };
              }

              return { type: 'failed', standardId, standardName, companyId: company.value, companyName: company.label };
            });

          allUnassignmentPromises.push(promise);
        });
      });

      // Wait for all unassignments to complete
      const unassignmentResults = await Promise.all(allUnassignmentPromises);

      // Categorize results
      unassignmentResults.forEach(result => {
        if (result.type === 'success') {
          results.success.push({ id: result.standardId, name: result.standardName, companyName: result.companyName });
        } else if (result.type === 'failed') {
          results.failed.push({ id: result.standardId, name: result.standardName, companyName: result.companyName });
        } else if (result.type === 'notAssigned') {
          results.notAssigned.push({
            id: result.standardId,
            name: result.standardName,
            companyName: result.companyName
          });
        }
      });

      setUnassignResults(results);

      // Show notification based on results
      const totalSuccess = results.success.length;
      const totalFailed = results.failed.length;
      const totalNotAssigned = results.notAssigned.length;

      if (totalSuccess > 0) {
        notify({
          type: STATUS.SUCCESS,
          message: `Successfully unassigned ${totalSuccess} standard-company combination${totalSuccess > 1 ? 's' : ''}`
        });
      }

      if (totalFailed > 0) {
        notify({
          type: STATUS.ERROR,
          message: `Failed to unassign ${totalFailed} standard-company combination${totalFailed > 1 ? 's' : ''}`
        });
      }

      if (totalNotAssigned > 0) {
        notify({
          type: STATUS.WARNING,
          message: `${totalNotAssigned} standard-company combination${
            totalNotAssigned > 1 ? 's were' : ' was'
          } not assigned`
        });
      }

      // Close modal if all unassignments were successful or not assigned
      if (totalFailed === 0) {
        setTimeout(() => {
          handleModal();
          // Clear the selection after successful unassignment
          if (onClearSelection) {
            onClearSelection();
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error in bulk unassignment:', error);
      notify({
        type: STATUS.ERROR,
        message: MESSAGE.SOMEHING_WENT_WRONG,
        description: 'Failed to unassign standards from companies'
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
        Unassign Standards ({selectedStandards.length})
      </Button>

      <Modal isOpen={isModalOpen} onClose={handleModal} isCentered size="xl">
        <ModalOverlay />
        <form onSubmit={handleSubmit}>
          <ModalContent bgColor="#FFF" maxW="600px" w="100%" h="auto" borderRadius={'16px'}>
            <CustomModalHeader title="Bulk Unassign Standards" />
            <ModalBody bgColor="#FFF">
              <VStack spacing={4} align="stretch">
                <Box p={4} bg="red.50" borderRadius="md">
                  <Text fontSize="sm" color="red.600">
                    You are about to unassign{' '}
                    <strong>
                      {selectedStandards.length} standard{selectedStandards.length > 1 ? 's' : ''}
                    </strong>{' '}
                    from{' '}
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
                    styles={customStyles}
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
                              {unassignResults.success.length} combination
                              {unassignResults.success.length > 1 ? 's' : ''} unassigned successfully:
                            </Text>
                            <VStack align="start" mt={2} spacing={1}>
                              {unassignResults.success.map((item, index) => (
                                <Text key={`${item.id}-${item.companyName}`} fontSize="sm">
                                  • {item.name} from {item.companyName}
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
                              {unassignResults.notAssigned.length} combination
                              {unassignResults.notAssigned.length > 1 ? 's were' : ' was'} not assigned:
                            </Text>
                            <VStack align="start" mt={2} spacing={1}>
                              {unassignResults.notAssigned.map((item, index) => (
                                <Text key={`${item.id}-${item.companyName}`} fontSize="sm">
                                  • {item.name} from {item.companyName}
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
                              Failed to unassign {unassignResults.failed.length} combination
                              {unassignResults.failed.length > 1 ? 's' : ''}:
                            </Text>
                            <VStack align="start" mt={2} spacing={1}>
                              {unassignResults.failed.map((item, index) => (
                                <Text key={`${item.id}-${item.companyName}`} fontSize="sm">
                                  • {item.name} from {item.companyName}
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
            </ModalBody>
            <ModalFooter bgColor="#FAFAFA" borderTop="1px solid #D9D9D9">
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
                  {isSubmitting ? 'Unassigning...' : 'Unassign Standards'}
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  );
};

export default BulkUnassignStandard;

import { FC, useState } from 'react';
import { MdOutlineAssignment } from 'react-icons/md';
import {
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
  Text,
  VStack,
  Spinner,
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider
} from '@chakra-ui/react';
import Select from 'react-select';
import { companyApi } from '@/store/api/company/companyApi';
import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';
import { useAppSelector } from '@/store/hooks';
import { selectUserRole } from '@/store/slices/user/userSelectors';
import { customStyles, Placeholder } from '@/components/common/InputOption';
import CustomModalHeader from '../../../../../components/CustomModalHeader/CustomModalHeader';
import WebSearch from '../../../../../components/common/WebSearch';
import { useAppContext } from '@/context/AppContext';
import { STATUS, MESSAGE } from '@/constants';

interface BulkAssignStandardProps {
  isDisabled: boolean;
  selectedStandards: number[];
  onClearSelection?: () => void;
}

const BulkAssignStandard: FC<BulkAssignStandardProps> = ({ isDisabled, selectedStandards, onClearSelection }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCompany, setSelectedCompany] = useState<{ value: number; label: string } | null>(null);
  const [errors, setErrors] = useState<{ company?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignResults, setAssignResults] = useState<{
    success: { id: number; name: string }[];
    failed: { id: number; name: string }[];
    alreadyAssigned: { id: number; name: string }[];
  }>({ success: [], failed: [], alreadyAssigned: [] });
  
  const userRole = useAppSelector(selectUserRole);
  const companyId = Number(sessionStorage.getItem("companyId"));
  const { data: companyData, isLoading: isCompanyLoading } = companyApi.useGetAllCompaniesQuery({});
  const { data: questionBankData } = questionnaireApi.useGetQuestionnaireBankListQuery({
    page: 1,
    max_results: 1000,
    search: ''
  }, {
    skip: !isModalOpen
  });
  const [assignStandardToCompany] = questionnaireApi.useAssignStandardToCompanyMutation();
  const { notify } = useAppContext();

  // Get the selected standards names for web search
  const selectedStandardsNames = questionBankData?.data?.results
    ?.filter((standard: any) => selectedStandards.includes(standard.id))
    ?.map((standard: any) => standard.name)
    ?.join(', ') || 'ESG Standards';

  const handleModal = () => {
    setIsModalOpen(!isModalOpen);
    setSelectedCompany(null);
    setErrors({});
    setAssignResults({ success: [], failed: [], alreadyAssigned: [] });
  };

  const validateForm = () => {
    const newErrors: { company?: string } = {};
    
    if (!selectedCompany) {
      newErrors.company = 'Company is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setAssignResults({ success: [], failed: [], alreadyAssigned: [] });

    try {
      // Create a map of standard IDs to names using the existing data
      const standardsMap = new Map();
      
      if (questionBankData?.data?.results) {
        questionBankData.data.results.forEach((standard: any) => {
          standardsMap.set(standard.id, standard.name);
        });
      }

      const results = {
        success: [] as { id: number; name: string }[],
        failed: [] as { id: number; name: string }[],
        alreadyAssigned: [] as { id: number; name: string }[]
      };

      // Make all API calls in parallel
      const assignmentPromises = selectedStandards.map(async (standardId) => {
        try {
          const response = await assignStandardToCompany({
            question_bank_id: standardId,
            company_id: selectedCompany!.value
          }).unwrap();

          const standardName = standardsMap.get(standardId) || `Standard ${standardId}`;
          
          if (response.data?.message?.includes('already assigned')) {
            return { type: 'alreadyAssigned', id: standardId, name: standardName };
          } else {
            return { type: 'success', id: standardId, name: standardName };
          }
        } catch (error: any) {
          console.error(`Error assigning standard ${standardId}:`, error);
          const standardName = standardsMap.get(standardId) || `Standard ${standardId}`;
          return { type: 'failed', id: standardId, name: standardName };
        }
      });

      // Wait for all assignments to complete
      const assignmentResults = await Promise.all(assignmentPromises);

      // Categorize results
      assignmentResults.forEach(result => {
        if (result.type === 'success') {
          results.success.push({ id: result.id, name: result.name });
        } else if (result.type === 'failed') {
          results.failed.push({ id: result.id, name: result.name });
        } else if (result.type === 'alreadyAssigned') {
          results.alreadyAssigned.push({ id: result.id, name: result.name });
        }
      });

      setAssignResults(results);

      // Show notification based on results
      const totalSuccess = results.success.length;
      const totalFailed = results.failed.length;
      const totalAlreadyAssigned = results.alreadyAssigned.length;

      if (totalSuccess > 0) {
        notify({
          type: STATUS.SUCCESS,
          message: `Assigned ${totalSuccess} standard${totalSuccess > 1 ? 's' : ''} to company successfully.`
        });
      }

      if (totalFailed > 0) {
        notify({
          type: STATUS.ERROR,
          message: `Failed to assign ${totalFailed} standard${totalFailed > 1 ? 's' : ''}`
        });
      }

      if (totalAlreadyAssigned > 0) {
        notify({
          type: STATUS.WARNING,
          message: `${totalAlreadyAssigned} standard${totalAlreadyAssigned > 1 ? 's were' : ' was'} already assigned`
        });
      }

      // Close modal if all assignments were successful or already assigned
      if (totalFailed === 0) {
        setTimeout(() => {
          handleModal();
          // Clear the selection after successful assignment
          if (onClearSelection) {
            onClearSelection();
          }
        }, 2000);
      }
    } catch (error) {
      console.error('Error in bulk assignment:', error);
      notify({
        type: STATUS.ERROR,
        message: MESSAGE.SOMEHING_WENT_WRONG,
        description: 'Failed to assign standards to company'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompanyChange = (option: any) => {
    setSelectedCompany(option);
    setErrors(prev => ({ ...prev, company: undefined }));
  };

  const filteredCompanies = companyData?.data?.filter(
    (item: any) => userRole !== "user-admin" || item.id === companyId || item.parentId === companyId
  )?.map((item: any) => ({
    value: item.id,
    label: item.name,
  })) || [];

  const hasResults = assignResults.success.length > 0 || assignResults.failed.length > 0 || assignResults.alreadyAssigned.length > 0;

  return (
    <>
      <Button
        isDisabled={isDisabled}
        fontSize={'0.9em'}
        fontWeight={700}
        w="auto"
        h="44px"
        leftIcon={<Icon as={MdOutlineAssignment} fontSize={'20px'} />}
        bg="#137E59"
        onClick={handleModal}
        _hover={{
          opacity: 0.8
        }}
      >
        Assign Standards ({selectedStandards.length})
      </Button>

      <Modal isOpen={isModalOpen} onClose={handleModal} isCentered size="xl">
        <ModalOverlay />
        <form onSubmit={handleSubmit}>
          <ModalContent bgColor="#FFF" maxW="700px" w="100%" h="auto" borderRadius={'16px'}>
            <CustomModalHeader title="Bulk Assign Standards" />
            <ModalBody bgColor="#FFF">
              <VStack spacing={4} align="stretch">
                <Box p={4} bg="blue.50" borderRadius="md">
                  <Text fontSize="sm" color="blue.600">
                    You are about to assign <strong>{selectedStandards.length} standard{selectedStandards.length > 1 ? 's' : ''}</strong> to a company.
                  </Text>
                </Box>

                <FormControl isInvalid={!!errors.company}>
                  <FormLabel>Company<span style={{ color: 'red' }}>*</span></FormLabel>
                  <Select
                    components={{ Placeholder }}
                    styles={customStyles}
                    placeholder="Select Company"
                    options={filteredCompanies}
                    isLoading={isCompanyLoading}
                    onChange={handleCompanyChange}
                    value={selectedCompany}
                    menuPosition="fixed"
                    isDisabled={isSubmitting}
                  />
                  {errors.company && <FormErrorMessage>{errors.company}</FormErrorMessage>}
                </FormControl>

                {/* Web Search Component */}
                <Box>
                  <WebSearch 
                    companyName={selectedCompany?.label || ''}
                    standardName={selectedStandardsNames}
                    isCollapsible={true}
                  />
                </Box>

                <Divider />

                {hasResults && (
                  <VStack spacing={3} align="stretch">
                    {assignResults.success.length > 0 && (
                      <Alert status="success">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>Assignment Successful</AlertTitle>
                          <AlertDescription>
                            <Text fontWeight="bold">Successfully assigned {assignResults.success.length} standard{assignResults.success.length > 1 ? 's' : ''}:</Text>
                            <VStack align="start" mt={2} spacing={1}>
                              {assignResults.success.map((standard, index) => (
                                <Text key={standard.id} fontSize="sm">• {standard.name}</Text>
                              ))}
                            </VStack>
                          </AlertDescription>
                        </Box>
                      </Alert>
                    )}

                    {assignResults.alreadyAssigned.length > 0 && (
                      <Alert status="warning">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>Already Assigned</AlertTitle>
                          <AlertDescription>
                            <Text fontWeight="bold">{assignResults.alreadyAssigned.length} standard{assignResults.alreadyAssigned.length > 1 ? 's were' : ' was'} already assigned:</Text>
                            <VStack align="start" mt={2} spacing={1}>
                              {assignResults.alreadyAssigned.map((standard, index) => (
                                <Text key={standard.id} fontSize="sm">• {standard.name}</Text>
                              ))}
                            </VStack>
                          </AlertDescription>
                        </Box>
                      </Alert>
                    )}

                    {assignResults.failed.length > 0 && (
                      <Alert status="error">
                        <AlertIcon />
                        <Box>
                          <AlertTitle>Assignment Failed</AlertTitle>
                          <AlertDescription>
                            <Text fontWeight="bold">Failed to assign {assignResults.failed.length} standard{assignResults.failed.length > 1 ? 's' : ''}:</Text>
                            <VStack align="start" mt={2} spacing={1}>
                              {assignResults.failed.map((standard, index) => (
                                <Text key={standard.id} fontSize="sm">• {standard.name}</Text>
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
                <Button 
                  variant="outline" 
                  onClick={handleModal} 
                  isDisabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  bg={'primary'} 
                  type="submit"
                  isDisabled={!selectedCompany || isSubmitting}
                  leftIcon={isSubmitting ? <Spinner size="sm" /> : undefined}
                >
                  {isSubmitting ? 'Assigning...' : 'Assign Standards'}
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  );
};

export default BulkAssignStandard; 
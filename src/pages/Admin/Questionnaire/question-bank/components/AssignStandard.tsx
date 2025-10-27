import { FC, useState } from 'react';
import { MdCloudUpload, MdDescription, MdOutlineAdd } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import {
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Icon,
  Input,
  Progress,
  Spinner,
  Text,
  useToast,
  VStack
} from '@chakra-ui/react';

import API from '@/api';
import { customStyles, Placeholder } from '@/components/common/InputOption';
import { companyApi } from '@/store/api/company/companyApi';
import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';
import { useAppSelector } from '@/store/hooks';
import { selectUserRole } from '@/store/slices/user/userSelectors';

import WebSearch from '../../../../../components/common/WebSearch';

const AssignStandard: FC<{
  disableUploadDocsButton?: boolean,
  isDisabled: boolean,
  questionBankId: number,
  isModalOpen2?: boolean,
  onClose?: () => void
}> = ({ disableUploadDocsButton, isDisabled, questionBankId, isModalOpen2, onClose }) => {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<{ value: number, label: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<{ company?: string, file?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
  const navigate = useNavigate();
  const userRole = useAppSelector(selectUserRole);
  const companyId = Number(sessionStorage.getItem('companyId'));
  const { data: companyData, isLoading: isCompanyLoading } = companyApi.useGetAllCompaniesQuery({});
  const { data: questionBankData } = questionnaireApi.useGetQuestionnaireBankListQuery(
    {
      page: 1,
      max_results: 1000,
      search: ''
    },
    {
      skip: !isModalOpen
    }
  );
  const [generateQuestionnaire] = questionnaireApi.useGenerateQuestionnaireMutation();

  // Get the selected standard name for web search
  const selectedStandardName =
    questionBankData?.data?.results?.find((standard: any) => standard.id === questionBankId)?.name || 'ESG Standard';

  const handleModal = () => {
    setIsModalOpen(!isModalOpen);
    setSelectedFile(null);
    setSelectedCompany(null);
    setErrors({});
    setUploadProgress(0);
    setUploadStatus('idle');
  };

  const validateForm = () => {
    const newErrors: { company?: string, file?: string } = {};

    if (!selectedCompany) {
      newErrors.company = 'Company is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      // First, make the compulsory generateQuestionnaire API call
      setIsSubmitting(true);

      await generateQuestionnaire({
        company_id: selectedCompany?.value,
        question_bank_id: questionBankId
      });

      // If a file is selected, make the optional AI answer API call
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (selectedFile) {
        setUploadStatus('uploading');
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('company_id', selectedCompany?.value.toString() || '');
        formData.append('question_id', questionBankId.toString());
        formData.append('email', user.email || '');
        formData.append('user_id', user.id || '');

        setUploadStatus('uploading');
        await API.aiAnswerFromDocument(formData, progress => {
          setUploadProgress(progress);
        });
        setUploadStatus('completed');
      }

      // If disableUploadDocsButton is true, redirect after upload is complete
      if (disableUploadDocsButton && selectedCompany?.value) {
        navigate(`/admin/view-question-bank/${questionBankId}/${selectedCompany.value}`);
        handleModal(); // Close the drawer
        return;
      }

      // For normal flow (disableUploadDocsButton is false), just close the modal
      handleModal();

      toast({
        title: 'File uploaded Successfully',
        status: 'success',
        position: 'bottom-right',
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setUploadStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setErrors(prev => ({ ...prev, file: undefined }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (
      file &&
      (file.type === 'application/pdf' ||
        file.type === 'application/msword' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    ) {
      setSelectedFile(file);
      setErrors(prev => ({ ...prev, file: undefined }));
    }
  };

  const handleCompanyChange = (option: any) => {
    setSelectedCompany(option);
    setErrors(prev => ({ ...prev, company: undefined }));
  };

  const filteredCompanies =
    companyData?.data
      ?.filter((item: any) => userRole !== 'user-admin' || item.id === companyId || item.parentId === companyId)
      ?.map((item: any) => ({
        value: item.id,
        label: item.name
      })) || [];

  return (
    <>
      {!disableUploadDocsButton && (
        <Button
          isDisabled={isDisabled}
          fontSize={'0.9em'}
          fontWeight={700}
          w="auto"
          h="44px"
          leftIcon={<Icon as={MdOutlineAdd} fontSize={'20px'} />}
          bg="#137E59"
          onClick={handleModal}
          _hover={{
            opacity: 0.8
          }}
        >
          Upload Docs
        </Button>
      )}

      <Drawer
        isOpen={isModalOpen || isModalOpen2 || false}
        onClose={onClose || handleModal}
        placement="right"
        size="lg"
      >
        <DrawerOverlay />
        <form onSubmit={handleSubmit}>
          <DrawerContent bgColor="#FFF" maxW="700px" w="100%">
            <DrawerHeader
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              borderBottomWidth="1px"
              fontSize="18px"
              fontWeight={600}
            >
              Upload Docs
              <DrawerCloseButton position={'static'} />
            </DrawerHeader>
            <DrawerBody bgColor="#FFF" p="24px">
              <VStack spacing={6} align="stretch">
                <FormControl isInvalid={!!errors.company}>
                  <FormLabel>
                    Company<span style={{ color: 'red' }}>*</span>
                  </FormLabel>
                  <Select
                    components={{ Placeholder }}
                    menuPortalTarget={document.body}
                    styles={{
                      ...customStyles,
                      menuPortal: (base: any) => ({ ...base, zIndex: 9999 })
                    }}
                    placeholder="Select Company"
                    options={filteredCompanies}
                    isLoading={isCompanyLoading}
                    onChange={handleCompanyChange}
                    value={selectedCompany}
                    menuPosition="fixed"
                  />
                  {errors.company && <FormErrorMessage>{errors.company}</FormErrorMessage>}
                </FormControl>

                {/* Web Search Component */}
                <Box>
                  <WebSearch
                    companyName={selectedCompany?.label || ''}
                    standardName={selectedStandardName}
                    isCollapsible={true}
                  />
                </Box>

                <Divider />

                <FormControl>
                  <FormLabel>Upload Document (Optional)</FormLabel>
                  <Box
                    border="2px dashed"
                    borderColor={isDragging ? 'blue.400' : 'gray.200'}
                    borderRadius="lg"
                    p={8}
                    textAlign="center"
                    position="relative"
                    transition="all 0.3s ease"
                    bg={isDragging ? 'blue.50' : 'transparent'}
                    _hover={{ borderColor: 'blue.400', bg: 'blue.50' }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      opacity={0}
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      width="100%"
                      height="100%"
                      cursor="pointer"
                    />
                    <VStack spacing={3}>
                      <Icon
                        as={selectedFile ? MdDescription : MdCloudUpload}
                        fontSize="48px"
                        color={selectedFile ? 'green.500' : 'gray.400'}
                      />
                      {selectedFile ? (
                        <VStack spacing={1}>
                          <Text fontWeight="bold" color="green.500">
                            File Selected
                          </Text>
                          <Text fontSize="sm" color="gray.600">
                            {selectedFile.name}
                          </Text>
                        </VStack>
                      ) : (
                        <VStack spacing={1}>
                          <Text fontWeight="bold">Drag and drop your document here</Text>
                          <Text fontSize="sm" color="gray.500">
                            or click to browse
                          </Text>
                          <Text fontSize="xs" color="gray.400" mt={2}>
                            Supported formats: PDF, DOC, DOCX
                          </Text>
                        </VStack>
                      )}
                    </VStack>
                  </Box>
                </FormControl>

                <Box p={4} bg="blue.50" borderRadius="md">
                  <Text fontSize="sm" color="blue.600">
                    Our AI will analyze your document and provide the answer suggestions in the questionnaire.
                  </Text>
                </Box>

                {uploadStatus !== 'idle' && (
                  <Box p={4} borderRadius="lg" bg="gray.50">
                    <VStack spacing={3} align="stretch">
                      <Flex justify="space-between" align="center">
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color={
                            uploadStatus === 'error'
                              ? 'red.500'
                              : uploadStatus === 'completed'
                                ? 'green.500'
                                : 'blue.500'
                          }
                        >
                          {uploadStatus === 'uploading' && 'Uploading Document...'}
                          {uploadStatus === 'processing' && 'Processing Document...'}
                          {uploadStatus === 'completed' && 'Upload Complete!'}
                          {uploadStatus === 'error' && 'Upload Failed'}
                        </Text>
                        <CircularProgress value={uploadProgress} color="blue.400" size="40px" thickness="8px">
                          <CircularProgressLabel>{uploadProgress}%</CircularProgressLabel>
                        </CircularProgress>
                      </Flex>
                      <Progress
                        value={uploadProgress}
                        size="sm"
                        borderRadius="full"
                        colorScheme={uploadStatus === 'error' ? 'red' : uploadStatus === 'completed' ? 'green' : 'blue'}
                        hasStripe
                        isAnimated
                      />
                    </VStack>
                  </Box>
                )}
              </VStack>
            </DrawerBody>
            <DrawerFooter bgColor="#FAFAFA" borderTop="1px solid #D9D9D9">
              <HStack gap="20px">
                <Button
                  variant="outline"
                  onClick={onClose || handleModal}
                  isDisabled={isSubmitting || uploadStatus === 'uploading'}
                >
                  Cancel
                </Button>
                <Button
                  bg={'primary'}
                  type="submit"
                  isDisabled={!selectedCompany || isSubmitting || uploadStatus === 'uploading'}
                  leftIcon={isSubmitting ? <Spinner size="sm" /> : undefined}
                >
                  {isSubmitting ? 'Submitting...' : disableUploadDocsButton ? 'Assign Users' : 'Submit'}
                </Button>
              </HStack>
            </DrawerFooter>
          </DrawerContent>
        </form>
      </Drawer>
    </>
  );
};

export default AssignStandard;

//@ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Controller, useForm } from 'react-hook-form';
import { AiOutlineUpload } from 'react-icons/ai';
import { FaDropbox, FaGoogleDrive, FaMicrosoft, FaShareSquare } from 'react-icons/fa';
import { FiFile } from 'react-icons/fi';
import { LiaFileUploadSolid } from 'react-icons/lia';
import { MdClose, MdNewspaper } from 'react-icons/md';
import Select from 'react-select';
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Text,
  useDisclosure,
  useStyleConfig
} from '@chakra-ui/react';
import * as yup from 'yup';

import { STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/user/userSelectors';
import { Company } from '@/types/common';
import { yupResolver } from '@hookform/resolvers/yup';

import CustomModalHeader from '../CustomModalHeader/CustomModalHeader';
import ActionButton from './ActionButton';

const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
const REDIRECT_URI = 'https://example.com/oauth2callback';
const SCOPE = 'https://www.googleapis.com/auth/drive.readonly';

function getGoogleAuthURL() {
  const rootUrl = 'https://accounts.google.com/o/oauth2/auth';
  const options = {
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: SCOPE
  };
  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}

const schema = yup.object().shape({
  files: yup
    .array()
    .of(yup.mixed().required('File is required'))
    .max(1, 'You can upload only one file')
    .required('File(s) required'),
  questionBankId: yup
    .object()
    .shape({
      value: yup.string().required(),
      label: yup.string()
    })
    .nullable()
    .required('Disclosure year is required')
});

interface FormData {
  files: File[];
  questionBankId: { value: string, label: string } | null;
}

interface IGenerateFileModal {
  company: Company;
  bankId?: string | number; // Optional prop
}

const GenerateFileModal: React.FC<IGenerateFileModal> = ({ company }) => {
  const { notify, confirm } = useAppContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const textEllipsisStyles = useStyleConfig('TextEllipsis');
  const [uploadFileLoading, setUploadFileLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    getValues,
    formState: { errors }
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      files: [],
      questionBankId: null
    }
  });

  const files = watch('files');
  const user = useAppSelector(selectUser);
  const [questionBanks, setQuestionBanks] = useState<any[]>([]);

  const { data, isLoading, error } = questionnaireApi.useGetQuestionnaireBankListQuery({
    page: 1,
    max_results: 500,
    sort_by: null,
    search: ''
  });

  useEffect(() => {
    if (data?.data?.results) {
      setQuestionBanks(data?.data?.results);
    }
    if (error) {
      console.error('Error fetching question banks:', error);
    }
  }, [data, error]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    onDrop: acceptedFiles => {
      const existingFiles = watch('files') || [];
      const combinedFiles = [...existingFiles, ...acceptedFiles].slice(0, 5);
      setValue('files', combinedFiles, { shouldValidate: true });
    }
  });

  const [generateQuestionnaire] = questionnaireApi.useGenerateQuestionnaireMutation();

  // This function actually generates the report.
  const doGenerateReport = async (questionBankId: number) => {
    try {
      const response = await generateQuestionnaire({
        question_bank_id: questionBankId,
        company_id: company?.id
      });

      if (response?.data?.message === 'success') {
        // If there is a file attached, optionally confirm upload of file answers.
        if (files.length > 0) {
          confirm({
            type: STATUS.APPROVED,
            title: 'Generate Report Answers',
            message: `Questionnaire generated and users assigned! Do you confirm to upload file of answers?`,
            onOk: () => handleGenerateAnswers(questionBankId),
            okBtnLabel: 'Confirm'
          });
        } else {
          notify({ type: STATUS.SUCCESS, message: 'Questionnaire generated and users assigned!' });
        }
        reset();
        onClose();
      } else {
        const errMSG = response?.error?.data?.message || 'Failed to generate the questionnaire report';
        notify({ type: STATUS.ERROR, message: errMSG });
      }
    } catch (error) {
      console.log('Error generating report:', error);
      notify({ type: STATUS.ERROR, message: 'Error generating the report' });
    }
  };

  // This function checks if file is attached and shows a confirmation if not.
  const handleGenerateReport = async (questionBankId: number) => {
    setUploadFileLoading(true);
    try {
      if (files.length === 0) {
        // No file attached: confirm before generating the report.
        confirm({
          type: STATUS.APPROVED,
          title: 'Assign Users Without File',
          message: 'Are you sure you want to Assign Users without file attached ?',
          onOk: () => doGenerateReport(questionBankId),
          okBtnLabel: 'Confirm'
        });
      } else {
        // File is attached: generate report immediately.
        await doGenerateReport(questionBankId);
      }
    } catch (error) {
      console.log('Error in handleGenerateReport:', error);
    } finally {
      setUploadFileLoading(false);
    }
  };

  const handleGenerateAnswers = async (questionBankId: number) => {
    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('email', user.email);
    formData.append('question_id', questionBankId.toString());
    formData.append('user_id', user.id);
    formData.append('company_id', company?.id.toString());
    try {
      fetch('https://esgreporting-aianswers.greenfi.ai/auto-answer', {
        method: 'POST',
        body: formData
      });
      notify({
        type: STATUS.SUCCESS,
        message: `Answers are generating! You'll be notified on email when it will finish!`
      });
    } catch (error) {
      notify({ type: STATUS.ERROR, message: 'Error generating answers' });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleConnectGoogleDrive = () => {
    window.location.href = getGoogleAuthURL();
  };

  return (
    <>
      <Flex>
        <ActionButton
          borderBottom="1px solid var(--day-5, #D9D9D9)"
          withBorder={false}
          leftIcon={<MdNewspaper />}
          onClick={onOpen}
        >
          Assign Users
        </ActionButton>
      </Flex>

      <Modal isOpen={isOpen} onClose={handleClose} isCentered>
        <ModalOverlay />
        <form>
          <ModalContent bg="white" minW="500px" boxShadow="xl">
            <CustomModalHeader hideBorder title="Assign Users" />
            <ModalBody p={6}>
              <Flex flexDirection="column" alignItems="center" gap={4}>
                <Controller
                  name="questionBankId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      isLoading={isLoading}
                      placeholder="Select Question Bank"
                      options={questionBanks.map(item => ({
                        value: item.id,
                        label: item.name
                      }))}
                      isClearable
                      styles={{
                        control: base => ({
                          ...base,
                          borderColor: errors.questionBankId ? 'red' : 'gray.300',
                          '&:hover': { borderColor: 'blue.400' },
                          width: '450px'
                        })
                      }}
                    />
                  )}
                />
                {errors.questionBankId && (
                  <Text marginRight="auto" color="red.500">
                    {errors.questionBankId.message}
                  </Text>
                )}

                <Flex flexDirection="column" gap={4} width="100%">
                  <HStack wrap="wrap" gap={2} justify="space-between" width="100%">
                    <Button
                      w="48%"
                      leftIcon={<LiaFileUploadSolid />}
                      color="grey"
                      onClick={handleFileButtonClick}
                      variant="outline"
                    >
                      Upload from System
                    </Button>
                    <Button
                      w="48%"
                      leftIcon={<FaGoogleDrive />}
                      color="grey"
                      variant="outline"
                      onClick={handleConnectGoogleDrive}
                    >
                      Connect to Google Drive
                    </Button>
                  </HStack>
                  <HStack wrap="wrap" gap={2} justify="space-between" width="100%">
                    <Button w="48%" leftIcon={<FaDropbox />} color="grey" variant="outline" isDisabled>
                      Connect to Dropbox
                    </Button>
                    <Button w="48%" leftIcon={<FaMicrosoft />} color="grey" variant="outline" isDisabled>
                      Connect to OneDrive
                    </Button>
                  </HStack>
                  <Button w="100%" leftIcon={<FaShareSquare />} color="grey" variant="outline" isDisabled>
                    Connect to SharePoint
                  </Button>
                </Flex>

                <Box
                  {...getRootProps()}
                  p={6}
                  borderWidth={2}
                  h="110px"
                  borderRadius="md"
                  borderColor={errors.files ? 'red.500' : 'gray.300'}
                  borderStyle="dashed"
                  textAlign="center"
                  justifyContent="center"
                  bg={isDragActive ? 'gray.100' : 'gray.50'}
                  cursor="pointer"
                  width="100%"
                  ref={fileInputRef}
                >
                  <input {...getInputProps()} />
                  {files.length > 0 ? (
                    <Text maxW="200px" margin="0 auto" color="gray">
                      Drop more file or click to add
                    </Text>
                  ) : (
                    <Text maxW="200px" margin="0 auto" color="gray">
                      Drag and drop file here, or click to upload (max 1)
                    </Text>
                  )}
                </Box>
                {errors.files && (
                  <Text marginRight="auto" color="red.500">
                    {errors.files.message as React.ReactNode}
                  </Text>
                )}

                {files.map((f, index) => (
                  <Flex key={index} alignItems="center" gap={2} bg="gray.50" p={3} borderRadius="md" width="100%">
                    <Icon as={FiFile} fontSize="1.2em" />
                    <Text sx={{ ...textEllipsisStyles, flex: 1 }} fontWeight="semibold" color="#137E59">
                      {f.name}
                    </Text>
                    <Icon
                      as={MdClose}
                      cursor="pointer"
                      color="red.500"
                      onClick={() => {
                        const updatedFiles = files.filter((_, i) => i !== index);
                        setValue('files', updatedFiles, { shouldValidate: true });
                      }}
                    />
                  </Flex>
                ))}
              </Flex>
            </ModalBody>

            <ModalFooter borderTop="1px solid #D9D9D9" gap={5}>
              <Button onClick={handleClose} bg="#fff" color="#254000">
                Close
              </Button>
              <Button
                type="button"
                isLoading={uploadFileLoading}
                bg="#137E59"
                color="white"
                leftIcon={<AiOutlineUpload />}
                _hover={{ bg: '#004494' }}
                onClick={handleSubmit(data =>
                  handleGenerateReport(getValues('questionBankId')?.value)
                )}
              >
                Confirm
              </Button>
            </ModalFooter>
          </ModalContent>
        </form>
      </Modal>
    </>
  );
};

export default GenerateFileModal;

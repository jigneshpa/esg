import { FC, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FaMagic, FaRobot } from 'react-icons/fa';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import {
  Box,
  Button,
  Card,
  CardBody,
  Collapse,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  VStack
} from '@chakra-ui/react';
import mammoth from 'mammoth';

import { FileUpload } from '@/components';
import DocViewer, { DocViewerRenderers } from '@cyntler/react-doc-viewer';

interface ITextBox {
  title: string;
  question?: boolean;
  parentQuestion?: any;
  mode?: string;
  errors?: any;
  answer?: string;
  remarks?: string;
  index?: number;
  displayIndex?: string;
  isDisabledOnEditMode?: boolean;
  files?: { url?: string, name?: string };
  dwonloadUrl: () => void;
  handleView: () => void;
  isRequired?: boolean;
  hasAttachment?: boolean;
  hasRemarks?: boolean;
  isQuestionEditMode?: boolean;
  ai_suggested_answers?: string[];
  questionData?: any;
}

const TextBox: FC<ITextBox> = ({
  title,
  question,
  parentQuestion,
  mode,
  errors,
  answer,
  remarks,
  displayIndex = '',
  isDisabledOnEditMode,
  files,
  dwonloadUrl,
  handleView,
  isRequired,
  hasAttachment,
  hasRemarks,
  isQuestionEditMode,
  ai_suggested_answers = [],
  questionData
}) => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);
  const { register, setValue, trigger, watch } = useFormContext();
  const [isUpload, setIsUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const [isDocxLoading, setIsDocxLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // NEW: State for modal

  const isAnswerMode = mode === 'answer' || mode === 'view';

  const getFileExtension = (file: File): string => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    console.log(`File: ${file.name}, Extension: ${extension}`);
    return extension;
  };

  // Parse .docx files with mammoth.js
  useEffect(() => {
    if (selectedFiles.length && getFileExtension(selectedFiles[0]) === 'docx') {
      console.log('Processing .docx file with mammoth.js');
      setIsDocxLoading(true);
      setDocxHtml(null);
      const reader = new FileReader();
      reader.onload = async e => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        try {
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setDocxHtml(result.value);
          setViewerError(null);
          console.log('Mammoth.js parsed .docx successfully');
        } catch (error) {
          console.error('Mammoth.js error:', error);
          setViewerError('Failed to parse .docx file. Please try another file.');
        } finally {
          setIsDocxLoading(false);
        }
      };
      reader.onerror = () => {
        console.error('FileReader error');
        setViewerError('Error reading .docx file.');
        setIsDocxLoading(false);
      };
      reader.readAsArrayBuffer(selectedFiles[0]);
    } else {
      setDocxHtml(null);
      setIsDocxLoading(false);
    }
  }, [selectedFiles]);

  useEffect(() => {
    if (selectedFiles.length) {
      const url = URL.createObjectURL(selectedFiles[0]);
      console.log(`Generated blob URL: ${url}`);
      setFileUrl(url);
      setViewerError(null);
      return () => {
        console.log(`Revoking blob URL: ${url}`);
        URL.revokeObjectURL(url);
      };
    } else {
      setFileUrl(null);
      setViewerError(null);
      setIsDocxLoading(false);
    }
  }, [selectedFiles]);

  useEffect(() => {
    if (window.location.pathname.includes('/question-bank/')) {
      setValue('content', '', {
        shouldValidate: true,
        shouldDirty: false,
        shouldTouch: false
      });
      return;
    }
    if (answer !== undefined) {
      setValue('content', answer === '{}' ? '' : answer, {
        // setValue('content', '', {
        shouldValidate: true,
        shouldDirty: false,
        shouldTouch: false
      });
    }
  }, [answer, setValue, mode]);

  useEffect(() => {
    if (remarks !== undefined) {
      setValue('remarks', remarks === '{}' ? '' : remarks, {
        shouldValidate: true,
        shouldDirty: false,
        shouldTouch: false
      });
    }
  }, [remarks, mode, setValue]);

  useEffect(() => {
    if (selectedFiles?.length) {
      setValue('files', selectedFiles);
      trigger('files');
    } else {
      setValue('files', []);
      trigger('files');
    }
  }, [selectedFiles, setValue, trigger]);

  const labelStyles = useMemo(
    () => ({
      borderBottom: isAnswerMode ? '1px solid #DEDEDE' : undefined,
      height: isAnswerMode ? '100%' : undefined,
      backgroundColor: isAnswerMode ? '#FAFAFA' : undefined,
      fontSize: '16px',
      color: isAnswerMode ? '#1C3E57' : '#262626',
      opacity: '1 !important'
    }),
    [isAnswerMode]
  );

  useEffect(() => {
    if (isQuestionEditMode) {
      setIsEditMode(isQuestionEditMode);
    }
  }, [isQuestionEditMode]);

  return (
    <VStack spacing={4}>
      <FormControl isInvalid={isAnswerMode && errors?.content}>
        {/*@ts-ignore*/}
        <FormLabel {...labelStyles} mx={isAnswerMode && '0'}>
          {question && !isAnswerMode && isEditMode && !isDisabledOnEditMode ? (
            <Input defaultValue={title} autoFocus {...register('title')} />
          ) : (
            <Box display={'flex'} flexDirection="column" alignItems={'center'} justifyContent={'space-between'}>
              <Text w="100%" p="10px">
                {parentQuestion}
              </Text>
              <Text w="100%" p={isAnswerMode ? '20px' : ''}>
                {displayIndex ? `${displayIndex}. ` : ''}
                {title}
                {!questionData?.isNotQuestion && isRequired ? <span style={{ color: 'red' }}> *</span> : null}
              </Text>
              {!questionData?.isNotQuestion && files?.url ? (
                <Box display="flex" gap={4} alignItems="center">
                  <Button onClick={dwonloadUrl} mr={'10px'} px={'20px'}>
                    Download Attachment
                  </Button>
                  <Button onClick={handleView} mr={'10px'} px={'20px'}>
                    View Attachment
                  </Button>
                </Box>
              ) : null}
            </Box>
          )}
        </FormLabel>
        <Box px={isAnswerMode ? '20px' : ''} margin="0">
          {mode === 'answer' && !questionData?.isNotQuestion && ai_suggested_answers?.length > 0 && (
            <Box mb={4} borderRadius="md" overflow="hidden" borderWidth="1px" borderColor="blue.200">
              <Flex justify="space-between" align="center" bg="blue.50" p={2} borderTopRadius="md">
                <Flex align="center" gap={2}>
                  <Icon as={FaRobot} w={5} h={5} color="blue.500" />
                  <Text fontSize="md" color="blue.700" fontWeight="semibold">
                    Smart Suggestions
                    <Text as="span" fontSize="xs" color="blue.600" ml={2}>
                      Powered by AI
                    </Text>
                  </Text>
                </Flex>
                <IconButton
                  size="sm"
                  aria-label={showSuggestions ? 'Hide suggestions' : 'Show suggestions'}
                  icon={showSuggestions ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                  variant="ghost"
                  colorScheme="blue"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                />
              </Flex>
              <Collapse in={showSuggestions}>
                <VStack align="stretch" spacing={2} p={2} bg="white">
                  {ai_suggested_answers.map((suggestion, index) => {
                    if (index !== ai_suggested_answers.length - 1) {
                      return null;
                    }
                    return (
                      <Card
                        key={index}
                        variant="outline"
                        bg={selectedSuggestion === suggestion ? 'blue.50' : 'white'}
                        borderColor={selectedSuggestion === suggestion ? 'blue.300' : 'gray.200'}
                        _hover={{
                          borderColor: 'blue.300',
                          shadow: 'sm',
                          transition: 'all 0.2s'
                        }}
                      >
                        <CardBody py={2} px={3}>
                          <Flex align="center" justify="space-between" gap={3}>
                            <Flex align="center" gap={2} flex={1}>
                              <Text fontSize="sm" color={selectedSuggestion === suggestion ? 'blue.700' : 'gray.700'}>
                                {suggestion}
                              </Text>
                            </Flex>
                          </Flex>
                          <Button
                            style={{ marginTop: '10px' }}
                            size="sm"
                            colorScheme="blue"
                            variant={selectedSuggestion !== suggestion ? 'solid' : 'outline'}
                            leftIcon={<FaMagic />}
                            onClick={() => {
                              setSelectedSuggestion(suggestion);
                              setValue('content', suggestion);
                              trigger('content');
                            }}
                          >
                            {selectedSuggestion === suggestion ? 'Applied' : 'Use This Answer'}
                          </Button>
                        </CardBody>
                      </Card>
                    );
                  })}
                </VStack>
              </Collapse>
            </Box>
          )}

          {!questionData?.isNotQuestion && (
            <Box position="relative">
              <Textarea
                //defaultValue={answer}
                value={watch('content')}
                placeholder="Type your answer here"
                isDisabled={mode !== 'answer'}
                bg="white"
                minH="120px"
                maxH="200px"
                resize="vertical"
                overflow="auto"
                {...register('content')}
                onChange={e => {
                  setValue('content', e.target.value);
                  if (selectedSuggestion && e.target.value !== selectedSuggestion) {
                    setSelectedSuggestion(null);
                  }
                }}
              />
            </Box>
          )}
          {isAnswerMode && !questionData?.isNotQuestion && (
            <FormErrorMessage>{errors?.content && 'Answer is required'}</FormErrorMessage>
          )}
        </Box>
      </FormControl>
      {!questionData?.isNotQuestion && hasRemarks && (
        <Box display="flex" w="100%" px={isAnswerMode ? '20px' : ''}>
          <FormControl variant="floating">
            <Input defaultValue={remarks} isDisabled={mode !== 'answer'} placeholder="" {...register('remarks')} />
            <FormLabel>Remarks</FormLabel>
          </FormControl>
        </Box>
      )}
      {mode === 'answer' && !questionData?.isNotQuestion && hasAttachment && (
        <FormControl isInvalid={!!errors?.files}>
          <Box display="flex" w="100%" px={isAnswerMode ? '20px' : ''}>
            <VStack>
              <Button
                fontSize="14px"
                mt="5px"
                fontWeight="400"
                justifyContent="center"
                h="40px"
                borderRadius="4px"
                border="1px solid #DEDEDE"
                bg="#FFF"
                color="#000"
                onClick={() => setIsUpload(!isUpload)}
                _hover={{ opacity: 0.8 }}
              >
                Add Attachment
              </Button>
              <FormErrorMessage>{errors?.files?.message}</FormErrorMessage>
            </VStack>
            {!questionData?.isNotQuestion && isUpload && (
              <VStack align="stretch" maxW="350px" ml="14px" mt="5px">
                <Box display="flex" alignItems="center" gap={12}>
                  <FileUpload
                    key="file-upload"
                    setSelectedFiles={setSelectedFiles}
                    acceptedFileTypes={{
                      accept: {
                        'image/png': ['.png'],
                        'image/jpeg': ['.jpeg', '.jpg'],
                        'application/pdf': ['.pdf'],
                        'application/msword': ['.doc'],
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
                        'application/vnd.ms-excel': ['.xls'],
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                        'text/plain': ['.txt']
                      }
                    }}
                    mobile
                    multiple={false}
                    noShowDownload={true}
                    isQuestion={true}
                  />
                  {!questionData?.isNotQuestion && selectedFiles.length > 0 && fileUrl && (
                    <Box display="flex" alignItems="center" mt="10px">
                      <Button
                        fontSize="14px"
                        h="32px"
                        px="16px"
                        bg="#137E59"
                        color="#FFF"
                        _hover={{ opacity: 0.8 }}
                        onClick={() => setIsModalOpen(true)} // CHANGED: Open modal
                        aria-label={`View uploaded file ${selectedFiles[0].name}`}
                      >
                        Preview Attachment
                      </Button>
                    </Box>
                  )}

                  {viewerError && (
                    <Text color="red" fontSize="14px" mt="10px">
                      {viewerError}
                    </Text>
                  )}
                </Box>
              </VStack>
            )}
          </Box>
        </FormControl>
      )}

      {/* NEW: Modal for preview */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="xl">
        <ModalOverlay />
        <ModalContent zIndex={1501}>
          <ModalHeader display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
            Document Preview
            <ModalCloseButton position={'static'} onClick={() => setIsModalOpen(false)} />
          </ModalHeader>
          <ModalBody zIndex={1501}>
            {viewerError ? (
              <Text color="red" p="20px">
                {viewerError}
              </Text>
            ) : selectedFiles.length > 0 && fileUrl ? (
              getFileExtension(selectedFiles[0]) === 'docx' ? (
                isDocxLoading ? (
                  <Text p="20px">Loading .docx file...</Text>
                ) : docxHtml ? (
                  <Box
                    p="10px"
                    bg="#F7F7F7"
                    maxH="70vh"
                    overflowY="auto"
                    dangerouslySetInnerHTML={{ __html: docxHtml }}
                  />
                ) : (
                  <Text color="red" p="20px">
                    Failed to load .docx content.
                  </Text>
                )
              ) : (
                <Box p="10px" bg="#F7F7F7" maxH="70vh" overflow="auto">
                  <DocViewer
                    documents={[{ uri: fileUrl, fileType: getFileExtension(selectedFiles[0]) }]}
                    pluginRenderers={DocViewerRenderers}
                    config={{
                      header: {
                        disableHeader: true
                      }
                    }}
                    // onError={(error: Error) => {
                    //   console.error('DocViewer error:', error);
                    //   setViewerError('Failed to render document. Please try another file.');
                    // }}
                  />
                </Box>
              )
            ) : (
              <Text p="20px">No document available.</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default TextBox;

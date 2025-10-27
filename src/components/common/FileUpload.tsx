import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { AiOutlineDownload, AiOutlineInbox } from 'react-icons/ai';
import { BiTrash } from 'react-icons/bi';
import { FiFile } from 'react-icons/fi';
import {
  Box,
  BoxProps,
  Button,
  Center,
  Flex,
  FormControl,
  FormErrorMessage,
  Highlight,
  Icon,
  IconButton,
  Text,
  Tooltip,
  useStyleConfig,
  VStack
} from '@chakra-ui/react';
import axios from 'axios';

interface IFileUpload extends BoxProps {
  acceptedFileTypes: any;
  setSelectedFiles: (files: File[]) => void;
  errorMessage?: string;
  customDescription?: string;
  multiple?: boolean;
  mobile?: boolean;
  recomendations?: string;
  resetTrigger?: any;
  initialImageUrl?: string;
  uploadInfo?: any;
  noShowDownload?: boolean;
  isQuestion?: boolean;
}

const FileUpload: React.FC<IFileUpload> = ({
  acceptedFileTypes,
  setSelectedFiles,
  errorMessage,
  customDescription,
  multiple = true,
  mobile = false,
  recomendations,
  resetTrigger,
  initialImageUrl,
  uploadInfo,
  noShowDownload = false,
  isQuestion = false,
  ...rest
}: any) => {
  const [fileErrors, setFileErrors] = useState<File[]>([]);
  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([]);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const TextEllipsis = useStyleConfig('TextEllipsis');

  const resetFileUpload = () => {
    setAcceptedFiles([]);
    setFileErrors([]);
    setImagePreviewUrl(null);
  };
  useEffect(() => {
    if (resetTrigger) {
      resetTrigger.current = resetFileUpload;
    }
  }, [resetTrigger]);

  const onDrop = useCallback(
    (files: File[]) => {
      if (!multiple) {
        setAcceptedFiles(files.slice(-1));
        setFileErrors([]);
      } else {
        setAcceptedFiles(prevAcceptedFiles => [...prevAcceptedFiles, ...files]);
      }
      const file = files[0];
      if (mobile && file && ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        const reader = new FileReader();
        reader.onloadend = () => {
          //@ts-ignore
          setImagePreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      }
    },
    [multiple, mobile]
  );

  useEffect(() => {
    if (initialImageUrl) {
      setImagePreviewUrl(initialImageUrl);
    }
  }, [initialImageUrl]);

  const onDropRejected = useCallback(
    (fileRejections: File[]) => {
      if (!multiple) {
        setFileErrors(fileRejections.slice(-1));
      } else {
        setFileErrors(prevFileErrors => [...prevFileErrors, ...fileRejections]);
      }
    },
    [multiple]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    ...acceptedFileTypes,
    onDrop,
    onDropRejected,
    multiple
  });

  const handleRemoveFile = (index: number) => {
    setAcceptedFiles(prevAcceptedFiles => prevAcceptedFiles.filter((_, i) => i !== index));
    if (acceptedFiles[index] && ['image/png', 'image/jpeg', 'image/jpg'].includes(acceptedFiles[index].type)) {
      setImagePreviewUrl(null);
    }
  };

  const handleRemoveFileError = (index: number) => {
    setFileErrors(prevFileErrors => prevFileErrors.filter((_, i) => i !== index));
  };

  const downloadXLSXFile = async () => {
    try {
      const response = await axios.get(uploadInfo?.xlsx, { responseType: 'blob' });
      const fileBlob = new Blob([response.data], { type: response.headers['content-type'] });
      const fileUrl = window.URL.createObjectURL(fileBlob);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = 'Company.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  function encodeS3Url(url: string): string {
    return url.replace(/\+/g, '%20');
  }

  const downloadCSVFile = async () => {
    try {
      const response = await axios.get(encodeS3Url(uploadInfo?.csv), { responseType: 'blob' });
      const fileBlob = new Blob([response.data], { type: response.headers['content-type'] });
      const fileUrl = window.URL.createObjectURL(fileBlob);
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = 'Company.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  useEffect(() => {
    setSelectedFiles(acceptedFiles);
  }, [acceptedFiles]);

  return (
    <FormControl isInvalid={errorMessage} w="100%">
      <Center
        {...getRootProps()}
        w="100%"
        h="268px"
        bg="#FAFAFA"
        borderRadius="2px"
        border="1px solid #D9D9D9"
        borderColor={errorMessage ? 'red.500' : 'border'}
        {...rest}
      >
        <input {...getInputProps()} multiple={multiple} />
        {isDragActive ? (
          <p>Drop the files here ...</p>
        ) : mobile ? (
          <Box bg="#FAFAFA" w="224px" h="253px" maxW="224px" maxH="253px">
            {imagePreviewUrl ? (
              <img
                src={imagePreviewUrl}
                alt="Preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
              />
            ) : (
              <Button
                top="45%"
                left="20%"
                fontSize="14px"
                fontWeight="400"
                justifyContent="center"
                w="125px"
                h="40px"
                borderRadius="4px"
                border="1px solid #D9D9D9"
                bg="#FFF"
                color="#000"
                leftIcon={<Icon as={AiOutlineDownload} />}
                _hover={{ opacity: 0.8 }}
              >
                {isQuestion ? 'Upload' : 'Upload bill'}
              </Button>
            )}
          </Box>
        ) : (
          customDescription || (
            <Box>
              <Center w="100%">
                <Icon as={AiOutlineInbox} w="48px" fill="#1890FF" />
              </Center>
              <Center>
                <Text mt="20px" fontSize={{ base: '0.9em', sm: '1em' }} textAlign="center">
                  <Highlight
                    query="Click to browse"
                    styles={{ color: '#137E59', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Click to browse or drag file to this area to upload
                  </Highlight>
                </Text>
              </Center>
              <Center>
                <Text maxW="395px" color="#8C8C8C" fontSize="14px" textAlign="center">
                  {recomendations ||
                    'Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files'}
                </Text>
              </Center>
            </Box>
          )
        )}
      </Center>
      {!noShowDownload && (
        <Text color="#8C8C8C" fontSize="14px" textAlign="start" mt="10px" display={'flex'}>
          <Text
            onClick={() => downloadXLSXFile()}
            sx={{ color: 'primary', cursor: 'pointer', fontWeight: 'bold', marginRight: '3px' }}
          >
            click here
          </Text>{' '}
          to download XLSX File format or{' '}
          <Text
            onClick={() => downloadCSVFile()}
            sx={{ color: 'primary', cursor: 'pointer', fontWeight: 'bold', marginLeft: '3px', marginRight: '3px' }}
          >
            click here
          </Text>{' '}
          to download CSV File format
        </Text>
      )}
      {acceptedFiles.length > 0 && (
        <VStack mt={2} gap={1} align="flex-start">
          {acceptedFiles.map((file, index) => (
            <Flex
              key={index}
              gap={2}
              alignItems="center"
              width="100%"
              px={2}
              _hover={{
                background: 'grey.200'
              }}
            >
              <Icon as={FiFile} fontSize="1em" />
              <Text
                sx={{
                  ...TextEllipsis,
                  fontSize: '1.1em',
                  flex: '1',
                  fontWeight: 'bold',
                  color: '#137E59'
                }}
              >
                {file.name}
              </Text>
              <IconButton
                display="flex"
                p={1}
                h="auto"
                variant="unstyled"
                aria-label="remove file"
                icon={<Icon as={BiTrash} fontSize="1.2em" />}
                onClick={() => handleRemoveFile(index)}
              />
            </Flex>
          ))}
        </VStack>
      )}
      {fileErrors.length > 0 && (
        <VStack align="flex-start">
          {fileErrors.map((rejection, index) => (
            <Tooltip
              key={index}
              hasArrow
              /* @ts-ignore */
              label={rejection.errors[0].message}
              bg="red.500"
              placement="top"
            >
              <Flex
                key={index}
                gap={2}
                alignItems="center"
                width="100%"
                px={2}
                _hover={{
                  background: 'grey.200'
                }}
              >
                <Box as={FiFile} color="red.500" fontSize="1em" />
                <Text
                  sx={{
                    ...TextEllipsis,
                    fontSize: '0.9em',
                    flex: '1',
                    color: 'red.500'
                  }}
                >
                  {/* @ts-ignore */}
                  {rejection.file.name}
                </Text>
                <IconButton
                  display="flex"
                  p={1}
                  h="auto"
                  color="red.500"
                  variant="unstyled"
                  aria-label="remove file"
                  icon={<Icon as={BiTrash} fontSize="1em" />}
                  onClick={() => handleRemoveFileError(index)}
                />
              </Flex>
            </Tooltip>
          ))}
        </VStack>
      )}
      <FormErrorMessage>{errorMessage}</FormErrorMessage>
    </FormControl>
  );
};

export default FileUpload;

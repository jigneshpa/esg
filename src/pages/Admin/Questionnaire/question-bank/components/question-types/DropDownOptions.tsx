import { FC, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { FaMinus } from 'react-icons/fa6';
import { IoAdd } from 'react-icons/io5';
import Select from 'react-select';
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Text,
  VStack,
  Flex,
  Icon,
  Collapse,
  Card,
  CardBody
} from '@chakra-ui/react';

import { FileUpload } from '@/components';

import { customStyles } from '../../../../../../components/common/InputOption';
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from 'react-icons/md';
import { FaRobot, FaLightbulb } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

interface IDropDownOptions {
  title: string;
  errors: any;
  question?: boolean;
  parentQuestion?: any;
  questionContent?: any[];
  mode?: string;
  answer?: string;
  displayIndex: string;
  isDisabledOnEditMode?: boolean;
  files?: { url?: string, name?: string };
  dwonloadUrl: () => void;
  handleView: () => void;
  isRequired?: boolean;
  hasAttachment?: boolean;
  hasRemarks?: boolean;
  remarks?: string;
  ai_suggested_answers?: string[];
}

const DropDownOptions: FC<IDropDownOptions> = ({
  title,
  question,
  parentQuestion,
  errors,
  mode,
  answer,
  displayIndex = '',
  isDisabledOnEditMode,
  dwonloadUrl,
  handleView,
  files,
  isRequired,
  hasAttachment,
  hasRemarks,
  remarks,
  ai_suggested_answers = [],
  questionContent
}) => {
  const [isEditMode, setEditMode] = useState<boolean>(false);
  const location = useLocation();
  const { control, register, setValue, getValues, watch, trigger } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'dropDownOptions'
  });
  const [isUpload, setIsUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(true);

  const isAnswerMode = mode === 'answer' || mode === 'view';
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

  const arrayLevelError =
    errors.dropDownOptions && !Array.isArray(errors.dropDownOptions) ? errors.dropDownOptions.message : null;

  const [selectedOptions, setSelectedOptions] = useState([]);

  // Add useEffect to handle dropDownOptions initialization
  useEffect(() => {
    const currentDropDownOptions = watch('dropDownOptions');
    if (!currentDropDownOptions || currentDropDownOptions.length === 0 || currentDropDownOptions.filter((item: any) => item.text).length === 0) {
      const defaultDropDownOptionsData = questionContent || [{ text: '', isChecked: false, remarks: false }];
      setValue('dropDownOptions', defaultDropDownOptionsData);
      trigger('dropDownOptions');
    }
  }, [watch, setValue, trigger, questionContent]);

  useEffect(() => {
    if (mode === 'view' && remarks) {
      setValue('remarks', remarks);
    }
  }, [remarks, mode, setValue]);

  useEffect(() => {
    if (isAnswerMode) {
      setSelectedOptions(getValues('answer') || []);
    }
  }, [getValues, isAnswerMode]);

  useEffect(() => {
    if (selectedFiles?.length) {
      setValue('files', selectedFiles);
      trigger('files');
    }
  }, [selectedFiles?.length]);

  const handleSelectChange = (selected: any) => {
    setSelectedOptions(selected);
    setValue('answer', selected.label);
    trigger('answer');
  };

  return (
    <VStack spacing={4} w="100%" justify="flex-start">
      <Box w="100%" fontSize="16px" color="#262626">
        <FormControl>
          {/*@ts-ignore*/}
          <FormLabel {...labelStyles} mx={isAnswerMode && '0'} onClick={() => setEditMode(true)}>
            {question && !isAnswerMode && isEditMode && !isDisabledOnEditMode ? (
              <Input value={title} autoFocus {...register(`title`)} />
            ) : (
              <Box display={'flex'} flexDirection="column" alignItems={'center'} justifyContent={'space-between'}>
                <Text w="100%" p='10px'>
                  {parentQuestion}
                </Text>
                <Text w="100%" p={isAnswerMode ? '20px' : ''}>
                  {displayIndex ? `${displayIndex}. ` : ''}
                  {title}
                  {isRequired ? <span style={{ color: 'red' }}> *</span> : null}
                </Text>
                {files?.url ? (
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
        </FormControl>
      </Box>
      {isAnswerMode ? (
        <Box mr="auto" ml="20px" w={location.pathname.includes('survey-list') ? '20%' : '100%'}>
          {mode === 'answer' && ai_suggested_answers?.length > 0 && (
            <Box mb={4} borderRadius="md" overflow="hidden" borderWidth="1px" borderColor="blue.200">
              <Flex
                justify="space-between"
                align="center"
                bg="blue.50"
                p={2}
                borderTopRadius="md"
              >
                <Flex align="center" gap={2}>
                  <Icon as={FaRobot} w={5} h={5} color="blue.500" />
                  <Text fontSize="md" color="blue.700" fontWeight="semibold">
                    Suggested Answers
                    <Text as="span" fontSize="xs" color="blue.600" ml={2}>
                      AI Generated
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
                <VStack
                  align="stretch"
                  spacing={2}
                  p={2}
                  bg="white"
                >
                  {ai_suggested_answers.map((suggestion, index) => (
                    <Card
                      key={index}
                      variant="outline"
                      borderColor="gray.200"
                      _hover={{
                        borderColor: 'blue.300',
                        shadow: 'sm',
                        transition: 'all 0.2s'
                      }}
                    >
                      <CardBody py={2} px={3}>
                        <Flex align="center" gap={2}>
                          <Icon as={FaLightbulb} color="blue.400" boxSize={4} />
                          <Text fontSize="sm" color="gray.700">
                            {suggestion}
                          </Text>
                        </Flex>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </Collapse>
            </Box>
          )}
          <Select
            isDisabled={mode === 'view' || ((location.pathname.includes('survey-list') && location.pathname.includes('admin'))) || (location.pathname.includes('survey-list') && location.pathname.includes('manager'))}
            //@ts-ignore
            options={fields.map(field => ({ value: field.id, label: field.text }))}
            value={selectedOptions}
            onChange={handleSelectChange}
            placeholder={mode === 'view' ? answer : 'Select option'}
            className="basic-multi-select"
            styles={customStyles}
            classNamePrefix="select"
          />
          {errors.answer && (
            <HStack align="start" mt="20px">
              <Box color="red.500" key={1}>
                {errors.answer.message}
              </Box>
            </HStack>
          )}
        </Box>
      ) : (
        <>
          {fields.map((item, index) => (
            <VStack key={item.id} alignItems="center" mb="2" gap="15px" w="100%">
              <HStack mr="auto">
                <FormControl variant="floating">
                  <Input
                    maxW="350px"
                    isDisabled={isDisabledOnEditMode}
                    {...register(`dropDownOptions[${index}].text`)}
                    placeholder=""
                  />
                  <FormLabel>Option text</FormLabel>
                </FormControl>
                {index === fields.length - 1 ? (
                  <IconButton
                    aria-label="Add option"
                    bgColor="#004384"
                    isDisabled={isDisabledOnEditMode}
                    icon={<IoAdd />}
                    onClick={() => append({ text: '', remarks: false })}
                  />
                ) : (
                  <IconButton
                    aria-label="Remove option"
                    bgColor="#FF7875"
                    icon={<FaMinus />}
                    isDisabled={isDisabledOnEditMode}
                    onClick={() => remove(index)}
                  />
                )}
              </HStack>
              <HStack>
                {errors.dropDownOptions && errors.dropDownOptions[index] && (
                  <HStack align="start">
                    {Object.keys(errors.dropDownOptions[index]).map(errorKey => (
                      <Box color="red.500" key={errorKey}>
                        {errors.dropDownOptions[index][errorKey].message}
                      </Box>
                    ))}
                  </HStack>
                )}
              </HStack>
            </VStack>
          ))}
        </>
      )}
      <HStack> {arrayLevelError && <Box color="red.500">{arrayLevelError}</Box>} </HStack>
      {isAnswerMode && hasRemarks && (
        <Box display="flex" w="100%" px={isAnswerMode ? '20px' : ''}>
          <FormControl variant="floating">
            <Input defaultValue={remarks} isDisabled={mode !== 'answer'} placeholder="" {...register('remarks')} />
            <FormLabel>Remarks</FormLabel>
          </FormControl>
        </Box>
      )}
      {mode == 'answer' && hasAttachment && (
        <FormControl isInvalid={!!errors?.files}>
          <Box alignSelf={'baseline'} w="100%" display="flex" px={isAnswerMode ? '20px' : ''}>
            <VStack>
              <Button
                fontSize="14px"
                mt="5px"
                fontWeight="400"
                justifyContent="center"
                h="40px"
                borderRadius="4px"
                border="1px solid #D9D9D9"
                bg="#FFF"
                color="#000"
                onClick={() => setIsUpload(!isUpload)}
                // leftIcon={<Icon as={AiOutlineDownload} />}
                _hover={{ opacity: 0.8 }}
              >
                Add Attachment
              </Button>
              <FormErrorMessage>{errors?.files?.message}</FormErrorMessage>
            </VStack>
            {isUpload && (
              <VStack align="stretch" maxW="350px" ml="14px" mt="5px">
                <FileUpload
                  key="file-upload"
                  setSelectedFiles={setSelectedFiles}
                  acceptedFileTypes={{
                    accept: {
                      'image/png': ['.png'],
                      'image/jpeg': ['.jpeg', '.jpg'],
                      'application/pdf': ['.pdf']
                    }
                  }}
                  mobile
                  multiple={false}
                  noShowDownload={true}
                  isQuestion={true}
                // initialImageUrl={bill?.file?.url}
                // initialImageInfo={bill?.file}
                />
              </VStack>
            )}
          </Box>
        </FormControl>
      )}
    </VStack>
  );
};

export default DropDownOptions;

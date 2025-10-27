// @ts-nocheck
import { FC, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { AsyncPaginate } from 'react-select-async-paginate';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  Text,
  useDisclosure,
  VStack
} from '@chakra-ui/react';

import { FileUpload } from '@/components';
import { customStyles, InputOption, Placeholder } from '@/components/common/InputOption';
import { CustomValueContainer } from '@/components/common/SortableHeader';
import { useAttributes } from '@/context/AtrributesContext';
import { ApiType } from '@/hooks/useLoadOptions';
import { useAppSelector } from '@/store/hooks';
import { selectUserRole } from '@/store/slices/user/userSelectors';

interface ICheckboxOptions {
  title: string;
  errors: any;
  question?: boolean;
  questions?: any;
  companySelectedNum?: number;
  mode?: string;
  displayIndex?: string;
  isDisabledOnEditMode?: boolean;
  isDisabledOnViewMode?: boolean;
  files?: { url?: string, name?: string };
  dwonloadUrl: () => void;
  isRequired?: boolean;
  hasAttachment?: boolean;
  hasRemarks?: boolean;
  remarks?: string;
  onDelete?: () => void;
  selectedUsers?: any[];
  onUserSelect?: (users: any[]) => void;
  onAssign: () => void;
  isAssigning?: boolean;
  adminUsers?: any[];
  loadUsersOptions?: (search: string, loadedOptions: any[], additional: { page: number }) => Promise<any>;
  isViewPage?: boolean;
}

const CheckboxOptions: FC<ICheckboxOptions> = ({
  title,
  question,
  questions,
  companySelectedNum,
  errors,
  mode,
  displayIndex = '',
  remarks,
  hasRemarks,
  hasAttachment,
  isRequired,
  isDisabledOnEditMode,
  isDisabledOnViewMode,
  dwonloadUrl,
  files,
  onDelete,
  selectedUsers = [],
  onUserSelect,
  onAssign,
  isAssigning,
  adminUsers = [],
  loadUsersOptions,
  isViewPage
}) => {
  const userRole = useAppSelector(selectUserRole);
  const [isEditMode, setEditMode] = useState<boolean>(false);
  const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);
  const { control, register, trigger, setValue, watch, getValues } = useFormContext();
  const { fields, replace } = useFieldArray({
    control,
    name: 'checkboxOptions'
  });
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [isUpload, setIsUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { loadOptions } = useAttributes();
  const { loadOptions: defaultLoadUsersOptions } = loadOptions(ApiType.Users);

  // Fallback loadOptions for non-user-admin
  const effectiveLoadUsersOptions = loadUsersOptions || defaultLoadUsersOptions;

  // Custom loadOptions for user-admin using adminUsers
  const adminLoadOptions = async (search: string, loadedOptions: any[], { page }: { page: number }) => {
    console.log('adminLoadOptions called with:', { search, page, adminUsers });
    const filteredOptions = adminUsers.filter(user => user.label.toLowerCase().includes(search.toLowerCase()));
    return {
      options: filteredOptions,
      hasMore: false,
      additional: { page: page + 1 }
    };
  };
  // Parse and initialize checkboxOptions from questions.content
  useEffect(() => {
    if (questions?.questionContent) {
      try {
        const parsedContent = JSON.parse(questions.questionContent);
        const checkboxOptions = parsedContent.checkboxOptions || [];
        console.log('checkboxOptions', checkboxOptions);

        let initializedOptions = checkboxOptions.map((option: any, index: number) => ({
          id: `${index}-${option.text}`, // Generate a unique ID
          text: option.text,
          isChecked: false, // Default to unchecked
          remarks: option.remarks || false
        }));

        const parsedAnswer = JSON.parse(questions.content || '[]');
        const answeredCheckboxOptions = JSON.parse(parsedAnswer?.[0]?.answer || '{}')?.checkboxOptions || [];
        if (parsedAnswer?.length > 0 && answeredCheckboxOptions?.length > 0) {
          initializedOptions = answeredCheckboxOptions.map((option: any, index: number) => ({
            id: `${index}-${option.text}`, // Generate a unique ID
            text: option.text,
            isChecked: option.isChecked || false, // Default to unchecked
            remarks: option.remarks || false
          }));
          console.log('initializedOptions1', initializedOptions);
          setValue('checkboxOptions', initializedOptions);
        } else {
          console.log('initializedOptions2', initializedOptions);
          setValue('checkboxOptions', initializedOptions);
        }
      } catch (error) { }
    }
  }, [questions, questions?.questionContent, setValue]);

  useEffect(() => {
    if (registrationComplete) {
      trigger('checkboxOptions');
      setRegistrationComplete(false);
    }
  }, [registrationComplete, trigger]);

  useEffect(() => {
    if (selectedFiles?.length) {
      setValue('files', selectedFiles);
      trigger('files');
    }
  }, [selectedFiles?.length, setValue, trigger]);

  useEffect(() => {
    if (mode === 'view' && remarks) {
      setValue('remarks', remarks);
    }
  }, [remarks, mode, setValue]);

  const isViewMode = mode === 'view';
  const isAnswerMode = mode === 'answer';

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
    errors.checkboxOptions && !Array.isArray(errors.checkboxOptions) ? errors.checkboxOptions.message : null;
  console.log('array level error', arrayLevelError);
  const handleCheckboxChange = (index: number, checked: boolean) => {
    setValue(`checkboxOptions[${index}].isChecked`, checked);
    if (mode === 'answer') {
      trigger('checkboxOptions');
    }
  };

  const checkBoxData = watch('checkboxOptions');
  console.log('checkBoxData', checkBoxData);
  return (
    <VStack spacing={4} w="100%" justify="flex-start">
      <Box
        w="100%"
        gap="11px"
        flexWrap="wrap"
        bgColor="#FAFAFA"
        minHeight="55px"
        borderBottom="1px solid #DEDEDE"
        padding={question && mode !== 'answer' && mode !== 'view' ? '20px' : ''}
      >
        <FormControl>
          {/*@ts-ignore*/}
          <FormLabel {...labelStyles} mx={isAnswerMode && '0'}>
            {question && !isAnswerMode && isEditMode && !isDisabledOnEditMode ? (
              <Input value={title} autoFocus {...register(`title`)} />
            ) : (
              <Box
                display={'flex'}
                alignItems={'center'}
                justifyContent={'space-between'}
                bgColor="#FAFAFA"
                padding={'20px'}
              >
                <HStack
                  w="100%"
                  gap="11px"
                  flexWrap="wrap"
                  minHeight="55px"
                  padding={question && mode !== 'answer' && mode !== 'view' ? '20px' : ''}
                >
                  <Text w="100%" p={isAnswerMode ? '20px' : ''} onClick={() => setEditMode(true)}>
                    {displayIndex ? `${displayIndex}. ` : ''}
                    {title}
                    {isRequired ? <span style={{ color: 'red' }}> *</span> : null}
                  </Text>
                </HStack>
                <HStack>
                  {!isViewPage && isViewMode && (
                    <HStack spacing={4}>
                      <FormControl w="auto" variant="floating">
                        <InputGroup zIndex={6} w="auto">
                          <AsyncPaginate
                            placeholder=""
                            debounceTimeout={800}
                            isMulti
                            loadOptions={
                              userRole === 'user-admin' || userRole === 'admin'
                                ? adminLoadOptions
                                : effectiveLoadUsersOptions
                            }
                            styles={customStyles}
                            components={{
                              Placeholder,
                              ValueContainer: CustomValueContainer,
                              Option: InputOption
                            }}
                            onChange={selectedOption => {
                              const newSelectedUsers = Array.isArray(selectedOption) ? selectedOption : [];
                              const previousUsers = selectedUsers || [];

                              // Get the actual assigned users from question.users for comparison
                              const actualAssignedUsers =
                                questions?.users?.map(user => ({
                                  value: user.id,
                                  label: user.name
                                })) || [];

                              // Check if users were removed by comparing against BOTH actual assigned users AND previous state
                              const currentUserCount = Math.max(actualAssignedUsers.length, previousUsers.length);
                              if (newSelectedUsers.length < currentUserCount) {
                                // Find removed users from BOTH sources (Redux store OR previous dropdown state)
                                const allCurrentUsers = [...actualAssignedUsers];

                                // Add users from previous state that might not be in Redux yet
                                previousUsers.forEach(prevUser => {
                                  if (!allCurrentUsers.some(current => current.value === prevUser.value)) {
                                    allCurrentUsers.push(prevUser);
                                  }
                                });

                                const removedUsers = allCurrentUsers.filter(
                                  currentUser => !newSelectedUsers.some(newUser => newUser.value === currentUser.value)
                                );

                                // If users were removed, trigger unassign for each removed user
                                if (removedUsers.length > 0) {
                                  // First update the UI immediately for better UX
                                  onUserSelect?.(newSelectedUsers);

                                  // Then trigger the API calls
                                  removedUsers.forEach(removedUser => {
                                    if (onUnassignUser) {
                                      onUnassignUser(removedUser.value.toString());
                                    }
                                  });
                                  return;
                                }
                              }

                              // Only update selected users if this wasn't an unassign operation
                              onUserSelect?.(newSelectedUsers);
                            }}
                            hideSelectedOptions={false}
                            value={selectedUsers}
                            menuPosition="absolute"
                            menuPlacement="bottom"
                            menuShouldBlockScroll={false}
                            closeMenuOnScroll={false}
                            closeMenuOnSelect={false}
                            isClearable={true}
                            blurInputOnSelect={false}
                            menuIsOpen={menuIsOpen}
                            onMenuOpen={() => {
                              console.log('Menu opened');
                              setMenuIsOpen(true);
                            }}
                            onMenuClose={() => {
                              console.log('Menu closed');
                              setMenuIsOpen(false);
                            }}
                            additional={{ userRole, adminUsers }}
                          />
                          <Input placeholder="" value={selectedUsers} hidden />
                          <FormLabel>Assign Users</FormLabel>
                        </InputGroup>
                      </FormControl>
                      <Button
                        onClick={() => {
                          console.log('Assign button clicked');
                          setMenuIsOpen(false);
                          onAssign();
                        }}
                        fontSize={'0.9em'}
                        fontWeight={700}
                        w="auto"
                        h="44px"
                        bg="#137E59"
                        _hover={{ opacity: 0.8 }}
                        isLoading={isAssigning}
                      >
                        Assign
                      </Button>
                    </HStack>
                  )}
                  {!isViewPage && files?.url ? (
                    <Button onClick={dwonloadUrl} mr={'10px'} px={'20px'}>
                      Download Attachment
                    </Button>
                  ) : null}
                </HStack>
              </Box>
            )}
          </FormLabel>
        </FormControl>
      </Box>
      <Box px={isAnswerMode ? '20px' : ''} margin={'0 auto 0 0'} padding={'20px'}>
        {checkBoxData.map((item, index) => (
          <VStack key={item.id} alignItems="center" mb="2" gap="15px" w="100%">
            <HStack mr="auto">
              <Checkbox
                isDisabled={(mode === 'view' && isDisabledOnViewMode) || (mode === 'edit' && !isDisabledOnEditMode)}
                {...register(`checkboxOptions[${index}].isChecked`, {
                  onChange: e => handleCheckboxChange(index, e.target.checked)
                })}
              />
              <FormControl variant="floating">
                <Input
                  maxW={isAnswerMode ? '221px' : '350px'}
                  {...register(`checkboxOptions[${index}].text`)}
                  placeholder=""
                  isDisabled={!isAnswerMode}
                />
                <FormLabel>Option text</FormLabel>
              </FormControl>
            </HStack>
            <HStack>
              {errors.checkboxOptions && errors.checkboxOptions[index] && (
                <HStack align="start">
                  {Object.keys(errors.checkboxOptions[index]).map(errorKey => (
                    <Box color="red.500" key={errorKey}>
                      {errors.checkboxOptions[index][errorKey].message}
                    </Box>
                  ))}
                </HStack>
              )}
            </HStack>
          </VStack>
        ))}
        {/* <HStack> {arrayLevelError && <Box color="red.500">{arrayLevelError}</Box>} </HStack> */}
      </Box>
      {!isViewPage && isAnswerMode && hasRemarks && (
        <Box w="100%" display="flex" px={isAnswerMode ? '20px' : ''}>
          <FormControl variant="floating">
            <Input defaultValue={remarks} isDisabled={mode !== 'answer'} {...register('remarks')} placeholder="" />
            <FormLabel>Remarks</FormLabel>
          </FormControl>
        </Box>
      )}
      {mode === 'answer' && hasAttachment && !isViewPage && (
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
                border="1px solid #D9D9D9"
                bg="#FFF"
                color="#000"
                onClick={() => setIsUpload(!isUpload)}
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
                />
              </VStack>
            )}
          </Box>
        </FormControl>
      )}
    </VStack>
  );
};

export default CheckboxOptions; //merge conflicts resolved

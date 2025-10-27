// @ts-nocheck

import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import Select from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  Text,
  VStack
} from '@chakra-ui/react';

import { FileUpload } from '@/components';
import { customStyles, InputOption, Placeholder } from '@/components/common/InputOption';
import { CustomValueContainer } from '@/components/common/SortableHeader';
import { useAttributes } from '@/context/AtrributesContext';
import { ApiType } from '@/hooks/useLoadOptions';
import { useAppSelector } from '@/store/hooks';
import { selectUserRole } from '@/store/slices/user/userSelectors';

interface IDropDownOptions {
  title: string;
  errors: any;
  question?: boolean;
  questions?: any;
  parentQuestion?: any;
  companySelectedNum?: number;
  mode?: string;
  answer?: string;
  displayIndex: string;
  isDisabledOnEditMode?: boolean;
  files?: { url?: string, name?: string };
  dwonloadUrl: () => void;
  isRequired?: boolean;
  hasAttachment?: boolean;
  hasRemarks?: boolean;
  remarks?: string;
  selectedUsers?: any[];
  onUserSelect?: (users: any[]) => void;
  onAssign: () => void;
  isAssigning?: boolean;
  adminUsers?: any[];
  loadUsersOptions?: (search: string, loadedOptions: any[], additional: { page: number }) => Promise<any>;
  isViewPage?: boolean;
}
interface UserOption {
  value: number | string;
  label: string;
}

const DropDownOptions: FC<IDropDownOptions> = ({
  title,
  question,
  questions,
  parentQuestion,
  companySelectedNum,
  errors,
  mode,
  answer,
  displayIndex = '',
  isDisabledOnEditMode,
  isDisabledOnViewMode,
  dwonloadUrl,
  files,
  isRequired,
  hasAttachment,
  hasRemarks,
  remarks,
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
  const { control, register, setValue, getValues, watch, trigger } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'dropDownOptions'
  });
  const [isUpload, setIsUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const { loadOptions } = useAttributes();
  const { loadOptions: defaultLoadUsersOptions } = loadOptions(ApiType.Users);
  const [adminOptions, setAdminOptions] = useState<UserOption[]>([]);
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

  // Trigger adminLoadOptions on page load for admin or user-admin roles
  useEffect(() => {
    if (userRole === 'user-admin' || userRole === 'admin') {
      // Call adminLoadOptions with default parameters
      adminLoadOptions('', [], { page: 1 }).then(result => {
        setAdminOptions(result.options);
        console.log('adminLoadOptions result on page load:', result);
        // Optionally, update selectedUsers or perform other actions
        // onUserSelect?.(result.options); // Uncomment if you want to set users automatically
      });
    }
  }, [userRole, adminUsers, onUserSelect]); // Dependencies to re-run if these change
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
  // Parse dropdown options from questions.content
  const dropdownOptions = useMemo(() => {
    if (!questions?.content) return [];

    try {
      const parsedContent = JSON.parse(questions.questionContent);

      // Fallback: try to parse directly from content
      if (parsedContent?.dropDownOptions?.length > 0) {
        return parsedContent.dropDownOptions.map((option: { text: string }) => ({
          value: option.text,
          label: option.text
        }));
      }
    } catch (error) {
      console.error('Error parsing content:', error);
    }

    return [];
  }, [questions?.content]);

  const selectedAnswer = useMemo(() => {
    if (!questions?.content || adminOptions.length === 0) return null;
    let finalSelectedAnswer = null;
    try {
      const parsedContent = JSON.parse(questions.content);
      console.log('parsedContent', parsedContent);
      // Try to get answers from content
      const answers = parsedContent.filter?.((item: any) => item.answer);
      console.log('answers', answers);
      answers.forEach((item: any) => {
        if (item?.answer && !finalSelectedAnswer) {
          try {
            const parsedAnswer = JSON.parse(item.answer);
            console.log('inside parsedAnswer', parsedAnswer);
            finalSelectedAnswer = parsedAnswer?.answer || null;
          } catch (innerErr) {
            console.warn('Error parsing matching answer JSON:', innerErr);
          }
        }
      });
      return finalSelectedAnswer;
    } catch (error) {
      console.error('Error parsing selected answer from content:', error);
    }

    return null;
  }, [questions?.content, adminOptions]);

  const arrayLevelError =
    errors.dropDownOptions && !Array.isArray(errors.dropDownOptions) ? errors.dropDownOptions.message : null;

  // const [selectedOption, setSelectedOption] = useState('');

  useEffect(() => {
    if (mode === 'view' && remarks) {
      setValue('remarks', remarks);
    }
  }, [remarks, mode, setValue]);

  useEffect(() => {
    if (!isEditMode) {
      const currentAnswer = getValues('answer');
      // setSelectedOption(getValues('answer') || '');
      if (currentAnswer) {
        const selected = dropdownOptions.fiselectedUsersnd(opt => opt.value === currentAnswer);
        setSelectedOption(selected || null);
      }
    }
  }, [getValues, isAnswerMode, dropdownOptions]);

  useEffect(() => {
    if (selectedFiles?.length) {
      setValue('files', selectedFiles);
      trigger('files');
    }
  }, [selectedFiles?.length, setValue, trigger]);

  const handleSelectChange = (selected: any) => {
    // return;
    setSelectedOption(selected);
    // setValue('answer', selected.label);
    setValue('answer', selected?.value || '');
    setValue('dropDownOptions', dropdownOptions);
    trigger('answer');
  };

  const handleLabelClick = useCallback(() => {
    if (!isViewMode) {
      setEditMode(true);
    }
  }, [isViewMode]);

  const options = fields.map(field => ({
    value: field.id,
    label: field.text
  }));
  // const placeholderText = !isEditMode && answer && answer.length > 0
  // ? answer.map(opt => opt.text).join(', ')
  // : 'Select option';

  const placeholderText = useMemo(() => {
    if (selectedAnswer) return selectedAnswer;
    if (adminOptions.length > 0) {
      if (questions?.answer && Array.isArray(questions.answer)) {
        // Check for companyId match first
        for (const item of questions.answer) {
          if (item.companyId === companySelectedNum) {
            try {
              const parsedAnswer = JSON.parse(item?.answer);
              return parsedAnswer.answer || 'Select option';
            } catch (error) {
              console.error('Error parsing answer JSON:', error);
            }
          }
        }

        // Fallback: Check for adminOptions and user_id match
        const matchingAnswer = questions.answer.find(item =>
          adminOptions.some(adminOption => adminOption.value === item.user_id)
        );
        if (matchingAnswer) {
          try {
            const parsedAnswer = JSON.parse(matchingAnswer.answer);
            console.log('parsed Answer from matching answer', parsedAnswer);
            return parsedAnswer.answer || 'Select option';
          } catch (error) {
            console.error('Error parsing matching answer JSON:', error);
          }
        }
      }
    }
    return 'Select option';
  }, [adminOptions, questions?.users, questions?.answer, selectedAnswer, companySelectedNum]);

  const selectedUsersValue = useMemo(() => {
    let updatedSelectedUsers = [...selectedUsers];

    if (adminOptions.length > 0 && questions?.answer && Array.isArray(questions.answer)) {
      const matchedUsers = questions.answer
        .filter(item => adminOptions.some(adminOption => adminOption.value === item.user_id))
        .map(item => adminOptions.find(adminOption => adminOption.value === item.user_id))
        .filter(user => user && !updatedSelectedUsers.some(selected => selected.value === user.value)); // Avoid duplicates
      updatedSelectedUsers = [...updatedSelectedUsers, ...matchedUsers];
    }

    return updatedSelectedUsers;
  }, [adminOptions, questions?.answer, selectedUsers]);
  console.log('dropdownOptions & selectedAnswer', dropdownOptions, selectedAnswer)
  return (
    <VStack w="100%" justify="flex-start">
      <Box
        w="100%"
        fontSize="16px"
        color="#262626"
        backgroundColor={'#F5F5F5'}
        borderBottom={'1px solid #DEDEDE'}
        padding={'20px'}
      >
        <FormControl>
          {/*@ts-ignore*/}
          <FormLabel {...labelStyles} mx={isAnswerMode && '0'}>
            {question && !isAnswerMode && isEditMode && !isDisabledOnEditMode ? (
              <Input value={title} autoFocus {...register(`title`)} />
            ) : (
              <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
                <Text>
                  {parentQuestion?.displayNo}. {parentQuestion?.title}
                </Text>
                <Text w="100%" p={isAnswerMode ? '20px' : ''} onClick={handleLabelClick}>
                  {displayIndex ? `${displayIndex}. ` : ''}
                  {title}
                  {isRequired ? <span style={{ color: 'red' }}> *</span> : null}
                </Text>
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
                              const previousUsers = selectedUsersValue || [];

                              console.log('🔍 DropDown onChange called:', {
                                newSelectedUsers: newSelectedUsers.map(u => ({ id: u.value, name: u.label })),
                                previousUsers: previousUsers.map(u => ({ id: u.value, name: u.label })),
                                questionsUsers: questions?.users?.map(u => ({ id: u.id, name: u.name }))
                              });

                              // Get the actual assigned users from question.users for comparison
                              const actualAssignedUsers =
                                questions?.users?.map(user => ({
                                  value: user.id,
                                  label: user.name
                                })) || [];

                              // Check if users were removed by comparing against BOTH actual assigned users AND previous state
                              const currentUserCount = Math.max(actualAssignedUsers.length, previousUsers.length);
                              console.log('📊 User count comparison:', {
                                newCount: newSelectedUsers.length,
                                currentCount: currentUserCount,
                                actualAssignedCount: actualAssignedUsers.length,
                                previousCount: previousUsers.length
                              });

                              if (newSelectedUsers.length < currentUserCount) {
                                console.log('🗑️ Users were removed, processing unassignment...');

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

                                console.log(
                                  '👋 Removed users identified:',
                                  removedUsers.map(u => ({ id: u.value, name: u.label }))
                                );

                                // If users were removed, trigger unassign for each removed user
                                if (removedUsers.length > 0) {
                                  console.log('🚀 Calling onUnassignUser for each removed user...');

                                  // First update the UI immediately for better UX
                                  onUserSelect?.(newSelectedUsers);

                                  // Then trigger the API calls
                                  removedUsers.forEach(removedUser => {
                                    if (onUnassignUser) {
                                      console.log('📞 Calling onUnassignUser with:', removedUser.value.toString());
                                      onUnassignUser(removedUser.value.toString());
                                    }
                                  });
                                  return;
                                }
                              }

                              console.log('✅ Normal user selection, calling onUserSelect');
                              // Only update selected users if this wasn't an unassign operation
                              onUserSelect?.(newSelectedUsers);
                            }}
                            hideSelectedOptions={false}
                            value={selectedUsersValue}
                            menuPosition="absolute"
                            menuPlacement="bottom"
                            menuShouldBlockScroll={false}
                            closeMenuOnScroll={false}
                            closeMenuOnSelect={false}
                            isClearable={true}
                            blurInputOnSelect={false}
                            menuIsOpen={menuIsOpen}
                            onMenuOpen={() => setMenuIsOpen(true)}
                            onMenuClose={() => setMenuIsOpen(false)}
                            additional={{ userRole, adminUsers }}
                          />
                          <Input placeholder="" value={selectedUsersValue} hidden />
                          <FormLabel>Assign Users</FormLabel>
                        </InputGroup>
                      </FormControl>
                      <Button
                        onClick={() => {
                          setMenuIsOpen(false);
                          onAssign();
                        }}
                        fontSize={'0.9em'}
                        fontWeight={700}
                        w="auto"
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

      <Box mr="auto" ml="20px">
        <Select
          isDisabled={(mode === 'view' && isDisabledOnViewMode) || mode === 'edit'}
          value={selectedOption || ''}
          onChange={handleSelectChange}
          options={dropdownOptions}
          placeholder={placeholderText}
          styles={customStyles}
        />
      </Box>

      {/* fields.map((item, index) => (
          <VStack key={item.id} alignItems="center" w="100%">
            <HStack mr="auto" padding={question && mode !== 'answer' && mode !== 'view' ? '20px' : ''}>
              <FormControl variant="floating">
                <Input
                  maxW="350px"
                  isDisabled={isDisabledOnEditMode}
                  {...register(`dropDownOptions[${index}].text`)}
                  placeholder=""
                />
                <FormLabel>Option text</FormLabel>
              </FormControl>
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
        )) */}

      {/* <HStack> {arrayLevelError && <Box color="red.500">{arrayLevelError}</Box>} </HStack> */}
      { !isViewPage && isAnswerMode && hasRemarks && (
        <Box display="flex" w="100%" px={isAnswerMode ? '20px' : ''}>
          <FormControl variant="floating">
            <Input defaultValue={remarks} isDisabled={mode !== 'answer'} placeholder="" {...register('remarks')} />
            <FormLabel>Remarks</FormLabel>
          </FormControl>
        </Box>
      )}
      { !isViewPage && mode == 'answer' && hasAttachment && (
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

export default DropDownOptions; // merge conflicts resolved

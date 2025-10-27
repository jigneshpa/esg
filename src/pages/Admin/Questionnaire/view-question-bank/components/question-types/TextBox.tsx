// @ts-nocheck
// merge conflicts resolved
import { FC, useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
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

interface ITextBox {
  title: string;
  question?: boolean;
  questions?: any;
  parentQuestion?: any;
  companySelectedNum?: number;
  mode?: string;
  errors?: any;
  answer?: string;
  remarks?: string;
  index?: number;
  displayIndex?: string;
  isDisabledOnEditMode?: boolean;
  files?: { url?: string, name?: string };
  dwonloadUrl: () => void;
  isRequired?: boolean;
  hasAttachment?: boolean;
  hasRemarks?: boolean;
  onDelete?: () => void;
  selectedUsers?: any[];
  onUserSelect?: (users: any[]) => void;
  onAssign: () => void;
  onUnassignUser?: (userId: string) => void;
  isAssigning?: boolean;
  adminUsers?: any[];
  isViewPage?: boolean;
}

const TextBox: FC<ITextBox> = ({
  title,
  question,
  questions,
  parentQuestion,
  companySelectedNum,
  mode,
  errors,
  answer,
  remarks,
  displayIndex = '',
  isDisabledOnEditMode,
  isDisabledOnViewMode,
  files,
  dwonloadUrl,
  isRequired,
  hasAttachment,
  hasRemarks,
  onDelete,
  selectedUsers = [],
  onUserSelect,
  onAssign,
  isAssigning,
  adminUsers = [],
  onUnassignUser,
  isViewPage
}) => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);
  const { register, setValue, trigger } = useFormContext();
  const [isUpload, setIsUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { loadOptions } = useAttributes();
  const { loadOptions: loadUsersOptions } = loadOptions(ApiType.Users);
  const userRole = useAppSelector(selectUserRole);
  const isViewMode = mode === 'view';
  const isAnswerMode = mode === 'answer';

  useEffect(() => {
    if (selectedFiles?.length) {
      setValue('files', selectedFiles);
      trigger('files');
    }
  }, [selectedFiles?.length]);

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

  const handleLabelClick = () => setIsEditMode(true);

  const handleDelete = () => {
    onDelete?.();
    onClose();
  };

  return (
    <VStack spacing={4}>
      <FormControl isInvalid={isAnswerMode && errors?.content}>
        {/*@ts-ignore*/}
        <FormLabel {...labelStyles} mx={isAnswerMode && '0'}>
          {question && !isAnswerMode && isEditMode && !isDisabledOnEditMode ? (
            <Input defaultValue={title} autoFocus {...register('title')} />
          ) : (
            <Box
              display={'flex'}
              alignItems={'center'}
              justifyContent={'space-between'}
              bgColor="#FAFAFA"
              borderBottom="1px solid #DEDEDE"
            >
              <HStack
                w="100%"
                gap="11px"
                flexWrap="wrap"
                minHeight="55px"
                padding={question && mode !== 'answer' && mode !== 'view' ? '20px' : ''}
              >
                <Text>
                  {parentQuestion?.displayNo}. {parentQuestion?.title}
                </Text>
                <Text w="90%" p={isAnswerMode ? '20px' : ''} onClick={handleLabelClick}>
                  {displayIndex ? `${displayIndex}. ` : ''}
                  {title}
                  {isRequired ? <span style={{ color: 'red' }}> *</span> : null}
                </Text>
              </HStack>

              {!isViewPage && (
                <HStack>
                  {isViewMode && !questions?.isNotQuestion && (
                    // {mode === 'edit' && (
                    <HStack spacing={4} mr={'20px'} my={'20px'}>
                      <FormControl w="auto" variant="floating">
                        <InputGroup zIndex={6} w="auto">
                          <AsyncPaginate
                            placeholder=""
                            debounceTimeout={800}
                            isMulti
                            loadOptions={loadUsersOptions}
                            styles={customStyles}
                            components={{ Placeholder, ValueContainer: CustomValueContainer, Option: InputOption }}
                            onChange={selectedOptions => {
                              const newSelectedUsers = selectedOptions || [];
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
                            maxMenuHeight={180}
                            closeMenuOnSelect={false}
                            closeMenuOnScroll={false}
                            isClearable={true}
                            menuIsOpen={menuIsOpen}
                            onMenuOpen={() => setMenuIsOpen(true)}
                            onMenuClose={() => setMenuIsOpen(false)}
                            onBlur={() => {
                              const menu = document.querySelector('.select__menu');
                              if (menu) {
                                menu.classList.remove('select__menu--is-open');
                              }
                            }}
                            additional={{ userRole, adminUsers }} // Pass userRole and adminUsers to InputOption
                          />
                          <Input placeholder="" value={selectedUsers} hidden />
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
                  {files?.url ? (
                    <Button onClick={dwonloadUrl} mr={'10px'} px={'20px'}>
                      Download Attachment
                    </Button>
                  ) : null}
                </HStack>
              )}
            </Box>
          )}
        </FormLabel>
        {!isViewPage && !questions?.isNotQuestion && (
          <Box px={isAnswerMode ? '20px' : ''} margin="0" padding={'20px'}>
            <VStack rowGap={7} width={'100%'}>
              <Input
                defaultValue={answer}
                placeholder="Here will be the answer to the question"
                isDisabled={(mode === 'view' && isDisabledOnViewMode) || (mode === 'edit' && !isDisabledOnEditMode)}
                _disabled={{ opacity: 0.4, textColor: 'gray.500' }}
                {...register('content')}
              />
              {isAnswerMode && <FormErrorMessage>{errors?.content && 'Answer is required'}</FormErrorMessage>}
              {hasRemarks && (
                <Input
                  defaultValue={remarks}
                  placeholder="Enter remarks here"
                  isDisabled={(mode === 'view' && isDisabledOnViewMode) || (mode === 'edit' && !isDisabledOnEditMode)}
                  _disabled={{ opacity: 0.4, textColor: 'gray.500' }}
                  {...register('remarks')}
                />
              )}
            </VStack>
          </Box>
        )}
      </FormControl>

      {mode == 'answer' && !question?.isNotQuestion && hasAttachment && (
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

      {!questions?.isNotQuestion && (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent bgColor="#FAFAFA">
            <ModalHeader display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
              Delete Answer
              <ModalCloseButton position={'static'} onClick={onClose} />
            </ModalHeader>
            <ModalBody>Are you sure you want to delete this answer? This action cannot be undone.</ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button backgroundColor={'red'} _hover={{ backgroundColor: 'red' }} onClick={handleDelete}>
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </VStack>
  );
};

export default TextBox;

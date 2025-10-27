// @ts-nocheck

import { FC, useEffect, useMemo, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import Select from 'react-select';
import { AsyncPaginate } from 'react-select-async-paginate';
import {
  Box,
  Button,
  Checkbox,
  Flex,
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
import { customStyles } from '@/components/common/InputOption';
import { comparisonOptions } from '@/constants/mock';
import { inputStyles } from '@/constants/styles/input';

interface ICompareOptions {
  title: string;
  errors: any;
  question?: boolean;
  questions?: any;
  mode?: string;
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
  onUnassignUser?: (userId: string) => void;
}

const CompareOptions: FC<ICompareOptions> = ({
  title,
  question,
  questions,
  errors,
  mode,
  displayIndex = '',
  dwonloadUrl,
  files,
  isDisabledOnEditMode,
  isRequired,
  hasAttachment,
  hasRemarks,
  remarks,
  selectedUsers,
  onUserSelect,
  onAssign,
  onUnassignUser
}) => {
  const [editMode, setEditMode] = useState<boolean>(false);
  const { register, control, setValue } = useFormContext();
  const isAnswerMode = mode === 'answer' || mode === 'view';
  const [isUpload, setIsUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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
    if (selectedFiles?.length) {
      setValue('files', selectedFiles);
    }
  }, [selectedFiles?.length]);

  return (
    <VStack spacing={4} w="100%" justify="flex-start">
      <Box
        w="100%"
        fontSize="16px"
        color="#262626"
        padding={question && mode !== 'answer' && mode !== 'view' ? '20px' : ''}
      >
        <FormControl>
          {/*@ts-ignore*/}
          <FormLabel {...labelStyles} mx={isAnswerMode && '0'} onClick={() => setEditMode(true)}>
            {question && !isAnswerMode && editMode ? (
              <Input value={title} autoFocus {...register(`title`)} />
            ) : (
              <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
                <Text w="100%" p={isAnswerMode ? '20px' : ''}>{`${displayIndex}. ${title}`}</Text>
                <HStack>
                  {mode === 'edit' && (
                    <HStack spacing={4}>
                      <FormControl w="auto" variant="floating">
                        <InputGroup zIndex={6} w="auto">
                          <AsyncPaginate
                            placeholder="Select users"
                            debounceTimeout={800}
                            isMulti
                            loadOptions={loadUsersOptions}
                            styles={customStyles}
                            components={{ Placeholder, ValueContainer: CustomValueContainer, Option: InputOption }}
                            onChange={selectedOptions => {
                              const newSelectedUsers = Array.from(selectedOptions || []);
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
                            menuShouldBlockScroll={true}
                            closeMenuOnScroll={false}
                            closeMenuOnSelect={true}
                          />
                          <Input placeholder="" value={selectedUsers} hidden />
                          <FormLabel>Assign Users</FormLabel>
                        </InputGroup>
                      </FormControl>
                      <Button
                        onClick={onAssign}
                        fontSize={'0.9em'}
                        fontWeight={700}
                        w="auto"
                        h="44px"
                        bg="#137E59"
                        _hover={{ opacity: 0.8 }}
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
              </Box>
            )}
          </FormLabel>
        </FormControl>
      </Box>
      <Flex alignItems="center" gap="15px" w="100%" px={isAnswerMode ? '20px' : '0'}>
        <FormControl w="100%" isInvalid={!!errors?.compare?.compareLeft}>
          <Input type="number" {...register('compare.compareLeft')} placeholder="Left value" />
          {errors?.compare?.compareLeft && <FormErrorMessage>{errors?.compare?.compareLeft?.message}</FormErrorMessage>}
        </FormControl>
        <Controller
          name="compare.comparisonType"
          control={control}
          render={({ field: { onChange, value, ...field } }) => (
            <FormControl w="250px" isInvalid={!!errors?.compare?.comparisonType}>
              <Select
                {...field}
                placeholder="Select compare"
                options={comparisonOptions}
                styles={inputStyles}
                value={comparisonOptions.find(option => option.value === value)}
                onChange={val => onChange(val?.value)}
              />
              {errors?.compare?.comparisonType && (
                <FormErrorMessage>{errors?.compare?.comparisonType?.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />
        <FormControl w="100%" isInvalid={!!errors?.compare?.compareRight}>
          <Input type="number" {...register('compare.compareRight')} placeholder="Right value" />
          {errors?.compare?.compareRight && (
            <FormErrorMessage>{errors?.compare?.compareRight?.message}</FormErrorMessage>
          )}
        </FormControl>
      </Flex>
      <Box px={isAnswerMode ? '20px' : '0'} w="100%">
        <Checkbox {...register(`compare.remarks`)}>Remarks</Checkbox>
      </Box>
      {mode == 'answer' && (
        <Box display="flex" px={isAnswerMode ? '20px' : ''}>
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
      )}
    </VStack>
  );
};

export default CompareOptions;

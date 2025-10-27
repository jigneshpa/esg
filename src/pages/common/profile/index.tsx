//@ts-nocheck
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AiFillEye, AiFillEyeInvisible, AiOutlineMail, AiOutlineUser } from 'react-icons/ai';
import { BiLock } from 'react-icons/bi';
import { BsCameraFill } from 'react-icons/bs';
import { MdError } from 'react-icons/md';
import { PiBuildingsBold } from 'react-icons/pi';
import { RiGlobalLine } from 'react-icons/ri';
import Select from 'react-select';
import {
  Avatar,
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Hide,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Show,
  Text,
  VStack
} from '@chakra-ui/react';
import axios from 'axios';

import API from '@/api';
import { customStyles, Placeholder } from '@/components/common/InputOption';
import { GREENFI_STORAGE_KEY, MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { departmentApi } from '@/store/api/department/departmentApi';
import { mediaApi } from '@/store/api/media/mediaApi';
import { userApi } from '@/store/api/user/userApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCountryList } from '@/store/slices/country/countrySelectors';
import { selectUser } from '@/store/slices/user/userSelectors';
import { setUser } from '@/store/slices/user/userSlice';
import { profileSchema } from '@/types/validation-schemas/profile';
import { triggerValidation } from '@/utils';
import { yupResolver } from '@hookform/resolvers/yup';

const Profile = () => {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const countries = useAppSelector(selectCountryList);
  const [getUserInfo] = userApi.useGetUserInfoMutation();
  const [getMediaLink] = mediaApi.useLazyGetMediaLinkQuery();
  const localToken = sessionStorage.getItem(GREENFI_STORAGE_KEY) || localStorage.getItem(GREENFI_STORAGE_KEY);
  const [fileLoading, setFileLoading] = useState<boolean>(false);
  const [avatarImage, setAvatarImage] = useState(null);
  const [imageUpdated, setImageUpdated] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { notify, confirm } = useAppContext();
  const {
    register,
    getValues,
    setValue,
    trigger,
    control,
    reset,

    formState: { errors, isDirty }
  } = useForm({
    resolver: yupResolver(profileSchema),
    mode: 'onChange',
    defaultValues: { file: '' }
  });
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [submitting, setSubmitting] = useState(null);
  const [reportingManager, setReportingManager] = useState(null);
  const profileRef = useRef();

  const {
    data: departmentData,
    isLoading: departmentIsLoading,
    isFetching: departmentIsFetching,
    refetch: departmentRefetch
  } = departmentApi.useGetAlldepartmentsQuery({});

  useEffect(() => {
    if (user) {
      const { firstName, lastName, userName, department, email, countryId } = user;
      setValue('firstName', firstName, { shouldDirty: false });
      setValue('lastName', lastName, { shouldDirty: false });
      setValue('userName', userName, { shouldDirty: false });
      setValue('email', email, { shouldDirty: false });
      setValue('department', department, { shouldDirty: false });
      setValue('country_id', countryId, { shouldDirty: false });

      setAvatarUrl(user?.avatar?.url, { shouldDirty: false });

      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        email: user.email,
        department: user.department,
        country_id: user.countryId
      });
    }
  }, [user]);

  // Force refresh user data to ensure we have latest info including toReporting
  useEffect(() => {
    const refreshUserData = async () => {
      if (localToken) {
        try {
          const refreshedUser = await getUserInfo().unwrap();
          dispatch(setUser(refreshedUser.data));
        } catch (error) {
          console.error('Error refreshing user data:', error);
        }
      }
    };

    refreshUserData();
  }, []); // Only run once when component mounts

  // Set reporting manager information from user data
  useEffect(() => {
    if (user?.reportingManager) {
      // Use the complete reportingManager object from user API
      setReportingManager({
        id: user.reportingManager.id,
        firstName: user.reportingManager.firstName,
        lastName: user.reportingManager.lastName,
        email: user.reportingManager.email || '',
        role: user.reportingManager.role || '',
        fullName: user.reportingManager.fullName
      });
    } else if (user?.toReporting) {
      // If we only have the ID, create a placeholder object
      setReportingManager({
        id: user.toReporting,
        firstName: 'Unknown',
        lastName: 'Manager',
        email: '',
        role: ''
      });
    } else {
      // No reporting manager
      setReportingManager(null);
    }
  }, [user?.toReporting, user?.reportingManager]);

  const handleFileChange = async e => {
    const file = e.target.files[0];
    if (file) {
      const { isSuccess, data: { data: { key: fileKey = '', url: signedUrl = '' } = {} } = {} } = await getMediaLink({
        name: file.name
      });
      if (isSuccess) {
        setFileLoading(true);
        const result = await axios.put(signedUrl, file, {
          headers: { 'Content-Type': file.type }
        });
        if (result.status === 200) {
          setFileLoading(false);
          const imageMetadata = {
            name: file.name,
            key: fileKey,
            contentType: file.type,
            size: file.size
          };
          setAvatarImage(imageMetadata);
          const fileReader = new FileReader();
          fileReader.onload = event => {
            setValue('file', file, { shouldDirty: true });
            setAvatarUrl(event.target.result);
          };
          fileReader.readAsDataURL(file);
          setImageUpdated(true);
        } else {
          setFileLoading(false);
        }
      }
    }
  };

  const onSubmit = async values => {
    const profileData = {
      ...values,
      ...(imageUpdated ? { image: avatarImage } : {}) // Include image only if it has been updated
    };

    delete profileData.file;

    confirm({
      type: STATUS.APPROVED,
      title: 'Update Profile',
      message: 'Please confirm',
      onOk: () => {
        setSubmitting(true);
        API.patchUserInfo(profileData, user?.id)
          .then((res: any) => {
            const newToken = {
              refreshToken: res.refreshToken,
              accessToken: res.accessToken
            };
            localStorage.setItem(GREENFI_STORAGE_KEY, JSON.stringify(newToken));
            notify({ message: MESSAGE.UPDATE_PROFILE_SUCCESS });
            getUserInfo(newToken)
              .unwrap()
              .then(newUser => {
                dispatch(setUser(newUser.data));
                reset();
              });
          })
          .catch(error => {
            notify({
              type: STATUS.ERROR,
              message: error?.response?.data?.message
            });
          })
          .finally(() => {
            setSubmitting(false);
          });
      }
    });
    setImageUpdated(false);
  };

  const removeProfileImg = () => {
    setValue('file', null, { shouldDirty: true });
    setAvatarUrl(null);
    setImageUpdated(true);
    setAvatarImage(null);
  };

  // Function to toggle visibility of old password
  const toggleShowOldPassword = () => {
    setShowOldPassword(prevState => !prevState);
  };
  // Function to toggle visibility of new password
  const toggleShowNewPassword = () => {
    setShowNewPassword(prevState => !prevState);
  };
  // Function to toggle visibility of confirm password
  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(prevState => !prevState);
  };

  const actionMenuOpen = () => {
    profileRef.current.click();
  };

  return (
    <VStack w={'100%'} gap={'24px'} align={'start'} p={{ base: '24px 0 0 0', lg: '24px 30px 0 70px' }}>
      <Show above={'lg'}>
        <Text fontSize={'24px'} fontWeight={700}>
          My profile
        </Text>
      </Show>

      <form>
        <VStack
          gap={'24px'}
          w={'100%'}
          maxW={{
            base: '560px',
            lg: '792px'
          }}
          m={{
            base: '0 auto',
            lg: '0'
          }}
        >
          <VStack
            gap={'24px'}
            w={'100%'}
            maxW={{
              base: '560px',
              lg: '792px'
            }}
            m={{
              base: '0 auto',
              lg: '0'
            }}
          >
            <Hide above={'lg'}>
              <FormControl flex={1} isInvalid={errors.file}>
                <Flex
                  w={'100%'}
                  p="16px 24px"
                  gap={{
                    base: '32px',
                    md: '40px'
                  }}
                  alignItems={'center'}
                >
                  <Box position={'relative'}>
                    <Box display={avatarUrl ? 'block' : 'none'}>
                      <Avatar
                        w={{
                          base: '80px',
                          md: '108px'
                        }}
                        h={{
                          base: '80px',
                          md: '108px'
                        }}
                        name={`${user?.firstName} ${user?.lastName}`}
                        src={avatarUrl}
                      />
                    </Box>
                    <Box display={!avatarUrl ? 'block' : 'none'}>
                      <Avatar
                        w={{
                          base: '80px',
                          md: '108px'
                        }}
                        h={{
                          base: '80px',
                          md: '108px'
                        }}
                        name={`${user?.firstName} ${user?.lastName}`}
                      />
                    </Box>

                    {avatarUrl ? (
                      <Box position={'absolute'} bg="" left={'32%'} bottom={'-10px'}>
                        <Menu>
                          <MenuButton
                            as={Button}
                            _hover={{ bg: 'transparent' }}
                            _active={{ bg: 'transparent' }}
                            bg={'transparent'}
                          >
                            <Center
                              w={{
                                base: '26px',
                                md: '32px'
                              }}
                              h={{
                                base: '26px',
                                md: '32px'
                              }}
                              bg={'grey.200'}
                              borderRadius={'50%'}
                              position={'absolute'}
                              left={'50%'}
                              transform={'translateX(-50%)'}
                              bottom={'-px'}
                              _hover={{ bg: 'grey.100' }}
                              cursor={'pointer'}
                            >
                              <Icon w={'11px'} as={BsCameraFill} color={'black'} />
                            </Center>
                          </MenuButton>
                          <MenuList>
                            <MenuItem
                              onClick={() => {
                                actionMenuOpen();
                              }}
                            >
                              Change Profile Picture
                            </MenuItem>
                            <MenuItem
                              onClick={() => {
                                removeProfileImg();
                              }}
                            >
                              Delete Profile Picture
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Box>
                    ) : (
                      <label htmlFor={'file'}>
                        <Center
                          w={{
                            base: '26px',
                            md: '32px'
                          }}
                          h={{
                            base: '26px',
                            md: '32px'
                          }}
                          bg={'white'}
                          borderRadius={'50%'}
                          border={'2px solid'}
                          borderColor={'grey.300'}
                          position={'absolute'}
                          left={'50%'}
                          transform={'translateX(-50%)'}
                          bottom={'-10px'}
                          _hover={{ bg: 'grey.100' }}
                          cursor={'pointer'}
                        >
                          <Icon w={'11px'} as={BsCameraFill} />
                          <Input
                            id={'file'}
                            type={'file'}
                            accept={'image/png, image/jpg, image/jpeg'}
                            display={'none'}
                            onChange={handleFileChange}
                          />
                        </Center>
                      </label>
                    )}

                    <Input
                      id={'file'}
                      type={'file'}
                      accept={'image/png, image/jpg, image/jpeg'}
                      display={'none'}
                      onChange={handleFileChange}
                      ref={profileRef}
                    />
                    {errors.file && (
                      <FormErrorMessage position={'absolute'} whiteSpace={'nowrap'}>
                        <Icon as={MdError} /> {errors.file.message}
                      </FormErrorMessage>
                    )}
                  </Box>
                  <Box>
                    <Text
                      fontSize={{
                        base: '1em',
                        md: '20px'
                      }}
                      fontWeight={700}
                    >
                      {user?.firstName} {user?.lastName}
                    </Text>
                    <Text
                      color="grey.300"
                      fontSize={{
                        base: '0.8em',
                        md: '1em'
                      }}
                    >
                      {user?.role}
                    </Text>
                    {(user?.role === 'user' ||
                      user?.role === 'Employee' ||
                      user?.role === 'Manager' ||
                      user?.role === 'manager') &&
                      reportingManager && (
                        <Text
                          color="grey.400"
                          fontSize={{
                            base: '0.7em',
                            md: '0.9em'
                          }}
                          mt={1}
                        >
                          Reports to:{' '}
                          {reportingManager.fullName || `${reportingManager.firstName} ${reportingManager.lastName}`}
                        </Text>
                      )}
                  </Box>
                </Flex>
              </FormControl>
            </Hide>
            <VStack
              w={'100%'}
              gap={'40px'}
              bg={'white'}
              p={{
                base: '20px 16px 32px',
                lg: '40px'
              }}
              borderRadius={'16px'}
            >
              <Show above={'lg'}>
                <FormControl flex={1} isInvalid={!!errors.file}>
                  <Flex w={'100%'}>
                    <Text flexBasis={'40%'} fontSize={'18px'} fontWeight={700}>
                      Avatar
                    </Text>
                    <Box position={'relative'}>
                      <Avatar
                        w={'120px'}
                        h={'120px'}
                        name={`${user?.firstName} ${user?.lastName}`}
                        src={avatarUrl}
                        display={avatarUrl ? 'block' : 'none'}
                      />
                      <Box display={!avatarUrl ? 'block' : 'none'}>
                        <Avatar w={'120px'} h={'120px'} name={`${user?.firstName} ${user?.lastName}`} />
                      </Box>

                      {avatarUrl ? (
                        <Box position={'absolute'} bg="" left={'32%'} bottom={'-10px'}>
                          <Menu>
                            <MenuButton
                              as={Button}
                              _hover={{ bg: 'transparent' }}
                              _active={{ bg: 'transparent' }}
                              bg={'transparent'}
                            >
                              <Center
                                w={'24px'}
                                h={'24px'}
                                bg={'grey.200'}
                                borderRadius={'50%'}
                                position={'absolute'}
                                left={'50%'}
                                transform={'translateX(-50%)'}
                                bottom={'-px'}
                                _hover={{ bg: 'grey.100' }}
                                cursor={'pointer'}
                              >
                                <Icon w={'11px'} as={BsCameraFill} color={'black'} />
                              </Center>
                            </MenuButton>
                            <MenuList>
                              <MenuItem
                                onClick={() => {
                                  actionMenuOpen();
                                }}
                              >
                                Change Profile Picture
                              </MenuItem>
                              <MenuItem
                                onClick={() => {
                                  removeProfileImg();
                                }}
                              >
                                Delete Profile Picture
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Box>
                      ) : (
                        <label htmlFor={'file'}>
                          <Center
                            w={'24px'}
                            h={'24px'}
                            bg={'grey.200'}
                            borderRadius={'50%'}
                            position={'absolute'}
                            left={'50%'}
                            transform={'translateX(-50%)'}
                            bottom={'-10px'}
                            _hover={{ bg: 'grey.100' }}
                            cursor={'pointer'}
                          >
                            <Icon w={'11px'} as={BsCameraFill} />
                            <Input
                              id={'file'}
                              type={'file'}
                              accept={'image/png, image/jpg, image/jpeg'}
                              display={'none'}
                              onChange={handleFileChange}
                            />
                          </Center>
                        </label>
                      )}

                      <Input
                        id={'file'}
                        type={'file'}
                        accept={'image/png, image/jpg, image/jpeg'}
                        display={'none'}
                        onChange={handleFileChange}
                        ref={profileRef}
                      />
                      {errors.file && (
                        <FormErrorMessage position={'absolute'}>
                          <Icon as={MdError} /> {errors.file.message}
                        </FormErrorMessage>
                      )}
                    </Box>
                  </Flex>
                </FormControl>
              </Show>

              <Flex
                w={'100%'}
                flexDirection={{
                  base: 'column',
                  lg: 'row'
                }}
              >
                <Text
                  flexBasis={'40%'}
                  fontSize={'18px'}
                  fontWeight={700}
                  mb={{
                    base: '32px',
                    lg: '0'
                  }}
                >
                  General Information
                </Text>
                <VStack
                  flex={1}
                  w={'100%'}
                  maxW={{
                    base: '100%',
                    lg: '328px'
                  }}
                >
                  <Flex w="100%" mb="20px" gap={'16px'}>
                    <FormControl flex={1} isInvalid={!!errors.firstName}>
                      <VStack gap={'8px'} align={'start'}>
                        <Text fontSize={'14px'} fontWeight={600} color={'grey.700'}>
                          First Name
                        </Text>
                        <Input {...register('firstName')} />
                        {errors.firstName && (
                          <FormErrorMessage>
                            <Icon as={MdError} /> {errors.firstName.message}
                          </FormErrorMessage>
                        )}
                      </VStack>
                    </FormControl>
                    <FormControl flex={1} isInvalid={!!errors.lastName}>
                      <VStack gap={'8px'} align={'start'}>
                        <Text fontSize={'14px'} fontWeight={600} color={'grey.700'}>
                          Last Name
                        </Text>
                        <Input {...register('lastName')} />
                        {errors.lastName && (
                          <FormErrorMessage>
                            <Icon as={MdError} /> {errors.lastName.message}
                          </FormErrorMessage>
                        )}
                      </VStack>
                    </FormControl>
                  </Flex>
                  <Box w="100%" mb="20px">
                    <VStack gap={'8px'} align={'start'}>
                      <Text fontSize={'14px'} fontWeight={600} color={'grey.700'}>
                        Username
                      </Text>
                      <FormControl isInvalid={!!errors.userName}>
                        <InputGroup>
                          <InputLeftElement>
                            <Icon as={AiOutlineUser} color="grey.500" />
                          </InputLeftElement>
                          <Input {...register('userName')} />
                        </InputGroup>
                        {errors.userName && (
                          <FormErrorMessage>
                            <Icon as={MdError} /> {errors.userName.message}
                          </FormErrorMessage>
                        )}
                      </FormControl>
                    </VStack>
                  </Box>

                  <Box w="100%" mb="20px">
                    <FormControl variant="floating" isInvalid={!!errors.department}>
                      <Controller
                        name={'department'}
                        control={control}
                        // eslint-disable-next-line no-unused-vars
                        render={({ field: { onChange, value, ref } }) => (
                          <>
                            <Select
                              placeholder={''}
                              styles={customStyles}
                              ref={ref}
                              options={departmentData?.data?.results.map((item: any) => ({
                                value: item.id,
                                label: item.name
                              }))}
                              isLoading={departmentIsLoading}
                              value={departmentData?.data?.results
                                .map((item: any) => ({ value: item.id, label: item.name }))
                                .find((c: any) => c.value === value)}
                              onChange={(option: { value: any }) => onChange(option?.value)}
                            />
                            <Input placeholder=" " value={value} hidden />
                            <FormLabel>
                              <Text display={'flex'} alignItems="center">
                                <Text
                                  as="span"
                                  mr={'8px'}
                                  display={'flex'}
                                  alignItems="center"
                                  justifyContent={'center'}
                                >
                                  <Icon as={PiBuildingsBold} color="grey.500" />
                                </Text>
                                <Text as="span" color="grey.500">
                                  Department
                                </Text>
                              </Text>
                            </FormLabel>
                          </>
                        )}
                      />
                      {errors.department && (
                        <FormErrorMessage>
                          <Icon as={MdError} /> {errors.department.message}
                        </FormErrorMessage>
                      )}
                    </FormControl>
                  </Box>

                  <Box w="100%" mb="20px">
                    <VStack gap={'8px'} align={'start'}>
                      <Text fontSize={'14px'} fontWeight={600} color={'grey.700'}>
                        Country
                      </Text>
                      <FormControl isInvalid={!!errors.country_id}>
                        <Controller
                          name={'country_id'}
                          control={control}
                          // eslint-disable-next-line no-unused-vars
                          render={({ field: { onChange, value, ref } }) => (
                            <Select
                              isDisabled={user?.role === 'admin'}
                              placeholder={
                                <Flex
                                  position="absolute"
                                  align="center"
                                  top="50%"
                                  left="0"
                                  transform="translateY(-50%)"
                                >
                                  <Center w="40px" h="40px">
                                    <Icon as={RiGlobalLine} color="grey.500" />
                                  </Center>
                                  <Text as="span" color="grey.500">
                                    Country
                                  </Text>
                                </Flex>
                              }
                              components={{ Placeholder }}
                              ref={ref}
                              styles={customStyles}
                              options={countries}
                              //@ts-ignore
                              value={countries.find(option => option.value === value)}
                              onChange={selectedOption => onChange(selectedOption?.value)}
                            />
                          )}
                        />
                        {errors.country_id && (
                          <FormErrorMessage>
                            <Icon as={MdError} /> {errors.country_id.message}
                          </FormErrorMessage>
                        )}
                      </FormControl>
                    </VStack>
                  </Box>
                  <Box w="100%" mb="24px">
                    <VStack gap={'8px'} align={'start'}>
                      <Text fontSize={'14px'} fontWeight={600} color={'grey.700'}>
                        Official Email ID
                      </Text>
                      <FormControl>
                        <InputGroup>
                          <InputLeftElement>
                            <Icon as={AiOutlineMail} color="grey.500" />
                          </InputLeftElement>
                          <Input type="email" disabled {...register('email')} />
                        </InputGroup>
                      </FormControl>
                    </VStack>
                  </Box>

                  {/* Reporting Manager Information */}
                  {(user?.role === 'user' ||
                    user?.role === 'Employee' ||
                    user?.role === 'Manager' ||
                    user?.role === 'manager') &&
                    reportingManager && (
                      <Box w="100%" mb="24px">
                        <VStack gap={'8px'} align={'start'}>
                          <Text fontSize={'14px'} fontWeight={600} color={'grey.700'}>
                            Reporting Manager
                          </Text>
                          <FormControl>
                            <InputGroup>
                              <InputLeftElement>
                                <Icon as={AiOutlineUser} color="grey.500" />
                              </InputLeftElement>
                              <Input
                                value={
                                  reportingManager.fullName ||
                                  `${reportingManager.firstName} ${reportingManager.lastName}`
                                }
                                disabled
                                bg="gray.50"
                              />
                            </InputGroup>
                          </FormControl>
                        </VStack>
                      </Box>
                    )}
                </VStack>
              </Flex>
            </VStack>
          </VStack>

          <VStack
            gap={'24px'}
            w={'100%'}
            maxW={{
              base: '560px',
              lg: '792px'
            }}
            m={{
              base: '0 auto',
              lg: '0'
            }}
          >
            <VStack
              w={'100%'}
              gap={'40px'}
              bg={'white'}
              p={{
                base: '20px 16px 32px',
                lg: '40px'
              }}
              borderRadius={'16px'}
            >
              <Flex
                w={'100%'}
                flexDirection={{
                  base: 'column',
                  lg: 'row'
                }}
              >
                <Text
                  flexBasis={'40%'}
                  fontSize={'18px'}
                  fontWeight={700}
                  mb={{
                    base: '32px',
                    lg: '0'
                  }}
                >
                  Update password
                </Text>
                <VStack
                  flex={1}
                  w={'100%'}
                  maxW={{
                    base: '100%',
                    lg: '328px'
                  }}
                >
                  <VStack w="100%" mb="20px" gap={'8px'} align={'start'}>
                    <Text fontSize={'14px'} fontWeight={600} color={'grey.700'}>
                      Current password
                    </Text>
                    <FormControl isInvalid={!!errors.old_password}>
                      <InputGroup>
                        <InputLeftElement>
                          <Icon as={BiLock} color="grey.500" />
                        </InputLeftElement>
                        <Input
                          pr="0.5rem"
                          type={showOldPassword ? 'text' : 'password'}
                          {...register('old_password')}
                          autoComplete="new-password"
                        />
                        <InputRightElement width="4.5rem">
                          <Button h="1.75rem" p="0" size="sm" variant="ghost" onClick={toggleShowOldPassword}>
                            {showOldPassword ? (
                              <Icon as={AiFillEye} color="grey.500" />
                            ) : (
                              <Icon as={AiFillEyeInvisible} color="grey.500" />
                            )}
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                      {errors.old_password && (
                        <FormErrorMessage>
                          <Icon as={MdError} /> {errors.old_password.message}
                        </FormErrorMessage>
                      )}
                    </FormControl>
                  </VStack>
                  <VStack w="100%" mb="20px" gap={'8px'} align={'start'}>
                    <Text fontSize={'14px'} fontWeight={600} color={'grey.700'}>
                      New password
                    </Text>
                    <FormControl isInvalid={!!errors.new_password}>
                      <InputGroup>
                        <InputLeftElement>
                          <Icon as={BiLock} color="grey.500" />
                        </InputLeftElement>
                        <Input pr="0.5rem" type={showNewPassword ? 'text' : 'password'} {...register('new_password')} />
                        <InputRightElement width="4.5rem">
                          <Button h="1.75rem" p="0" size="sm" variant="ghost" onClick={toggleShowNewPassword}>
                            {showNewPassword ? (
                              <Icon as={AiFillEye} color="grey.500" />
                            ) : (
                              <Icon as={AiFillEyeInvisible} color="grey.500" />
                            )}
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                      {errors.new_password && (
                        <FormErrorMessage>
                          <Icon as={MdError} /> {errors.new_password.message}
                        </FormErrorMessage>
                      )}
                    </FormControl>
                  </VStack>
                  <VStack w="100%" mb="20px" gap={'8px'} align={'start'}>
                    <Text fontSize={'14px'} fontWeight={600} color={'grey.700'}>
                      Confirm new password
                    </Text>
                    <FormControl isInvalid={!!errors.confirm_new_password}>
                      <InputGroup>
                        <InputLeftElement>
                          <Icon as={BiLock} color="grey.500" />
                        </InputLeftElement>
                        <Input
                          pr="0.5rem"
                          type={showConfirmPassword ? 'text' : 'password'}
                          {...register('confirm_new_password')}
                        />
                        <InputRightElement width="4.5rem">
                          <Button h="1.75rem" p="0" size="sm" variant="ghost" onClick={toggleShowConfirmPassword}>
                            {showConfirmPassword ? (
                              <Icon as={AiFillEye} color="grey.500" />
                            ) : (
                              <Icon as={AiFillEyeInvisible} color="grey.500" />
                            )}
                          </Button>
                        </InputRightElement>
                      </InputGroup>
                      {errors.confirm_new_password && (
                        <FormErrorMessage>
                          <Icon as={MdError} /> {errors.confirm_new_password.message}
                        </FormErrorMessage>
                      )}
                    </FormControl>
                  </VStack>
                </VStack>
              </Flex>
            </VStack>
          </VStack>
          <Flex
            justifyContent={'end'}
            w={'100%'}
            maxW={{
              base: '560px',
              lg: '792px'
            }}
            m={{
              base: '0 auto',
              lg: '0'
            }}
            p={{
              base: '24px 16px',
              md: '0 0 32px 0px'
            }}
          >
            <Button
              as={'button'}
              h={'44px'}
              onClick={() => triggerValidation(getValues, setValue, trigger, onSubmit)}
              isDisabled={!isDirty}
              isLoading={submitting}
              loadingText={'Saving'}
            >
              Update profile
            </Button>
          </Flex>
        </VStack>
      </form>
    </VStack>
  );
};

export default Profile;

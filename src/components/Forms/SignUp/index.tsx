import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AiFillEye, AiFillEyeInvisible, AiOutlineMail, AiOutlineUser } from 'react-icons/ai';
import { BiLock } from 'react-icons/bi';
import { MdError } from 'react-icons/md';
import { PiBuildingsBold } from 'react-icons/pi';
import { RiGlobalLine } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Icon,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Stack,
  Text
} from '@chakra-ui/react';

import { logoGreen, UobLogo } from '@/assets';
import { MESSAGE, STATUS, URLS } from '@/constants';
import { departmentApi } from '@/store/api/department/departmentApi';
import { replaceString, triggerValidation } from '@/utils';
import { yupResolver } from '@hookform/resolvers/yup';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { useAppContext } from '../../../context/AppContext';
import { authApi } from '../../../store/api/authentication/authApi';
import { useAppSelector } from '../../../store/hooks';
import { selectCountryList } from '../../../store/slices/country/countrySelectors';
import { ErrorData } from '../../../types/common';
import { SignUpRequest } from '../../../types/store/api/authentication';
import { signUpSchema } from '../../../types/validation-schemas/sign-up';
import { customStyles } from '../../common/InputOption';

const SignUp = () => {
  const { notify } = useAppContext();
  const [signUp, { isLoading, isError, error }] = authApi.useSignUpMutation();
  const {
    data: departmentData,
    isLoading: departmentIsLoading,
    isFetching: departmentIsFetching,
    refetch: departmentRefetch
  } = departmentApi.useGetAlldepartmentsQuery({});
  const countries = useAppSelector(selectCountryList);
  const {
    register,
    getValues,
    setValue,
    trigger,
    control,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(signUpSchema),
    mode: 'onChange',
    defaultValues: {
      confirmPassword: undefined,
      country_id: undefined,
      department: undefined,
      email: undefined,
      first_name: undefined,
      last_name: undefined,
      password: undefined,
      user_name: undefined
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleShowPassword = () => setShowPassword(!showPassword);
  const handleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);
  const navigate = useNavigate();

  const logoImage = import.meta.env.VITE_IS_CLIENT === 'false' ? logoGreen : UobLogo;

  useEffect(() => {
    if (isError && error) {
      notify({
        type: STATUS.ERROR,
        message: ((error as FetchBaseQueryError).data as ErrorData)?.message || MESSAGE.SEND_MAIL_ADDRESS_FAIL
      });
    }
  }, [isError, error, notify]);

  useEffect(() => {
    departmentRefetch();
  }, []);

  const processData = (data: any) => {
    const processedData: any = {};
    Object.entries(data).forEach(([key, value]) => {
      // Trim whitespace from string values
      processedData[key] = typeof value === 'string' ? value.trim() : value;
    });
    return processedData;
  };

  const onSubmit = async (user: SignUpRequest) => {
    try {
      const processedUser = processData(user);
      const result = await signUp(processedUser).unwrap();
      const user_id = result.data.user_id;

      if (user_id) {
        const mapObj = {
          '/:redirectPage': URLS.LOG_IN,
          ':userId': user_id
        };
        const redirectUrl = replaceString(URLS.VERIFICATION, mapObj);
        navigate(redirectUrl, { replace: true });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form
      onKeyDown={e => {
        if (e.key === 'Enter') triggerValidation(getValues, setValue, trigger, onSubmit);
      }}
    >
      <Flex direction="column" align="center" w="100%">
        <Image
          src={logoImage}
          cursor={'pointer'}
          mb="50px"
          display={{
            base: 'block',
            lg: 'none'
          }}
          h={{
            base: '60px',
            md: '70px'
          }}
        />
        <Heading as="h1" fontSize="2rem" mb="32px">
          Sign Up
        </Heading>
        <Box w="100%" mb="24px">
          <Stack gap="16px" direction="row">
            <FormControl variant="floating" isInvalid={!!errors.first_name}>
              <Input placeholder="" {...register('first_name')} />
              <FormLabel>First Name</FormLabel>
              {errors.first_name && (
                <FormErrorMessage>
                  <Icon as={MdError} /> {errors.first_name.message}
                </FormErrorMessage>
              )}
            </FormControl>
            <FormControl variant="floating" isInvalid={!!errors.last_name}>
              <Input placeholder="" {...register('last_name')} />
              <FormLabel>Last Name</FormLabel>
              {errors.last_name && (
                <FormErrorMessage>
                  <Icon as={MdError} /> {errors.last_name.message}
                </FormErrorMessage>
              )}
            </FormControl>
          </Stack>
        </Box>
        <Box w="100%" mb="24px">
          <InputGroup zIndex={7}>
            <FormControl variant="floating" isInvalid={!!errors.country_id}>
              <Controller
                name={'country_id'}
                control={control}
                // eslint-disable-next-line no-unused-vars
                render={({ field: { onChange, value, ref } }) => (
                  <>
                    <Select
                      placeholder={''}
                      styles={customStyles}
                      ref={ref}
                      options={countries}
                      //@ts-ignore
                      value={countries.find(option => option.value === value)}
                      onChange={selectedOption => onChange(selectedOption?.value)}
                    />
                    <Input placeholder=" " value={value} hidden />
                    <FormLabel>
                      <Text display={'flex'} alignItems="center">
                        <Text as="span" mr={'8px'} display={'flex'} alignItems="center" justifyContent={'center'}>
                          <Icon as={RiGlobalLine} color="grey.500" />
                        </Text>
                        <Text as="span" color="grey.500">
                          Country
                        </Text>
                      </Text>
                    </FormLabel>
                  </>
                )}
              />
              {errors.country_id && (
                <FormErrorMessage>
                  <Icon as={MdError} /> {errors.country_id.message}
                </FormErrorMessage>
              )}
            </FormControl>
          </InputGroup>
        </Box>

        <Box w="100%" mb="24px">
          <InputGroup zIndex={6}>
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
                      options={departmentData?.data?.results.map((item: any) => ({ value: item.id, label: item.name }))}
                      isLoading={departmentIsLoading}
                      value={departmentData?.data?.results
                        .map((item: any) => ({ value: item.id, label: item.name }))
                        .find((c: any) => c.value === value)}
                      onChange={(option: { value: any }) => onChange(option?.value)}
                    />
                    <Input placeholder=" " value={value} hidden />
                    <FormLabel>
                      <Text display={'flex'} alignItems="center">
                        <Text as="span" mr={'8px'} display={'flex'} alignItems="center" justifyContent={'center'}>
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
          </InputGroup>
        </Box>

        <Box w="100%" mb="24px">
          <FormControl variant="floating" isInvalid={!!errors.email}>
            <InputGroup>
              <InputLeftElement>
                <Icon as={AiOutlineMail} color="grey.500" />
              </InputLeftElement>
              <Input type="email" placeholder="" {...register('email')} />
              <FormLabel>Official Email ID</FormLabel>
            </InputGroup>
            {errors.email && (
              <FormErrorMessage>
                <Icon as={MdError} /> {errors.email.message}
              </FormErrorMessage>
            )}
          </FormControl>
        </Box>

        <Box w="100%" mb="24px">
          <FormControl variant="floating" isInvalid={!!errors.user_name}>
            <InputGroup>
              <InputLeftElement>
                <Icon as={AiOutlineUser} color="grey.500" />
              </InputLeftElement>
              <Input placeholder="" {...register('user_name')} />
              <FormLabel>Username</FormLabel>
            </InputGroup>
            {errors.user_name && (
              <FormErrorMessage>
                <Icon as={MdError} /> {errors.user_name.message}
              </FormErrorMessage>
            )}
          </FormControl>
        </Box>

        <Box w="100%" mb="24px">
          <FormControl variant="floating" isInvalid={!!errors.password}>
            <InputGroup>
              <InputLeftElement>
                <Icon as={BiLock} color="grey.500" />
              </InputLeftElement>
              <Input pr="0.5rem" placeholder="" type={showPassword ? 'text' : 'password'} {...register('password')} />
              <FormLabel>Password</FormLabel>
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" p="0" size="sm" variant="ghost" onClick={handleShowPassword}>
                  {showPassword ? (
                    <Icon as={AiFillEye} color="grey.500" />
                  ) : (
                    <Icon as={AiFillEyeInvisible} color="grey.500" />
                  )}
                </Button>
              </InputRightElement>
            </InputGroup>
            {errors.password && (
              <FormErrorMessage>
                <Icon as={MdError} /> {errors.password.message}
              </FormErrorMessage>
            )}
          </FormControl>
        </Box>

        <Box w="100%" mb="40px">
          <FormControl variant="floating" isInvalid={!!errors.confirmPassword}>
            <InputGroup>
              <InputLeftElement>
                <Icon as={BiLock} color="grey.500" />
              </InputLeftElement>
              <Input
                pr="0.5rem"
                placeholder=""
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
              />
              <FormLabel>Confirm password</FormLabel>
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" p="0" size="sm" variant="ghost" onClick={handleShowConfirmPassword}>
                  {showConfirmPassword ? (
                    <Icon as={AiFillEye} color="grey.500" />
                  ) : (
                    <Icon as={AiFillEyeInvisible} color="grey.500" />
                  )}
                </Button>
              </InputRightElement>
            </InputGroup>
            {errors.confirmPassword && (
              <FormErrorMessage>
                <Icon as={MdError} /> {errors.confirmPassword.message}
              </FormErrorMessage>
            )}
          </FormControl>
        </Box>

        <Box w="100%" mb="20px">
          <Button
            w="100%"
            bg={'#137E59'}
            isLoading={isLoading}
            loadingText="Submitting"
            onClick={() => triggerValidation(getValues, setValue, trigger, onSubmit)}
          >
            Sign Up
          </Button>
        </Box>

        <Box w="100%" mb="20px">
          <Box fontSize="md" textAlign="center">
            Already have an account?{' '}
            <Link to={URLS.LOG_IN}>
              <Text fontWeight={600} display="inline-block" color="#137E59">
                Sign in
              </Text>
            </Link>
          </Box>
        </Box>
      </Flex>
    </form>
  );
};

export default SignUp;

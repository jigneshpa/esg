import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AiFillEye, AiFillEyeInvisible, AiOutlineUser } from 'react-icons/ai';
import { BiLock } from 'react-icons/bi';
import { MdError } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
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

import { logoGreen } from '@/assets';
import { URLS, USER_ROLE } from '@/constants';
import { replaceString, triggerValidation } from '@/utils';
import { yupResolver } from '@hookform/resolvers/yup';

import { useAuth } from '../../../hooks/useAuth';
import { LoginRequest } from '../../../types/store/api/authentication';
import { loginSchema } from '../../../types/validation-schemas/login';

const Login = () => {
  const { handleLogin, isAuthLoading, isUserInfoLoading } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(false);
  const handleShowPassword = () => setShow(!show);
  const handleRemember = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRemember(e.target.checked);
  };
  const {
    register,
    trigger,
    getValues,
    setValue,
    formState: { errors }
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(loginSchema)
  });
  // const logoImage = import.meta.env.VITE_IS_CLIENT === 'false' ? logoGreen : UobLogo;
  const logoImage = logoGreen;

  const processData = (data: any) => {
    const processedData: any = {};
    Object.entries(data).forEach(([key, value]) => {
      // Trim whitespace from string values
      processedData[key] = typeof value === 'string' ? value.trim() : value;
    });
    return processedData;
  };

  const onSubmit = async (value: LoginRequest) => {
    const processedValue = processData(value);
    const result = await handleLogin({ remember, value: processedValue });
    if (result) {
      const { isUserVerified, user_id, role } = result;

      if (!isUserVerified) {
        const mapObj = {
          '/:redirectPage': URLS.LOG_IN,
          ':userId': user_id
        };
        const redirectUrl = replaceString(URLS.VERIFICATION, mapObj);
        navigate(redirectUrl);
      } else {
        console.log(role, role === USER_ROLE.MANAGERL2);
        if (role === USER_ROLE.ADMIN || role === USER_ROLE.USER_ADMIN) navigate(URLS.ADMIN);

        if (role === USER_ROLE.MANAGER) navigate(URLS.MANAGER);

        if (role === USER_ROLE.MANAGERL2) navigate(URLS.MANAGERL2);

        if (role === USER_ROLE.USER) navigate(URLS.USER);
      }
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
          Login
        </Heading>
        <Box w="100%" mb="24px">
          <FormControl
            variant="floating"
            isInvalid={!!errors.username}
            sx={{
              '& .chakra-form__label[data-focus]': {
                color: '#14AE5C'
              },
              '& .chakra-form__label[data-shrink="true"]': {
                color: '#14AE5C'
              },
              '& input:focus': {
                borderColor: '#14AE5C',
                boxShadow: '0 0 0 1px #14AE5C'
              }
            }}
          >
            <InputGroup>
              <InputLeftElement>
                <Icon as={AiOutlineUser} color="grey.500" />
              </InputLeftElement>
              <Input placeholder="" {...register('username')} />
              <FormLabel>Username</FormLabel>
            </InputGroup>

            {errors.username && (
              <FormErrorMessage>
                <Icon as={MdError} /> {errors.username.message}
              </FormErrorMessage>
            )}
          </FormControl>
        </Box>
        <Box w="100%" mb="24px">
          <FormControl
            variant="floating"
            isInvalid={!!errors.password}
            sx={{
              '& .chakra-form__label[data-focus]': {
                color: '#14AE5C'
              },
              '& .chakra-form__label[data-shrink="true"]': {
                color: '#14AE5C'
              },
              '& input:focus': {
                borderColor: '#14AE5C',
                boxShadow: '0 0 0 1px #14AE5C'
              }
            }}
          >
            <InputGroup>
              <InputLeftElement>
                <Icon as={BiLock} color="grey.500" />
              </InputLeftElement>
              <Input pr="0.5rem" placeholder="" type={show ? 'text' : 'password'} {...register('password')} />
              <FormLabel>Password</FormLabel>
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" p="0" size="sm" variant="ghost" onClick={handleShowPassword}>
                  {show ? <Icon as={AiFillEye} color="grey.500" /> : <Icon as={AiFillEyeInvisible} color="grey.500" />}
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
          <Flex justifyContent="space-between" alignItems="center">
            <Stack>
              <Checkbox isChecked={remember} onChange={handleRemember} spacing="10px">
                Remember me
              </Checkbox>
            </Stack>
            <Link to="/forgot-password">
              <Heading size="sm" display="inline-block" color="black" fontWeight="500" ml="4px">
                Forgot password?
              </Heading>
            </Link>
          </Flex>
        </Box>
        <Box w="100%" mb="20px">
          <Button
            w="100%"
            bg={'primary'}
            isLoading={isAuthLoading || isUserInfoLoading}
            loadingText={'Submitting'}
            onClick={() => triggerValidation(getValues, setValue, trigger, onSubmit)}
          >
            Log In
          </Button>
        </Box>
        {import.meta.env.VITE_IS_CLIENT == 'false' && (
          <Box w="100%" mb="20px">
            <Box fontSize="sm" textAlign="center">
              Don’t have an account? Contact :{' '}
              <Link to="mailto:support@greenfi.ai">
                <Text fontWeight={600} display="inline-block" color="primary">
                  support@greenfi.ai
                </Text>
              </Link>
            </Box>
          </Box>
        )}
      </Flex>
    </form>
  );
};

export default Login;

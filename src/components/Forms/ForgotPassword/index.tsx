import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AiOutlineMail } from 'react-icons/ai';
import { FaChevronLeft } from 'react-icons/fa';
import { MdError } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Text
} from '@chakra-ui/react';

import { MESSAGE, STATUS, URLS } from '@/constants';
import { replaceString } from '@/utils';
import { yupResolver } from '@hookform/resolvers/yup';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { useAppContext } from '../../../context/AppContext';
import { authApi } from '../../../store/api/authentication/authApi';
import { ErrorData } from '../../../types/common';
import { ForgotPasswordRequest } from '../../../types/store/api/authentication';
import { forgotPasswordSchema } from '../../../types/validation-schemas/forgot-password';

const ForgotPassword = () => {
  const { notify } = useAppContext();
  const [forgotPassword, { isLoading, isError, error }] = authApi.useForgotPasswordMutation();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema)
  });

  useEffect(() => {
    if (isError && error) {
      notify({
        type: STATUS.ERROR,
        message: ((error as FetchBaseQueryError).data as ErrorData)?.message || MESSAGE.SEND_MAIL_ADDRESS_FAIL
      });
    }
  }, [isError, error, notify]);

  const processData = (data: any) => {
    const processedData: any = {};
    Object.entries(data).forEach(([key, value]) => {
      // Trim whitespace from string values
      processedData[key] = typeof value === 'string' ? value.trim() : value;
    });
    return processedData;
  };

  const onSubmit = async (email: ForgotPasswordRequest) => {
    try {
      const processedEmail = processData(email);
      const result = await forgotPassword(processedEmail).unwrap();

      const user_id = result.data.user_id;
      if (user_id) {
        const mapObj = {
          '/:redirectPage/:userId': URLS.RESET_PASSWORD,
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column" w={'100%'}>
        <Flex alignItems="center" justify="center" gap="16px" mb="32px">
          <IconButton
            aria-label="go-back"
            icon={<FaChevronLeft />}
            bg="grey.100"
            color="black"
            borderRadius="100%"
            _hover={{
              color: 'white',
              bg: 'primary'
            }}
            onClick={() => navigate(URLS.LOG_IN)}
          />
          <Heading mr="auto" ml="50px" as="h1" size="lg">
            Forgot Password
          </Heading>
        </Flex>
        <Box w="100%" mb="24px">
          <Text
            as="p"
            textAlign="center"
            fontSize={{
              base: '0.8em',
              md: '0.9em',
              lg: '1em'
            }}
          >
            Enter your email address to receive a Verification Code
          </Text>
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
        <Box w="100%" mb="20px">
          <Button w="100%" type="submit" isLoading={isLoading} loadingText="Submitting">
            Send
          </Button>
        </Box>
      </Flex>
    </form>
  );
};

export default ForgotPassword;

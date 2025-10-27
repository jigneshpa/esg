//@ts-nocheck
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { BiLock } from 'react-icons/bi';
import { MdError } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text
} from '@chakra-ui/react';

import { URLS } from '@/constants';
import { authApi } from '@/store/api/authentication/authApi';
import { resetPasswordSchema } from '@/types/validation-schemas/reset-password';
import { yupResolver } from '@hookform/resolvers/yup';

const ResetPassword = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(resetPasswordSchema)
  });
  const [resetPassword, { isLoading }] = authApi.useResetPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { userId } = useParams();

  const processData = (data: any) => {
    const processedData: any = {};
    Object.entries(data).forEach(([key, value]) => {
      // Trim whitespace from string values
      processedData[key] = typeof value === 'string' ? value.trim() : value;
    });
    return processedData;
  };

  const onSubmit = async value => {
    try {
      const processedValue = processData(value);
      await resetPassword({
        user_id: userId,
        new_password: processedValue.password
      }).unwrap();

      //   notify({ message: MESSAGE.RESET_PASSWORD_SUCCESS });
      navigate(URLS.LOG_IN, { replace: true });
    } catch (error) {
      //   notify({
      //     type: STATUS.ERROR,
      //     message: error?.data?.message || MESSAGE.RESET_PASSWORD_FAIL
      //   });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column" w={'100%'}>
        <Heading as="h1" size="lg" mb={'28px'}>
          Reset Password
        </Heading>

        <Box w="100%" mb="24px">
          <Text
            as="p"
            fontSize={{
              base: '0.8em',
              md: '0.9em',
              lg: '1em'
            }}
          >
            Enter your new password
          </Text>
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
                <Button h="1.75rem" p="0" size="sm" variant="ghost" onClick={() => setShowPassword(!showPassword)}>
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
        <Box w="100%" mb="24px">
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
              <FormLabel>Confirm new password</FormLabel>
              <InputRightElement width="4.5rem">
                <Button
                  h="1.75rem"
                  p="0"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
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
          <Button w="100%" type="submit" isLoading={isLoading} loadingText="Submitting">
            Reset password
          </Button>
        </Box>
      </Flex>
    </form>
  );
};

export default ResetPassword;

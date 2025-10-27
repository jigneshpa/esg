//@ts-nocheck
import React from 'react';
import { useForm } from 'react-hook-form';
import { FaChevronLeft } from 'react-icons/fa';
import { MdError } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  PinInput,
  PinInputField,
  Text,
  useToken
} from '@chakra-ui/react';

import { logoGreen, UobLogo } from '@/assets';
import { URLS } from '@/constants';
import { authApi } from '@/store/api/authentication/authApi';
import { verificationCodeSchema } from '@/types/validation-schemas/verification-code';
import { replaceString } from '@/utils';
import { yupResolver } from '@hookform/resolvers/yup';

const VerificationCode = () => {
  const {
    setValue,
    clearErrors,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(verificationCodeSchema)
  });
  const { redirectPage, userId } = useParams();
  const [verifyCodeSignUp, { isLoading: isSigningUp }] = authApi.useVerifyCodeSignUpMutation();
  const [verifyCodeForgotPassword, { isLoading: isResettingPassword }] = authApi.useVerifyCodeForgotPasswordMutation();
  const navigate = useNavigate();
  const [primaryColor, errorColor] = useToken('colors', ['primary', 'red.500']);

  const logoImage = import.meta.env.VITE_IS_CLIENT === 'false' ? logoGreen : UobLogo;

  const handlePinInputChange = e => {
    // Workaround e.target.value.charAt(0)): only check the first character that the PinInputField can collect,
    // PinInputField's value is set to be only 1 number.
    // But this field is still able to collect an additional string character behind the first number (Ex: '1a') before processing to the correct value.
    if (e.target.value && !isNaN(e.target.value.charAt(0))) {
      e.target.style.boxShadow = `0 0 0 1px ${primaryColor}`;
      e.target.style.borderColor = primaryColor;
    } else {
      e.target.style.boxShadow = `0 0 0 1px ${errorColor}`;
      e.target.style.borderColor = errorColor;
    }
  };

  const handleCheckValidate = () => {
    const pinInputFields = document.querySelector('#verificationInput').childNodes;
    pinInputFields.forEach(element => {
      if (element.value === '') {
        element.style.boxShadow = `0 0 0 1px ${errorColor}`;
        element.style.borderColor = errorColor;
      }
    });
  };

  const handleInputChange = value => {
    setValue('verificationCode', value);
    if (value.length === 4) clearErrors();
  };

  const onSubmit = async value => {
    try {
      if (`/${redirectPage}` === URLS.LOG_IN) {
        await verifyCodeSignUp({
          code: value.verificationCode,
          user_id: +userId
        }).unwrap();

        navigate(URLS.LOG_IN, { replace: true });
        // notify({ message: MESSAGE.VERIFICATION_SUCCESS });
      } else if (`/${redirectPage}/:userId` === URLS.RESET_PASSWORD) {
        await verifyCodeForgotPassword({
          code: value.verificationCode,
          user_id: +userId
        }).unwrap();
        const mapObj = { ':userId': userId };
        const redirectUrl = replaceString(URLS.RESET_PASSWORD, mapObj);
        navigate(redirectUrl, { replace: true });
      }
    } catch (error) {
      //   notify({
      //     type: STATUS.ERROR,
      //     message: error?.data?.message || MESSAGE.VERIFICATION_FAIL
      //   });
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column">
        <Image
          src={logoImage}
          cursor={'pointer'}
          mb="50px"
          display={{
            base: 'block'
          }}
          h={{
            base: '60px',
            md: '70px'
          }}
        />
        <Flex
          alignItems="center"
          gap="16px"
          mb="32px"
          justifyContent={{
            base: 'center'
          }}
          position={'relative'}
        >
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
            onClick={() => import.meta.env.VITE_IS_CLIENT == "false" ? navigate(URLS.SIGN_UP) : navigate(URLS.LOG_IN)}
            position={{
              lg: 'static'
            }}
            mr="auto"
          />
          <Heading as="h1" mr="105px" size="lg">
            Verification Code
          </Heading>
        </Flex>
        <Box w="100%" mb="24px">
          <Text
            as="p"
            textAlign={{
              base: 'center'
            }}
            fontSize={{
              base: '0.8em',
              md: '0.9em',
              lg: '1em'
            }}
          >
            Enter the code from email we just sent you
          </Text>
        </Box>
        <FormControl isInvalid={errors.verificationCode}>
          <Box w="100%" mb="24px">
            <HStack
              id={'verificationInput'}
              justifyContent={{
                base: 'center'
              }}
            >
              <PinInput placeholder="" focusBorderColor="primary" otp onChange={handleInputChange}>
                <PinInputField onChange={handlePinInputChange} />
                <PinInputField onChange={handlePinInputChange} />
                <PinInputField onChange={handlePinInputChange} />
                <PinInputField onChange={handlePinInputChange} />
              </PinInput>
            </HStack>
            {errors.verificationCode && (
              <FormErrorMessage
                justifyContent={{
                  base: 'center',
                  lg: 'flex-start'
                }}
              >
                <Icon as={MdError} /> {errors.verificationCode.message}
              </FormErrorMessage>
            )}
          </Box>
        </FormControl>
        <Box w="100%" mb="20px">
          <Button
            w="100%"
            type="submit"
            isLoading={isSigningUp || isResettingPassword}
            loadingText={'Submitting'}
            onClick={handleCheckValidate}
          >
            Submit
          </Button>
        </Box>
      </Flex>
    </form>
  );
};

export default VerificationCode;

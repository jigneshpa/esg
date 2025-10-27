//@ts-nocheck
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { BiLock } from 'react-icons/bi';
import { MdError } from 'react-icons/md';
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Show,
  Text,
  VStack
} from '@chakra-ui/react';

import API from '@/api';
import { MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/user/userSelectors';
import { passwordChangeSchema } from '@/types/validation-schemas/change-password';
import { triggerValidation } from '@/utils';
import { yupResolver } from '@hookform/resolvers/yup';

const ChangePassword = () => {
  const { notify, confirm } = useAppContext();
  const user = useAppSelector(selectUser);
  const {
    register,
    getValues,
    setValue,
    trigger,
    reset,
    formState: { errors, isValid }
  } = useForm({
    resolver: yupResolver(passwordChangeSchema),
    mode: 'onChange',
    defaultValues: {
      old_password: ''
    }
  });

  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(null);

  const updateUserInfo = async data => {
    setSubmitting(true);
    try {
      await API.patchUserInfo(data, user?.id);
      notify({
        message: MESSAGE.RESET_PASSWORD_SUCCESS
      });
      reset();
    } catch (error) {
      notify({
        type: STATUS.ERROR,
        message: error?.response?.data?.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmit = async value => {
    confirm({
      title: 'Update password',
      message: 'Please confirm',
      onOk: () => updateUserInfo(value)
    });
  };

  return (
    <VStack w={'100%'} gap={'24px'} align={'start'} p={{ base: '24px 0 0 0', lg: '24px 30px 0 70px' }}>
      <Show above={'lg'}>
        <Text fontSize={'24px'} fontWeight={700}>
          Update password
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
          <Flex
            w={'100%'}
            bg={'white'}
            p={{
              base: '20px 16px 32px',
              lg: '40px'
            }}
            justify="center"
            borderRadius={'16px'}
            flexDirection={{
              base: 'column',
              lg: 'row'
            }}
          >
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
                      type={show ? 'text' : 'password'}
                      {...register('old_password')}
                      autoComplete="new-password"
                    />
                    <InputRightElement width="4.5rem">
                      <Button h="1.75rem" p="0" size="sm" variant="ghost" onClick={() => setShow(!show)}>
                        {show ? (
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
                    <Input pr="0.5rem" type={show ? 'text' : 'password'} {...register('new_password')} />
                    <InputRightElement width="4.5rem">
                      <Button h="1.75rem" p="0" size="sm" variant="ghost" onClick={() => setShow(!show)}>
                        {show ? (
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
                    <Input pr="0.5rem" type={show ? 'text' : 'password'} {...register('confirm_new_password')} />
                    <InputRightElement width="4.5rem">
                      <Button h="1.75rem" p="0" size="sm" variant="ghost" onClick={() => setShow(!show)}>
                        {show ? (
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
            md: '32px 0px'
          }}
        >
          <Button
            as={'button'}
            h={'44px'}
            onClick={() => triggerValidation(getValues, setValue, trigger, onSubmit)}
            isDisabled={!isValid}
            isLoading={!!submitting}
            loadingText={'Saving'}
          >
            Update password
          </Button>
        </Flex>
      </form>
    </VStack>
  );
};

export default ChangePassword;

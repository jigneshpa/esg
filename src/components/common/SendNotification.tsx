//@ts-nocheck
import { useForm } from 'react-hook-form';
import { MdError } from 'react-icons/md';
import { Box, Button, FormControl, FormErrorMessage, Icon, Text, Textarea, VStack } from '@chakra-ui/react';
import * as yup from 'yup';

import { triggerValidation } from '@/utils';
import { yupResolver } from '@hookform/resolvers/yup';

const schema = yup.object({
  content: yup.string().required('This field is required!')
});

const SendNotification = ({ submitting, onSubmit }) => {
  const {
    register,
    watch,
    getValues,
    setValue,
    trigger,
    formState: { isDirty, errors }
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema)
  });
  const watchContent = watch('content');

  return (
    <VStack w={'100%'}>
      <form>
        <VStack align={'start'} gap={'16px'}>
          <Text fontSize={'24px'} fontWeight={500}>
            Notification
          </Text>
          <VStack gap={'8px'} w={'100%'} align={'flex-start'}>
            <Text>Content</Text>
            <FormControl isInvalid={errors.content}>
              <Textarea w={'100%'} minH={'200px'} {...register('content')} />
              {errors.content && (
                <FormErrorMessage>
                  <Icon as={MdError} /> {errors.content.message}
                </FormErrorMessage>
              )}
            </FormControl>
            <Box w="100%">
              <Button
                w="100%"
                onClick={() => triggerValidation(getValues, setValue, trigger, onSubmit)}
                isDisabled={!isDirty || watchContent === ''}
                isLoading={submitting}
                loadingText="Submitting"
              >
                Submit
              </Button>
            </Box>
          </VStack>
        </VStack>
      </form>
    </VStack>
  );
};

export default SendNotification;

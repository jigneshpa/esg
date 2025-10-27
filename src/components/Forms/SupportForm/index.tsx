//@ts-nocheck
import { useForm } from 'react-hook-form';
import { MdError } from 'react-icons/md';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Icon,
  Input,
  Text,
  Textarea,
  VStack
} from '@chakra-ui/react';

import { supportSchema } from '@/types/validation-schemas/support';
import { yupResolver } from '@hookform/resolvers/yup';

const fontStyle = {
  fontSize: '12px',
  fontWeight: 600
};

const placeholderStyle = {
  fontSize: '12px',
  fontWeight: '600',
  opacity: 0.6,
  color: 'grey.800',
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)'
};

const SupportForm = ({ submitting, onSubmit }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(supportSchema)
  });

  const processData = (data: any) => {
    const processedData: any = {};
    Object.entries(data).forEach(([key, value]) => {
      // Trim whitespace from string values
      processedData[key] = typeof value === 'string' ? value.trim() : value;
    });
    return processedData;
  };

  return (
    <form onSubmit={handleSubmit(data => onSubmit(processData(data), reset))}>
      <Flex direction="column" align="center" bg={'white'}>
        <Box w="100%" mb="16px">
          <FormControl isInvalid={errors.full_name}>
            <VStack gap={'8px'} align={'start'}>
              <Text sx={fontStyle}>Full name*</Text>
              <Input placeholder="Enter your name" _placeholder={placeholderStyle} {...register('full_name')} />
              {errors.full_name && (
                <FormErrorMessage>
                  <Icon as={MdError} /> {errors.full_name.message}
                </FormErrorMessage>
              )}
            </VStack>
          </FormControl>
        </Box>
        <Box w="100%" mb="16px">
          <FormControl isInvalid={errors.email}>
            <VStack gap={'8px'} align={'start'}>
              <Text sx={fontStyle}>Email*</Text>
              <Input placeholder="Enter your email" _placeholder={placeholderStyle} {...register('email')} />
              {errors.email && (
                <FormErrorMessage>
                  <Icon as={MdError} /> {errors.email.message}
                </FormErrorMessage>
              )}
            </VStack>
          </FormControl>
        </Box>
        <Box w="100%" mb="16px">
          <FormControl isInvalid={errors.phone}>
            <VStack gap={'8px'} align={'start'}>
              <Text sx={fontStyle}>Phone number*</Text>
              <Input placeholder="Enter your phone number" _placeholder={placeholderStyle} {...register('phone')} />
              {errors.phone && (
                <FormErrorMessage>
                  <Icon as={MdError} /> {errors.phone.message}
                </FormErrorMessage>
              )}
            </VStack>
          </FormControl>
        </Box>
        <Box w="100%" mb="16px">
          <FormControl>
            <VStack gap={'8px'} align={'start'}>
              <Text sx={fontStyle}>Organization name</Text>
              <Input
                placeholder="Enter your Organization name"
                _placeholder={placeholderStyle}
                {...register('organization')}
              />
            </VStack>
          </FormControl>
        </Box>
        <Box w="100%" mb="16px">
          <FormControl>
            <VStack gap={'8px'} align={'start'}>
              <Text sx={fontStyle}>Job title</Text>
              <Input placeholder="Enter your Job title" _placeholder={placeholderStyle} {...register('job_title')} />
            </VStack>
          </FormControl>
        </Box>
        <Box w="100%" mb="16px">
          <FormControl isInvalid={errors.question}>
            <VStack gap={'8px'} align={'start'}>
              <Text sx={fontStyle}>Question*</Text>
              <Textarea
                placeholder="Message"
                _placeholder={{
                  ...placeholderStyle,
                  top: '10px',
                  transform: 'translateY(0)'
                }}
                {...register('question')}
                h={{
                  base: '100px',
                  md: '120px',
                  lg: '130px'
                }}
              />
              {errors.question && (
                <FormErrorMessage>
                  <Icon as={MdError} /> {errors.question.message}
                </FormErrorMessage>
              )}
            </VStack>
          </FormControl>
        </Box>
        <Box w="100%" mb="20px">
          <Button
            w={{
              base: '100%',
              lg: '124px'
            }}
            type="submit"
            isLoading={submitting}
            loadingText="Submitting"
          >
            Submit
          </Button>
        </Box>
      </Flex>
    </form>
  );
};

export default SupportForm;

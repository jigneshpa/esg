import React, { useState } from 'react';
import { Calendar } from 'react-date-range';
import { useForm } from 'react-hook-form';

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

import { MdError } from 'react-icons/md';
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  Select,
  Switch,
  Text,
  Textarea,
  VStack
} from '@chakra-ui/react';
import { enUS } from 'date-fns/locale';
import moment from 'moment/moment';
import * as yup from 'yup';

import { yupResolver } from '@hookform/resolvers/yup';

const schema = yup.object({
  content: yup.string().required('This field is required!'),
  delay: yup.string(),
  recurring: yup.boolean(),
  frequency: yup.string().when('recurring', recurring => {
    return recurring[0] ? yup.string().required('Frequency is required when recurring is set.') : yup.string();
  })
});

const SendNotification = ({ asset, submitting, onSubmit }: any) => {
  const [date, setDate] = React.useState<Date>(new Date());
  const {
    register,
    watch,
    getValues,

    trigger,
    formState: { isDirty, errors }
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(schema)
  });

  console.log(errors, 'errors');
  const watchContent = watch('content');
  const [isRecurring, setIsRecurring] = useState(false);

  const handleRecurringToggle = () => setIsRecurring(!isRecurring);

  return (
    <VStack w={'100%'}>
      <form>
        <VStack align={'start'} gap={'16px'}>
          <Text fontSize={'24px'} fontWeight={500}>
            Notification
          </Text>
          <Text fontSize="18px" fontWeight={400}>
            You are sending a notification regarding <strong>{asset?.name}</strong> to{' '}
            <strong>{asset?.assignees?.map((assignee: any) => assignee.fullName).join(', ')}</strong>.
          </Text>
          <VStack gap={'8px'} w={'100%'} align={'flex-start'}>
            <Text>Content</Text>
            <FormControl isInvalid={!!errors.content}>
              <Textarea w={'100%'} minH={'200px'} {...register('content')} />
              {errors.content && (
                <FormErrorMessage>
                  <Icon as={MdError} /> {errors.content.message}
                </FormErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.content} style={{ display: 'flex', justifyContent: 'center' }}>
              <Calendar minDate={new Date()} date={date} locale={enUS} onChange={setDate} />
            </FormControl>
            <FormControl>
              <Text>Delay Notification</Text>
              <Select {...register('delay')}>
                <option value="">No Delay</option>
                <option value="5m">5 minutes</option>
                <option value="10m">10 minutes</option>
                <option value="30m">30 minutes</option>
                <option value="1h">1 hour</option>
                <option value="1d">1 day</option>
              </Select>
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel htmlFor="recurring" mb="0">
                Set as Recurring
              </FormLabel>
              <Switch
                id="recurring"
                {...register('recurring')}
                isChecked={isRecurring}
                onChange={handleRecurringToggle}
              />
            </FormControl>

            {isRecurring && (
              <FormControl isInvalid={!!errors.frequency}>
                <Text>Frequency</Text>
                <Select {...register('frequency')}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </Select>
                {errors.frequency && (
                  <FormErrorMessage>
                    <Icon as={MdError} /> {errors.frequency.message}
                  </FormErrorMessage>
                )}
              </FormControl>
            )}

            <Box w="100%">
              <Button
                w="100%"
                onClick={async () => {
                  const isValid = await trigger();
                  if (isValid) {
                    const formattedDate = moment(date).utc(true).startOf('day').toISOString();
                    onSubmit({ ...getValues(), date: formattedDate });
                  }
                }}
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

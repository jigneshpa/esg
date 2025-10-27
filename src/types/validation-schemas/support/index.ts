import * as yup from 'yup';

import { PHONE_NUM_REG_EX } from '@/constants';

export const supportSchema = yup.object({
  full_name: yup.string().required('Full name is required'),
  email: yup.string().email('Your email address is not valid').required('Email is required'),
  phone: yup
    .string()
    .required('Phone number is required')
    //@ts-ignore
    .test('phone', 'Invalid phone number', value => value.match(PHONE_NUM_REG_EX)),
  organization: yup.string(),
  job_title: yup.string(),
  question: yup.string().required('Question is required')
});

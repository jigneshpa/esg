import * as yup from 'yup';

import { NAME_REG_EX, PASSWORD_REG_EX } from '@/constants';

export const signUpSchema = yup.object({
  first_name: yup
    .string()
    .required('This field is required!')
    /*@ts-ignore */,
  last_name: yup
    .string()
    .required('This field is required!')
    /*@ts-ignore */,
  country_id: yup.string().required('This field is required!'),
  department: yup.string().required('This field is required!'),
  email: yup.string().email('Your email address is not valid').required('This field is required!'),
  user_name: yup.string().required('This field is required!'),
  password: yup
    .string()
    .required('This field is required!')
    .min(8, 'Password must be at least 8 characters')
    .test(
      'password',
      'Password must contain at least 1 lowercase, 1 uppercase, 1 number and 1 special character',
      /*@ts-ignore */
      value => value.match(PASSWORD_REG_EX)
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'The passwords you entered do not match')
    .required('This field is required!')
    .test(
      'confirmPassword',
      'Password must contain at least 1 lowercase, 1 uppercase, 1 number and 1 special character',
      /*@ts-ignore */
      value => value.match(PASSWORD_REG_EX)
    )
});

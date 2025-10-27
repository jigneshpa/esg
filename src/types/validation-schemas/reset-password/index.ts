import * as yup from 'yup';

import { PASSWORD_REG_EX } from '@/constants';

export const resetPasswordSchema = yup.object({
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required')
    .test(
      'password',
      'Password must contain at least 1 lowercase, 1 uppercase, 1 number and 1 special character',
      /*@ts-ignore */
      value => value.match(PASSWORD_REG_EX)
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Password does not match')
    .required('Confirm password is required')
    .test(
      'confirmPassword',
      'Password must contain at least 1 lowercase, 1 uppercase, 1 number and 1 special character',
      /*@ts-ignore */
      value => value.match(PASSWORD_REG_EX)
    )
});

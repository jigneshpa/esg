//@ts-nocheck
import * as yup from 'yup';

import { PASSWORD_REG_EX } from '@/constants';

export const passwordChangeSchema = yup.object().shape(
  {
    old_password: yup.string().required(),
    new_password: yup
      .string()
      .when(['old_password', 'confirm_new_password'], (values, schema) => {
        if (!!values[0]?.length || !!values[1]?.length) {
          return schema
            .required('New password is required')
            .min(8, 'Password must be at least 8 characters')
            .test(
              'new_password',
              'Password must contain at least 1 lowercase, 1 uppercase, 1 number and 1 special character',
              value => value.match(PASSWORD_REG_EX)
            );
        }
        return schema;
      })
      .required(),
    confirm_new_password: yup
      .string()
      .when(['old_password', 'new_password'], (values, schema) => {
        if (!!values[0]?.length || !!values[1]?.length) {
          return schema
            .required('Confirm password is required')
            .min(8, 'Password must be at least 8 characters')
            .test(
              'confirm_new_password',
              'Password must contain at least 1 lowercase, 1 uppercase, 1 number and 1 special character',
              value => value.match(PASSWORD_REG_EX)
            );
        }
        return schema;
      })
      .oneOf([yup.ref('new_password')], 'Password does not match')
      .required()
  },
  [
    ['new_password', 'confirm_new_password'],
    ['old_password', 'confirm_new_password'],
    ['old_password', 'new_password']
  ]
);

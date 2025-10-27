//@ts-nocheck
import * as yup from 'yup';

import { FILE_SIZE_LIMIT, NAME_REG_EX, PASSWORD_REG_EX } from '@/constants';

export const profileSchema = yup.object().shape({
  file: yup
    .mixed()
    .notRequired()
    .test('file', 'File too large', value => {
      if (value) {
        return value.size <= FILE_SIZE_LIMIT;
      } else {
        return true;
      }
    }),
  firstName: yup
    .string()
    .required('First Name is required'),
  lastName: yup
    .string()
    .required('Last Name is required'),
  userName: yup.string().required('User name is required'),
  department: yup.string().required('Department is required'),
  country_id: yup.string().required('Country is required'),
  old_password: yup.string().when(['new_password', 'confirm_new_password'], (values, schema) => {
    if (!!values[0]?.length || !!values[1]?.length) {
      return schema
        .required('Current password is required')
        .min(8, 'Password must be at least 8 characters');
    }
    return schema;
  }),
  new_password: yup.string().when(['old_password', 'confirm_new_password'], (values, schema) => {
    if (!!values[0]?.length || !!values[1]?.length) {
      return schema
        .required('New password is required')
        .min(8, 'Password must be at least 8 characters')
        .test(
          'new_password',
          'Password must contain at least 1 lowercase, 1 uppercase, 1 number and 1 special character',
          (value) => value.match(PASSWORD_REG_EX)
        );
    }
    return schema;
  }),
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
            (value) => value.match(PASSWORD_REG_EX)
          );
      }
      return schema;
    })
    .oneOf([yup.ref('new_password')], 'Password does not match'),
},
  [
    ['new_password', 'confirm_new_password'],
    ['old_password', 'confirm_new_password'],
    ['old_password', 'new_password']
  ]);

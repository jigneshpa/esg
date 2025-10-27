import * as yup from 'yup';

export const loginSchema = yup.object({
  username: yup.string().required('This field is required!'),
  password: yup.string().required('This field is required!')
});

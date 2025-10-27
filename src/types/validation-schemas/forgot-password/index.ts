import * as yup from 'yup';

export const forgotPasswordSchema = yup.object({
  email: yup.string().email('Your email address is not valid').required('This field is required!')
});

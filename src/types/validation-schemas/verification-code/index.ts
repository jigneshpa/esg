import * as yup from 'yup';

export const verificationCodeSchema = yup.object({
  verificationCode: yup.string().required('This field is required!').length(4, 'Your verification code is not valid')
});

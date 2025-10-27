import * as yup from 'yup';

export const userSchema = yup.object({
  userName: yup.string().required('User name is required'),
  firstName: yup.string().required('First Name is required'),
  lastName: yup.string().required('Last Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  country_id: yup.number().required('Country is required'),
  role: yup.string().required('Role is required'),
  department: yup.number().required('Department is required'),
  company: yup.number().required('Company is required'),
  subsidiary: yup.number().nullable().optional(),
  reportingTo: yup
    .number()
    .nullable()
    .when('role', {
      is: (role: string) => role === 'Employee' || role === 'Manager',
      then: schema => schema.required('Reporting manager is required'),
      otherwise: schema => schema.optional()
    })
});

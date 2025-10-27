import * as yup from 'yup';

export const companySchema = yup.object({
  name: yup.string().required('Name is required'),
  address: yup.string(),
  revenue: yup
    .number()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .nullable()
    .typeError('Revenue must be a number')
    .max(1000 * 1000 * 1000 * 1000, 'Revenue exceeds the limit'),
  industry_id: yup.number().nullable(),
  country_id: yup.number().required('Country is required'),
  postal_code: yup.string(),
  lei_id: yup.string().nullable().optional(),
  assignees: yup
    .string()
    .optional()
    /*@ts-ignore */
    .test('is-valid-usernames', 'Invalid username format', value => {
      if (!value) return true;
      const usernames = value.split(',').map(u => u.trim());
      //   .every(username => /^@[a-zA-Z0-9_]+$/.test(username));
      return usernames;
    }),
  two_factor: yup.boolean()
});

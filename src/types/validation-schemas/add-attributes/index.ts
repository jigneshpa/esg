import * as yup from 'yup';

export const questionBankSchema = yup.object({
  framework: yup.string().required('ESG Standard is required')
});

export const institutionSchema = yup.object({
  institution: yup.string().required('Institution is required')
});

export const departmentSchema = yup.object({
  department: yup.string().required('Department is required')
});

export const industrySchema = yup.object({
  industry: yup.string().required('Industry is required')
});

export const scopeSchema = yup.object({
  scope: yup.string().required('scope is required')
});

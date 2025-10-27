import * as yup from 'yup';

import { ISelect } from '@/types/common';

const useQuestionSchema = (
  type: null | ISelect,
  mode: string | undefined,
  isRquired: boolean | undefined,
  hasAttachment: boolean
) => {
  const schema = yup.object({
    title: yup.string().required('Question is required'),
    department: yup.array().of(yup.string()),
    scope: yup.number().nullable(),
    users: yup.array().of(yup.string()),
    type: yup.string().notRequired(),
    institution: yup.array().of(yup.string()),
    framework: yup.array().of(yup.string()),
    industry: yup.array().of(yup.string()),
    answer: yup.string().when(['mode', 'isRquired', 'type'], (modeValue, schema) => {
      return mode === 'answer' && isRquired && type?.value === 'dropDown'
        ? schema.required('Answer is required')
        : schema.notRequired();
    }),
    is_required: yup.boolean(),
    has_attachment: yup.boolean(),
    has_remarks: yup.boolean(),
    content: yup.string().when('mode', (modeValue, schema) => {
      return mode === 'answer' && isRquired && type?.value === 'textBox'
        ? schema.required('Content is required')
        : schema.notRequired();
    }),
    checkboxOptions: yup.array().when('answerType', (answerType, schema) => {
      if (type?.value === 'checkbox') {
        let newSchema = schema
          .of(
            yup.object().shape({
              text: yup.string().required('Option text is required'),
              remarks: yup.boolean(),
              isChecked: yup.boolean()
            })
          )
          .min(2, 'At least two options are required');

        if (mode === 'answer' && isRquired) {
          newSchema = newSchema.test('isChecked-test', 'At least one option must be checked', options => {
            const isValid = options?.some(option => option.isChecked);
            return isValid;
          });
        }
        return newSchema;
      }
      return yup.array().notRequired();
    }),
    tableOptions: yup.object().when('type', (_, schema) => {
      if (type?.value === 'table') {
        const newSchema = schema.shape({
          id: yup.string(),
          name: yup.string(),
          description: yup.string(),
          columns: yup.array().of(
            yup.object().shape({
              id: yup.string(),
              header: yup.string(),
              width: yup.number(),
              type: yup.string(),
              isHeader: yup.boolean(),
              isRequired: yup.boolean(),
              questionText: yup.string().optional()
            })
          ),
          cells: yup.array().of(
            yup.object().shape({
              id: yup.string(),
              rowIndex: yup.number(),
              colIndex: yup.number(),
              rowSpan: yup.number(),
              colSpan: yup.number(),
              content: yup.string(),
              isHeader: yup.boolean(),
              isQuestion: yup.boolean(),
              questionText: yup.string().optional()
            })
          ),
          rows: yup.number(),
          cols: yup.number()
        });
        
        return newSchema;
      }
      return yup.object().notRequired();
    }),
    radioOptions: yup.array().when('type', (typeValue, schema) => {
      if (type?.value === 'radio') {
        let newSchema = schema
          .of(
            yup.object().shape({
              text: yup.string().required('Option text is required'),
              remarks: yup.boolean(),
              isChecked: yup.boolean()
            })
          )
          .min(2, 'At least two options are required');

        if (mode === 'answer' && isRquired) {
          newSchema = newSchema.test('isChecked-test', 'At least one option must be checked', options => {
            return options?.some(option => option.isChecked);
          });
        }

        return newSchema;
      }

      return yup.array().notRequired();
    }),
    dropDownOptions: yup.array().when('answerType', (_, schema) => {
      return type?.value === 'dropDown'
        ? schema.notRequired()
        : yup.array().notRequired();
    }),
    compare: yup.object().when('answerType', (_, schema) => {
      return type?.value === 'compare'
        ? schema.shape({
            compareLeft: yup
              .number()
              .typeError('Left value is required any should be number')
              .required('Left value is required'),
            comparisonType: yup.string().required('Comparison type is required'),
            compareRight: yup
              .number()
              .typeError('Left value is required any should be number')
              .required('Right value is required')
          })
        : yup
            .object()
            .shape({
              compareLeft: yup.number(),
              comparisonType: yup.string(),
              compareRight: yup.number()
            })
            .notRequired();
    }),
    files: yup.array().when(['has_attachment', 'is_required'], ([hasAttachmentValue, isRequiredValue], schema) => {
      if (mode === 'answer' && hasAttachmentValue && isRequiredValue) {
        return schema.min(1, 'Attachment is required');
      }
      return schema.notRequired();
    })
  });

  return schema;
};

export default useQuestionSchema;

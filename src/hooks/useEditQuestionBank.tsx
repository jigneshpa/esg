import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';
import { ErrorData } from '@/types/common';
import { QuestionBankFormData } from '@/types/forms/add-attributes';
import { questionBankSchema } from '@/types/validation-schemas/add-attributes';
import { yupResolver } from '@hookform/resolvers/yup';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export const useEditQuestionBank = () => {
  const { confirm, notify } = useAppContext();
  const [editQuestionBank, { isLoading, error, isSuccess, isError }] =
    questionnaireApi.useUpdateQuestionnaireBankMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(questionBankSchema),
    defaultValues: { framework: '' }
  });

  useEffect(() => {
    if (isSuccess) {
      notify({
        type: STATUS.SUCCESS,
        message: 'Question Bank successfully updated'
      });
      reset();
    } else if (isError && error) {
      notify({
        type: STATUS.ERROR,
        message: ((error as FetchBaseQueryError).data as ErrorData)?.message || MESSAGE.SOMEHING_WENT_WRONG
      });
    }
  }, [isSuccess, isError, error, notify, reset]);

  const processData = (data: any) => {
    const processedData: any = {};
    Object.entries(data).forEach(([key, value]) => {
      // Trim whitespace from string values
      processedData[key] = typeof value === 'string' ? value.trim() : value;
    });
    return processedData;
  };

  const onSubmit = ({ id, data }: { id: number, data: QuestionBankFormData }) => {
    const processedData = processData(data);
    confirm({
      title: 'Confirm editing',
      type: STATUS.APPROVED,
      message: 'Please confirm',
      onOk: async () => {
        const payload = { name: processedData.framework };

        await editQuestionBank({ id, data: payload });
      }
    });
  };

  return { control, handleSubmit, onSubmit, errors, isLoading };
};

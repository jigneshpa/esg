import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { industryApi } from '@/store/api/industry/industryApi';
import { ErrorData } from '@/types/common';
import { IndustryFormData } from '@/types/forms/add-attributes';
import { industrySchema } from '@/types/validation-schemas/add-attributes';
import { yupResolver } from '@hookform/resolvers/yup';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export const useAddIndustry = () => {
  const { confirm, notify } = useAppContext();
  const [createIndustry, { isLoading, error, isSuccess, isError }] = industryApi.useCreateIndustryMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(industrySchema),
    defaultValues: { industry: '' }
  });

  useEffect(() => {
    if (isSuccess) {
      notify({
        type: STATUS.SUCCESS,
        message: MESSAGE.CREATE_DEPARTMENT_SUCCESS
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

  const onSubmit = (data: IndustryFormData) => {
    const processedData = processData(data);
    confirm({
      title: 'Confirm Creating',
      type: STATUS.APPROVED,
      message: 'Please confirm',
      onOk: async () => {
        await createIndustry({ industries: [{ name: processedData.industry }] });
      }
    });
  };

  return { control, handleSubmit, onSubmit, errors, isLoading };
};

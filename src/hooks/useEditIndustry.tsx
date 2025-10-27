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

export const useEditIndustry = () => {
  const { confirm, notify } = useAppContext();
  const [editIndustry, { isLoading, error, isSuccess, isError }] = industryApi.useEditIndustryMutation();

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
        message: 'Industry successfully updated'
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

  const onSubmit = ({ id, data }: { id: number, data: IndustryFormData }) => {
    const processedData = processData(data);
    confirm({
      title: 'Confirm editing',
      type: STATUS.APPROVED,
      message: 'Please confirm',
      onOk: async () => {
        const payload = { industries: [{ name: processedData.industry }] };
        await editIndustry({ id, payload });
      }
    });
  };

  return { control, handleSubmit, onSubmit, errors, isLoading };
};

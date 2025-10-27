import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { scopeApi } from '@/store/api/scope/scopeApi';
import { ErrorData } from '@/types/common';
import { scopeFormData } from '@/types/forms/add-attributes';
import { scopeSchema } from '@/types/validation-schemas/add-attributes';
import { yupResolver } from '@hookform/resolvers/yup';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export const useAddScope = () => {
  const { confirm, notify } = useAppContext();
  const [createScope, { isLoading, error, isSuccess, isError }] = scopeApi.useCreateScopeMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(scopeSchema),
    defaultValues: { scope: '' }
  });

  useEffect(() => {
    if (isSuccess) {
      notify({
        type: STATUS.SUCCESS,
        message: MESSAGE.CREATE_SCOPE_SUCCESS
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

  const onSubmit = (data: scopeFormData) => {
    const processedData = processData(data);
    confirm({
      title: 'Confirm Creating',
      type: STATUS.APPROVED,
      message: 'Please confirm',
      onOk: async () => {
        await createScope({ scopes: [{ name: processedData.scope }] });
      }
    });
  };

  return { control, handleSubmit, onSubmit, errors, isLoading };
};

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { institutionApi } from '@/store/api/institution/institutionApi';
import { ErrorData } from '@/types/common';
import { InstitutionFormData } from '@/types/forms/add-attributes';
import { institutionSchema } from '@/types/validation-schemas/add-attributes';
import { yupResolver } from '@hookform/resolvers/yup';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export const useEditInstitution = () => {
  const { confirm, notify } = useAppContext();
  const [editInstitution, { isLoading, error, isSuccess, isError }] = institutionApi.useEditInstitutionMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(institutionSchema),
    defaultValues: { institution: '' }
  });

  useEffect(() => {
    if (isSuccess) {
      notify({
        type: STATUS.SUCCESS,
        message: 'Institution successfully updated'
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

  const onSubmit = ({ id, data }: { id: number, data: InstitutionFormData }) => {
    const processedData = processData(data);
    confirm({
      title: 'Confirm Editing',
      type: STATUS.APPROVED,
      message: 'Please confirm',
      onOk: async () => {
        const payload = { institutions: [{ name: processedData.institution }] };
        await editInstitution({ id, payload });
      }
    });
  };

  return { control, handleSubmit, onSubmit, errors, isLoading };
};

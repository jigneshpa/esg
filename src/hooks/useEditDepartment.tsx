import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { departmentApi } from '@/store/api/department/departmentApi';
import { ErrorData } from '@/types/common';
import { DepartmentFormData } from '@/types/forms/add-attributes';
import { departmentSchema } from '@/types/validation-schemas/add-attributes';
import { yupResolver } from '@hookform/resolvers/yup';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export const useEditDepartment = () => {
  const { confirm, notify } = useAppContext();
  const [editDepartment, { isLoading, error, isSuccess, isError }] = departmentApi.useEditDepartmentMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(departmentSchema),
    defaultValues: { department: '' }
  });

  useEffect(() => {
    if (isSuccess) {
      notify({
        type: STATUS.SUCCESS,
        message: 'Department successfully updated'
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

  const onSubmit = ({ id, data }: { id: number, data: DepartmentFormData }) => {
    const processedData = processData(data);
    confirm({
      title: 'Confirm editing',
      type: STATUS.APPROVED,
      message: 'Please confirm',
      onOk: async () => {
        console.log('confirmed');
        console.log('HOOKID:', id);
        console.log('HOOKDATA:', processedData);
        const payload = { departments: [{ name: processedData.department }] };
        await editDepartment({ id, payload });
      }
    });
  };

  return { control, handleSubmit, onSubmit, errors, isLoading };
};

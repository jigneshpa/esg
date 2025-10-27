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

export const useAddDepartment = () => {
  const { confirm, notify } = useAppContext();
  const [createDepartment, { isLoading, error, isSuccess, isError }] = departmentApi.useCreateDepartmentMutation();

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

  const onSubmit = (data: DepartmentFormData) => {
    const processedData = processData(data);
    confirm({
      title: 'Confirm Creating',
      type: STATUS.APPROVED,
      message: 'Please confirm',
      onOk: async () => {
        await createDepartment({ departments: [{ name: processedData.department }] });
      }
    });
  };

  return { control, handleSubmit, onSubmit, errors, isLoading };
};

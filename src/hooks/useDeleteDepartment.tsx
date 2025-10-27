import { useEffect } from 'react';

import { MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { departmentApi } from '@/store/api/department/departmentApi';
import { ErrorData } from '@/types/common';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const useDeleteDepartment = () => {
  const { confirm, notify } = useAppContext();
  const [deleteDepartment, { isLoading, error, isSuccess, isError }] = departmentApi.useDeleteDepartmentMutation();

  const _deleteDepartment = async (id: number) => {
    try {
      await deleteDepartment(id);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      notify({
        type: STATUS.SUCCESS,
        message: 'Department deleted successfully'
      });
    } else if (isError && error) {
      notify({
        type: STATUS.ERROR,
        message: ((error as FetchBaseQueryError).data as ErrorData)?.message || MESSAGE.SOMEHING_WENT_WRONG
      });
    }
  }, [isSuccess, isError, error, notify]);

  const handleDelete = (id: number) => {
    confirm({
      type: STATUS.APPROVED,
      message: 'Please confirm',
      onOk: () => _deleteDepartment(id)
    });
  };

  return { handleDelete, isLoading };
};

export default useDeleteDepartment;

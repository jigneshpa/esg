import { useEffect } from 'react';

import { MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { institutionApi } from '@/store/api/institution/institutionApi';
import { ErrorData } from '@/types/common';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const useDeleteInstitution = () => {
  const { confirm, notify } = useAppContext();
  const [deleteInstitution, { isLoading, error, isSuccess, isError }] = institutionApi.useDeleteInstitutionMutation();

  const _deleteInstitution = async (id: number) => {
    try {
      await deleteInstitution(id);
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
      onOk: () => _deleteInstitution(id)
    });
  };

  return { handleDelete, isLoading };
};

export default useDeleteInstitution;

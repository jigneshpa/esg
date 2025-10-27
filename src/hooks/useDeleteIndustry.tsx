import { useEffect } from 'react';

import { MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { industryApi } from '@/store/api/industry/industryApi';
import { ErrorData } from '@/types/common';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const useDeleteIndustry = () => {
  const { confirm, notify } = useAppContext();
  const [deleteIndustry, { isLoading, error, isSuccess, isError }] = industryApi.useDeleteIndustryMutation();

  const _deleteIndustry = async (id: number) => {
    try {
      await deleteIndustry(id);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      notify({
        type: STATUS.SUCCESS,
        message: 'Industry deleted successfully'
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
      onOk: () => _deleteIndustry(id)
    });
  };

  return { handleDelete, isLoading };
};

export default useDeleteIndustry;

import { useEffect } from 'react';

import { MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { companyApi } from '@/store/api/company/companyApi';
import { useAppDispatch } from '@/store/hooks';
import { setRefetchQuery } from '@/store/slices/refresh/refreshSlice';

export const useDeleteBulkCompany = () => {
  //@ts-ignore
  const { confirm, notify } = useAppContext();
  const dispatch = useAppDispatch();
  const [deleteBulkCompany, { isError, error, isSuccess }] = companyApi.useDeleteBulkCompanyMutation();

  const _deleteBulkCompany = async (companyIds: any) => {
    try {
      await deleteBulkCompany({ companyIds });
    } catch (e) {
      console.log(e);
    }
  };

  if (isSuccess) {
    dispatch(setRefetchQuery({ queryKey: 'assetsAll', value: true }));
  }

  useEffect(() => {
    if (isSuccess) {
      notify({
        type: STATUS.SUCCESS,
        message: MESSAGE.DELETE_COMPANY_SUCCESS
      });
      dispatch(setRefetchQuery({ queryKey: 'assetsAll', value: true }));
    } else if (isError && error) {
      notify({
        type: STATUS.ERROR,
        message: MESSAGE.DELETE_COMPANY_FAIL
      });
    }
  }, [isSuccess, isError, error, notify]);

  const handleDeleteBulkCompany = (companyIds: any) => {
    confirm({
      type: STATUS.ERROR,
      title: 'Delete subsidiaries',
      message: 'Please confirm',
      onOk: () => _deleteBulkCompany(companyIds),
      okBtnLabel: 'Delete',
    });
  };

  return handleDeleteBulkCompany;
};

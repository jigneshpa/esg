import { useEffect, useState } from 'react';
import { MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { companyApi } from '@/store/api/company/companyApi';
import { useAppDispatch } from '../store/hooks';
import { setRefetchQuery } from '../store/slices/refresh/refreshSlice';

export const useDeleteCompany = () => {
  const { confirm, notify } = useAppContext();
  const dispatch = useAppDispatch();
  const [deleteCompany, { isError, error, isSuccess, isLoading: isApiLoading }] = companyApi.useDeleteCompanyMutation();
  const [isSubsidiaryDeleted, setIsSubsidiaryDeleted] = useState(false);

  const _deleteCompany = async (companyId: number, isSubsidiary: boolean) => {
    try {
      setIsSubsidiaryDeleted(isSubsidiary);
      await deleteCompany(companyId);
    } catch (e) {
      console.log(e);
    }
  };

  if (isSuccess) {
    dispatch(setRefetchQuery({ queryKey: 'assetsAll', value: true }));
    dispatch(setRefetchQuery({ queryKey: 'companyAll', value: true }));
  }

  useEffect(() => {
    if (isSuccess) {
      notify({
        type: STATUS.SUCCESS,
        message: isSubsidiaryDeleted ? MESSAGE.DELETE_SUBSIDIARY_SUCCESS : MESSAGE.DELETE_COMPANY_SUCCESS,
      });
    } else if (isError && error) {
      notify({
        type: STATUS.ERROR,
        message: MESSAGE.DELETE_COMPANY_FAIL,
      });
    }
  }, [isSuccess, isError, error, notify]);

  const handleDeleteCompany = (
    companyId: number,
    companyName: any,
    isSubsidiary: boolean = false,
    parentId?: number,
    onSuccessRefetch?: () => void,
    onClosePopover?: () => void // Add onClosePopover
  ) => {
    confirm({
      type: STATUS.ERROR,
      title: `Are you sure you want to delete the company ${companyName}?`,
      message: 'Please confirm',
      okBtnLabel: 'Delete',
      isLoading: isApiLoading, // Pass isApiLoading for Confirm dialog
      onOk: async () => {
        await _deleteCompany(companyId, isSubsidiary);
        if (onSuccessRefetch) {
          onSuccessRefetch();
        }
        if (onClosePopover) {
          onClosePopover(); // Close popover after API call
        }
      },
      onCancel: () => {
        if (onClosePopover) onClosePopover(); // Close popover on cancel
      },
    });
  };

  return handleDeleteCompany;
};
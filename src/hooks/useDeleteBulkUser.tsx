import { useEffect } from 'react';

import { MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { userApi } from '@/store/api/user/userApi';
import { useAppDispatch } from '@/store/hooks';
import { setRefetchQuery } from '@/store/slices/refresh/refreshSlice';

export const useDeleteBulkUser = () => {
  //@ts-ignore
  const { confirm, notify } = useAppContext();
  const dispatch = useAppDispatch();
  const [deleteUser, { isError, error, isSuccess }] = userApi.useDeleteBulkUserMutation();

  const _deleteUser = async (userIds: any) => {
    try {
      await deleteUser(userIds);
    } catch (e) {
      console.log(e);
    }
  };

  if (isSuccess) {
    dispatch(setRefetchQuery({ queryKey: 'usersAll', value: true }));
  }

  useEffect(() => {
    if (isSuccess) {
      notify({
        type: STATUS.SUCCESS,
        message: MESSAGE.DELETE_USER_SUCCESS
      });
    } else if (isError && error) {
      notify({
        type: STATUS.ERROR,
        message: MESSAGE.DELETE_USER_FAIL
      });
    }
  }, [isSuccess, isError, error, notify]);

  const handleDeleteUser = (userIds: any) => {
    confirm({
      type: STATUS.ERROR,
      message: 'Please confirm',
      onOk: () => _deleteUser(userIds)
    });
  };

  return handleDeleteUser;
};

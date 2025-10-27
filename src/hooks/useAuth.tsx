import { useCallback, useEffect } from 'react';

import { GREENFI_ACCOUNT_DEACTIVATED, GREENFI_STORAGE_KEY, IS_SIDEBAR_OPEN, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { authApi } from '@/store/api/authentication/authApi';
import { userApi } from '@/store/api/user/userApi';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/user/userSlice';
import { ErrorData } from '@/types/common';
import { LoginRequest } from '@/types/store/api/authentication';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

export const useAuth = () => {
  const { notify, setIsSideBarOpen }: any = useAppContext();
  const [login, { isLoading: isAuthLoading, isError, error }] = authApi.useLoginMutation();
  const [getUserInfo, { isLoading: isUserInfoLoading }] = userApi.useGetUserInfoMutation();
  const dispatch = useAppDispatch();
  const handleLogin = useCallback(
    async ({
      remember,
      value
    }: {
      remember: boolean,
      value: LoginRequest
    }): Promise<{ isUserVerified: boolean, user_id: number, role: string } | false> => {
      try {
        const res = await login(value).unwrap();
        sessionStorage.removeItem(GREENFI_ACCOUNT_DEACTIVATED);
        const token = {
          accessToken: res.data.accessToken,
          refreshToken: res.data.refreshToken
        };

        remember
          ? localStorage.setItem(GREENFI_STORAGE_KEY, JSON.stringify(token))
          : sessionStorage.setItem(GREENFI_STORAGE_KEY, JSON.stringify(token));
        setIsSideBarOpen(true);
        localStorage.setItem(IS_SIDEBAR_OPEN, 'true');
        const result = await getUserInfo().unwrap();
        const isUserVerified = !!result.data.isVerified;
        localStorage.setItem("user", JSON.stringify(result.data));
        if (result.data.companyId) {
          sessionStorage.setItem("companyId", result.data.companyId.toString());
        }

        dispatch(setUser(result.data));

        return {
          isUserVerified,
          user_id: result.data.id,
          role: result.data.role
        };
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    [dispatch, getUserInfo, login]
  );

  useEffect(() => {
    if (isError && error) {
      notify({
        type: STATUS.ERROR,
        message: ((error as FetchBaseQueryError).data as ErrorData)?.message
      });
    }
  }, [isError, error, notify]);

  return {
    handleLogin,
    isAuthLoading,
    isUserInfoLoading
  };
};

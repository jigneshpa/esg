import { GREENFI_STORAGE_KEY, IS_SIDEBAR_OPEN, URLS } from '@/constants';
import { useLogout } from '@/hooks/useLogout';
import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

import { baseQueryWithAuth } from './baseQuery';

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const result = await baseQueryWithAuth(args, api, extraOptions);
  if (result.error && (result.error.status === 403 || result.error.status === 401)) {
    // Only clear specific auth-related items, not everything
    sessionStorage.removeItem(GREENFI_STORAGE_KEY);
    localStorage.removeItem(GREENFI_STORAGE_KEY);
    localStorage.removeItem(IS_SIDEBAR_OPEN);

    // Don't clear everything as it might interfere with Redux persist
    // sessionStorage.clear();
    // localStorage.clear();
  }
  return result;
};

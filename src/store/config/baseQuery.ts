import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { GREENFI_STORAGE_KEY } from '@/constants';

export const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_GREENFI_API,
  prepareHeaders: headers => {
    const token = sessionStorage.getItem(GREENFI_STORAGE_KEY) || localStorage.getItem(GREENFI_STORAGE_KEY);
    if (token) {
      const { accessToken } = JSON.parse(token);
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return headers;
  }
});

export const baseQueryWithoutAuth = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_GREENFI_API
});

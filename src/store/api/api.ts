import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth } from '@/store/config/baseQueryWithReauth';

import { baseQueryWithoutAuth } from '../config/baseQuery';

export const privateApiSlice = createApi({
  reducerPath: 'privateApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [],
  endpoints: () => ({})
});

export const privateCachedApiSlice = createApi({
  reducerPath: 'privateCachedApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Institution', 'Industry', 'Framework', 'Department'],
  endpoints: () => ({})
});

export const publicApiSlice = createApi({
  reducerPath: 'publicApi',
  baseQuery: baseQueryWithoutAuth,
  tagTypes: [],
  endpoints: () => ({})
});

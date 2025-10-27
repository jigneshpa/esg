import { privateCachedApiSlice } from '../api';

export const scopeApi = privateCachedApiSlice.injectEndpoints({
  endpoints: build => ({
    createScope: build.mutation({
      query: data => ({
        url: 'v2/scope',
        method: 'POST',
        body: data
      })
    }),
    getAllScopes: build.query({
      query: () => ({
        url: 'v2/scope/all',
        method: 'GET'
      })
    })
  })
});

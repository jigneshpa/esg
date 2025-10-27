import { privateCachedApiSlice } from '../api';

export const frameworkApi = privateCachedApiSlice.injectEndpoints({
  endpoints: build => ({
    createFramework: build.mutation({
      query: data => ({
        url: 'v2/framework',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Framework']
    }),
    editFramework: build.mutation({
      query: ({ id, payload }) => {
        return {
          url: `v2/framework/${id}`,
          method: 'PATCH',
          body: payload
        };
      },
      invalidatesTags: ['Framework']
    }),
    deleteFramework: build.mutation({
      query: id => ({
        url: `v2/framework/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Framework']
    }),
    getAllFrameworks: build.query({
      query: ({ page, max_results, search }) => {
        const queryParams = new URLSearchParams();
        if (page) queryParams.append('page', page);
        if (search) queryParams.append('search', search);
        if (max_results) queryParams.append('max_results', max_results);

        return {
          url: `/v2/framework/list?${queryParams}`,
          method: 'GET'
        };
      },
      providesTags: ['Framework']
    })
  })
});

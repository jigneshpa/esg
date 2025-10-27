import { privateCachedApiSlice } from '../api';

export const institutionApi = privateCachedApiSlice.injectEndpoints({
  endpoints: build => ({
    createInstitution: build.mutation({
      query: data => ({
        url: 'v2/institution',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Institution']
    }),
    editInstitution: build.mutation({
      query: ({ id, payload }) => ({
        url: `v2/institution/${id}`,
        method: 'PATCH',
        body: payload
      }),
      invalidatesTags: ['Institution']
    }),
    deleteInstitution: build.mutation({
      query: id => ({
        url: `v2/institution/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Institution']
    }),
    getAllinstitutions: build.query({
      query: ({ page, max_results, search }) => {
        const queryParams = new URLSearchParams();
        if (page) queryParams.append('page', page);
        if (search) queryParams.append('search', search);
        if (max_results) queryParams.append('max_results', max_results);

        return {
          url: `/v2/institution/list?${queryParams}`,
          method: 'GET'
        };
      },
      providesTags: ['Institution']
    })
  })
});

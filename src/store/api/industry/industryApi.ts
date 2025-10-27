import { privateCachedApiSlice } from '../api';

export const industryApi = privateCachedApiSlice.injectEndpoints({
  endpoints: build => ({
    createIndustry: build.mutation({
      query: data => ({
        url: 'v2/industry',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Industry']
    }),
    editIndustry: build.mutation({
      query: ({ id, payload }) => ({
        url: `v2/industry/${id}`,
        method: 'PATCH',
        body: payload
      }),
      invalidatesTags: ['Industry']
    }),
    deleteIndustry: build.mutation({
      query: id => {
        return {
          url: `v2/industry/${id}`,
          method: 'DELETE'
        };
      },
      invalidatesTags: ['Industry']
    }),
    getAllIndustries: build.query({
      query: ({ page, max_results, search }) => {
        const queryParams = new URLSearchParams();
        if (page) queryParams.append('page', page);
        if (search) queryParams.append('search', search);
        if (max_results) queryParams.append('max_results', max_results);

        return {
          url: `/v2/industry/list?${queryParams}`,
          method: 'GET'
        };
      },
      providesTags: ['Industry']
    }),
    getAllIndustriesList: build.query({
      query: () => {
        return {
          url: `/industry`,
          method: 'GET'
        };
      },
      providesTags: ['Industry']
    })
  })
});

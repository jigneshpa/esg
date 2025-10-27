import { privateCachedApiSlice } from '../api';

export const departmentApi = privateCachedApiSlice.injectEndpoints({
  endpoints: build => ({
    createDepartment: build.mutation({
      query: data => ({
        url: 'v2/department',
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Department']
    }),
    editDepartment: build.mutation({
      query: ({ id, payload }) => {
        return {
          url: `v2/department/${id}`,
          method: 'PATCH',
          body: payload
        };
      },
      invalidatesTags: ['Department']
    }),
    deleteDepartment: build.mutation({
      query: id => ({
        url: `v2/department/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Department']
    }),
    getAlldepartments: build.query({
      query: ({ page, max_results, search }) => {
        const queryParams = new URLSearchParams();
        if (page) queryParams.append('page', page);
        if (search) queryParams.append('search', search);
        if (max_results) queryParams.append('max_results', max_results);

        return {
          url: `/v2/department/list?${queryParams}`,
          method: 'GET'
        };
      },
      providesTags: ['Department']
    })
  })
});

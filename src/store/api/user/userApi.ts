import { USER_STATUS } from '@/constants';
import { UserInfoResponse } from '@/types/store/api/user';

import { privateApiSlice } from '../api';

export const userApi = privateApiSlice.injectEndpoints({
  endpoints: build => ({
    createUser: build.mutation({
      query: userData => ({
        url: 'v2/user',
        method: 'POST',
        body: userData
      })
    }),
    getUserInfo: build.mutation<UserInfoResponse, void>({
      query: () => ({
        url: 'user',
        method: 'GET'
      })
    }),
    getUserList: build.query({
      query: ({ page, max_results, sort_by, countryIds, roles, search, departmentIds, status,companyIds }) => {
        const queryParams = new URLSearchParams();
        if (page) queryParams.append('page', page);
        if (max_results) queryParams.append('max_results', max_results);
        if (sort_by) queryParams.append('sort_by', sort_by);
        if (countryIds) {
          const countryIdsJsonString = JSON.stringify(countryIds);
          queryParams.append('countryIds', countryIdsJsonString);
        }
        if (departmentIds) {
          const departmentIdsJsonString = JSON.stringify(departmentIds);
          queryParams.append('departmentIds', departmentIdsJsonString);
        }
        if (companyIds) {
          const companyIdsJsonString = JSON.stringify(companyIds);
          queryParams.append('companyIds', companyIdsJsonString);
        }
        if (search) {
          queryParams.append('search', search);
        }

        if (roles && roles.length > 0) queryParams.append('roles', JSON.stringify(roles));
        if (status && status.length > 0) queryParams.append('status', JSON.stringify(status));
        return {
          url: `users?${queryParams}`,
          method: 'GET'
        };
      }
    }),
    getUserLog: build.query({
      query: userId => ({
        url: `/v2/user-activity/${userId}`,
        method: 'GET'
      })
    }),
    uploadUsers: build.mutation({
      query: users => ({
        url: '/v2/user/upload',
        method: 'POST',
        body: users,
        formData: true
      })
    }),
    updateUserStatus: build.mutation<any, { userId: number, status: USER_STATUS }>({
      query: ({ userId, status }) => ({
        url: `user/${userId}/active`,
        body: { status },
        method: 'PATCH'
      })
    }),
    updateUser: build.mutation({
      query: ({ userId, data }) => ({
        url: `/v2/user/${userId}`,
        method: 'PATCH',
        body: data
      })
    }),
    deleteUser: build.mutation({
      query: userId => ({
        url: `user/${userId}`,
        method: 'DELETE'
      })
    }),
    deleteBulkUser: build.mutation({
      query: userIds => ({
        url: `bulkuser`,
        method: 'DELETE',
        body: {
          userIds: userIds
        }
      })
    })
  })
});

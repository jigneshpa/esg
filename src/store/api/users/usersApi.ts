import { privateApiSlice } from '../api';

interface GetUsersParams {
  page: number;
  max_results: number;
  companyIds: number[];
}

interface User {
  id: number;
  userName: string;
  email: string;
  roleId: number;
  department: number;
  status: string;
  firstName: string;
  lastName: string;
  isVerified: number;
  toReporting: number | null;
  createdAt: string;
  updatedAt: string;
  avatarId: number | null;
  addByAdmin: number;
  countryId: number;
  autoUnactive: number;
  contactNumber: string | null;
  companyId: number;
  updatePassword: number;
  questionBankId: number | null;
  avatar: string | null;
  role: string;
  country: string;
  department_info: {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}

interface GetUsersResponse {
  code: number;
  data: {
    metadata: {
      totalItem: number;
      totalPage: number;
      page: number;
      items: number;
    };
    items: User[];
  };
  message: string;
}

export const usersApi = privateApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<GetUsersResponse, GetUsersParams>({
      query: (params: GetUsersParams) => ({
        url: 'users',
        method: 'GET',
        params: {
          page: params.page,
          max_results: params.max_results,
          companyIds: JSON.stringify(params.companyIds)
        }
      })
    })
  })
});

export const { useGetUsersQuery } = usersApi; 
import { CountryApiResponse } from '../../../types/store/api/country';
import { privateApiSlice, publicApiSlice } from '../api';

export const countryApi = publicApiSlice.injectEndpoints({
  endpoints: build => ({
    getCountry: build.mutation<CountryApiResponse, void>({
      query: () => ({
        url: 'country',
        method: 'GET'
      })
    })
  })
});

export const countryFilterApi = privateApiSlice.injectEndpoints({
  endpoints: build => ({
    getCountryFilter: build.query({
      query: ({ filter }) => {
        const queryParams = new URLSearchParams();
        if (filter) queryParams.append('filter', filter);

        return {
          url: `/country-filter?${queryParams}`,
          method: 'GET'
        };
      }
    }),
    getAssetCountryFilter: build.query({
      query: ({}) => {
        return {
          url: `/country-filter-by-asset`,
          method: 'GET'
        };
      }
    }),
    getCountryFilterByAssignAsset: build.query({
      query: ({ filter }) => {
        const queryParams = new URLSearchParams();
        if (filter) queryParams.append('filter', filter);

        return {
          url: `/country-filter-by-asset-assign?${queryParams}`,
          method: 'GET'
        };
      }
    }),
    getCountryFilterByAssignAssetForUserActivity: build.query({
      query: ({ userId }) => {
        const queryParams = new URLSearchParams();
        if (userId) queryParams.append('userId', userId);

        return {
          url: `/user-acitivity/country-filter-by-asset-assign?${queryParams}`,
          method: 'GET'
        };
      }
    }),
    getCountryForAssetByCompanyId: build.query({
      query: companyId => {
        return {
          url: `/country-filter-by-company-asset?company_id=${companyId}`,
          method: 'GET'
        };
      }
    }),
    getCountryForAssetByAssign: build.query({
      query: companyId => {
        return {
          url: `/country-filter-dashboard`,
          method: 'GET'
        };
      }
    }),
    getCountryForUser: build.query({
      query: () => {
        return {
          url: `/country-filter-user`,
          method: 'GET'
        };
      }
    })
  })
});

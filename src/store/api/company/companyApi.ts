import { privateApiSlice } from '../api';

export const companyApi = privateApiSlice.injectEndpoints({
  endpoints: build => ({
    createCompany: build.mutation({
      query: companyData => ({
        url: '/v2/company',
        method: 'POST',
        body: companyData
      })
    }),
    uploadCompanies: build.mutation({
      query: data => ({
        url: 'v2/company/file',
        method: 'POST',
        body: data,
        formData: true
      })
    }),
    getAllCompanies: build.query({
      query: ({ page, max_results, search, country_id, id }) => {
        console.log('id for userRole is', id);
        console.log('typeof id is ', typeof id);
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (country_id && country_id.length > 0) queryParams.append('country_id', country_id.join(','));
        if (id) {
          console.log('id if condition worked');
          queryParams.append('id', id); // If id is present, do not add page and max_results
        } else {
          if (page) queryParams.append('page', page);
          if (max_results) queryParams.append('max_results', max_results);
        }

        return {
          url: `/v2/company/all?${queryParams}`,
          method: 'GET'
        };
      }
    }),
    getCompanyAccessList: build.query({
      query: () => ({
        url: '/v2/company/reporting-module/all',
        method: 'GET'
      })
    }),
    getAllCompaniesReportingSubmissions: build.query({
      query: ({ page, max_results, search, country_id, clientAdminUserId, companyIds }) => {
        const queryParams = new URLSearchParams();
        if (page) queryParams.append('page', page);
        if (search) queryParams.append('search', search);
        if (max_results) queryParams.append('max_results', max_results);
        if (country_id && country_id.length > 0) queryParams.append('country_id', country_id.join(','));
        if (clientAdminUserId) queryParams.append('client_admin_user_id', clientAdminUserId);
        if (companyIds && companyIds.length > 0) queryParams.append('companyIds', companyIds.join(','));
        return {
          url: `/companies-reporting-submissions?${queryParams}`,
          method: 'GET'
        };
      }
    }),
    getCompanyByFilter: build.query({
      query: ({ search, country_id, parent_id, id }) => {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (country_id && country_id.length > 0) queryParams.append('country_id', country_id.join(','));
        if (parent_id && parent_id.length > 0) queryParams.append('parent_id', parent_id.join(','));
        if (id && id.length > 0) queryParams.append('id', id.join(',')); // Added ID filter
        return {
          url: `/v2/company/getbyfilter?${queryParams}`,
          method: 'GET'
        };
      }
    }),

    //   getCompanyByFilter: build.query<any, { search?: string; country_id?: string[]; parent_id?: string[]; id?: string[]; refreshKey?: string }>
    //   ({
    //   query: ({ search, country_id, parent_id, id, refreshKey }) => {
    //     const queryParams = new URLSearchParams();
    //     if (search) queryParams.append('search', search);
    //     if (country_id && country_id.length > 0) queryParams.append('country_id', country_id.join(','));
    //     if (parent_id && parent_id.length > 0) queryParams.append('parent_id', parent_id.join(','));
    //     if (id && id.length > 0) queryParams.append('id', id.join(','));
    //     // Note: We do not append refreshKey to the URL so it won't be sent to the backend.
    //     return {
    //       url: `/v2/company/getbyfilter?${queryParams.toString()}`,
    //       method: 'GET'
    //     };
    //   }
    // }),

    updateCompany: build.mutation({
      query: ({ companyId, data }) => ({
        url: `/company/${companyId}`,
        method: 'PATCH',
        body: data
      })
    }),
    deleteCompany: build.mutation({
      query: companyId => ({
        url: `/company/${companyId}`,
        method: 'DELETE'
      })
    }),
    deleteBulkCompany: build.mutation({
      query: ({ companyIds }) => {
        return {
          url: `/bulkcompany`,
          method: 'DELETE',
          body: { companyIds }
        };
      }
    }),
    getCountryFilter: build.query({
      query: ({ filter }) => {
        const queryParams = new URLSearchParams();
        if (filter) queryParams.append('filter', filter);

        return {
          url: `/country-filter?${queryParams}`,
          method: 'GET'
        };
      }
    })
  })
});

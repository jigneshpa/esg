import { privateApiSlice } from '../api';

export const assetApi = privateApiSlice.injectEndpoints({
  endpoints: build => ({
    createAsset: build.mutation({
      query: assetData => ({
        url: 'v2/asset',
        method: 'POST',
        body: assetData
      })
    }),
    getAssetsList: build.query({
      query: () => {
        return {
          url: `/v2/asset/all-list`,
          method: 'GET'
        };
      }
    }),
    getAssets: build.query({
      query: ({ page, max_results, sort_by, assigned_only, submission_date, bills_submitted }) => {
        const queryParams = new URLSearchParams();

        if (page) queryParams.append('page', page);
        if (max_results) queryParams.append('max_results', max_results);
        if (sort_by) queryParams.append('sort_by', sort_by);
        if (submission_date) queryParams.append('submission_date', submission_date);
        if (assigned_only) queryParams.append('assigned_only', assigned_only.toString());
        if (bills_submitted) queryParams.append('bills_submitted', bills_submitted.toString());

        return {
          url: `v2/asset/all?${queryParams}`,
          method: 'GET'
        };
      }
    }),
    getAssetsByUser: build.query({
      query: ({
        user_id,
        page,
        max_results,
        sort_by,
        submission_date,
        search,
        companyIds,
        assetIds,
        assetTypes,
        countryIds
      }) => {
        const queryParams = new URLSearchParams();
        if (page) queryParams.append('page', page);
        if (max_results) queryParams.append('max_results', max_results);
        if (sort_by) queryParams.append('sort_by', sort_by);
        if (user_id) queryParams.append('user_id', user_id);
        if (submission_date) queryParams.append('submission_date', submission_date);
        if (search) queryParams.append('search', search);
        if (companyIds) {
          const companyIdsJsonString = JSON.stringify(companyIds);
          queryParams.append('companyIds', companyIdsJsonString);
        }
        if (assetIds) {
          const assetIdsJsonString = JSON.stringify(assetIds);
          queryParams.append('assetIds', assetIdsJsonString);
        }
        if (assetTypes) {
          const assetTypesJsonString = JSON.stringify(assetTypes);
          queryParams.append('assetTypes', assetTypesJsonString);
        }
        if (countryIds) {
          const countryIdsJsonString = JSON.stringify(countryIds);
          queryParams.append('countryIds', countryIdsJsonString);
        }

        return {
          url: `v2/asset/by-user?${queryParams}`,
          method: 'GET'
        };
      }
    }),
    getAssetsByCompanyId: build.query({
      query: ({ companyId, page, max_results, countr_id }) => {
        const queryParams = new URLSearchParams();

        if (countr_id) queryParams.append('countr_id', countr_id);
        if (page) queryParams.append('page', page);
        if (max_results) queryParams.append('max_results', max_results);

        return {
          url: `/company/${companyId}/asset?${queryParams}`,
          method: 'GET'
        };
      }
    }),

    getAssetById: build.query({
      query: id => ({
        url: `v2/asset/${id}`,
        method: 'GET'
      })
    }),
    updateAsset: build.mutation({
      query: ({ assetId, data }) => ({
        url: `/v2/asset/${assetId}`,
        method: 'PATCH',
        body: data
      })
    }),
    getAssignmentByAssetId: build.mutation({
      query: id => ({
        url: `/v2/user/assignment/${id}`,
        method: 'GET'
      })
    }),
    uploadAssets: build.mutation({
      query: assets => ({
        url: '/v2/asset/bulk',
        method: 'POST',
        body: assets,
        formData: true
      })
    }),

    deleteAssetAssignment: build.mutation({
      query: assetId => ({
        url: `/v2/user/assignment/${assetId}`,
        method: 'DELETE'
      })
    }),
    deleteAsset: build.mutation({
      query: assetIds => ({
        url: `asset`,
        method: 'DELETE',
        body: {
          assetId: assetIds
        }
      })
    })
  })
});

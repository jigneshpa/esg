import { formatArrayParam } from '../../../utils';
import { privateApiSlice } from '../api';

export const submissions = privateApiSlice.injectEndpoints({
  endpoints: build => ({
    getUserQuestionnairesList: build.query({
      query: ({ page, max_results, search, companyIds, countryIds, industryIds, sort_by, frameworkIds }) => {
        const queryParams = new URLSearchParams();

        if (page) queryParams.append('page', page);
        if (max_results) queryParams.append('max_results', max_results);
        if (search) queryParams.append('search', search);
        if (companyIds && companyIds.length > 0) queryParams.append('companyIds', formatArrayParam(companyIds));
        if (countryIds && countryIds.length > 0) queryParams.append('countryIds', formatArrayParam(countryIds));
        if (frameworkIds && frameworkIds.length > 0) queryParams.append('frameworkIds', formatArrayParam(frameworkIds));
        if (industryIds && industryIds.length > 0) queryParams.append('industryIds', formatArrayParam(industryIds));
        if (sort_by) queryParams.append('sort_by', sort_by);
        return {
          url: `v2/questionnaire/list/my?${queryParams}`,
          method: 'GET'
        };
      }
    }),
    getAdminCompanyDisclosureList: build.query({
      query: ({
        page,
        max_results,
        search,
        companyIds,
        sort_by,
        industryIds,
        frameworkIds,
        submittedByIds,
        countryIds,
        departmentIds
      }) => {
        const queryParams = new URLSearchParams();

        if (page) queryParams.append('page', page);
        if (max_results) queryParams.append('max_results', max_results);
        if (search) queryParams.append('search', search);
        if (sort_by) queryParams.append('sort_by', sort_by);
        if (companyIds && companyIds.length > 0) queryParams.append('companyIds', formatArrayParam(companyIds));
        if (industryIds && industryIds.length > 0) queryParams.append('industryIds', formatArrayParam(industryIds));
        if (frameworkIds && frameworkIds.length > 0) queryParams.append('frameworkIds', formatArrayParam(frameworkIds));
        if (countryIds && countryIds.length > 0) queryParams.append('countryIds', formatArrayParam(countryIds));
        if (departmentIds && departmentIds.length > 0)
          queryParams.append('departmentIds', formatArrayParam(departmentIds));
        if (submittedByIds && submittedByIds.length > 0)
          queryParams.append('submittedByIds', formatArrayParam(submittedByIds));
        return {
          url: `v2/questionnaire/submission/list?${queryParams}`,
          method: 'GET'
        };
      }
    }),
    getCompanyApprovedStandards: build.query({
      query: ({ companyId, page, max_results, search, sort_by }) => {
        const queryParams = new URLSearchParams();

        if (page) queryParams.append('page', page);
        if (max_results) queryParams.append('max_results', max_results);
        if (search) queryParams.append('search', search);
        if (sort_by) queryParams.append('sort_by', sort_by);
        if (companyId) {
          // Handle both single ID and comma-separated IDs
          if (companyId.includes(',')) {
            // Multiple IDs - split and format as array
            const ids = companyId.split(',');
            queryParams.append('companyIds', `[${ids.join(',')}]`);
          } else {
            // Single ID - format as array with single element
            queryParams.append('companyIds', `[${companyId}]`);
          }
        }
        // Add status filter for approved submissions
        queryParams.append('status', 'Approved');
        // Add filter for submissions that have answers
        queryParams.append('hasAnswers', 'true');
        return {
          url: `v2/questionnaire/submission/list?${queryParams}`,
          method: 'GET'
        };
      },
      transformResponse: (response: any) => {
        // Group by questionBankId to get unique standards
        const groupedStandards = new Map();

        if (response?.data?.items) {
          response.data.items.forEach((submission: any) => {
            const questionBankId = submission.questionBankId;
            const questionBankName = submission.questionBank?.name;

            if (questionBankId && submission.answer) {
              // Only include if there's an actual answer submitted
              if (!groupedStandards.has(questionBankId)) {
                groupedStandards.set(questionBankId, {
                  id: questionBankId,
                  name: questionBankName,
                  submissions: [],
                  latestSubmission: submission,
                  totalSubmissions: 0
                });
              }

              const standard = groupedStandards.get(questionBankId);
              standard.submissions.push(submission);
              standard.totalSubmissions = standard.submissions.length;

              // Keep track of the latest submission
              if (new Date(submission.updatedAt) > new Date(standard.latestSubmission.updatedAt)) {
                standard.latestSubmission = submission;
              }
            }
          });
        }

        // Convert to array and update metadata
        const uniqueStandards = Array.from(groupedStandards.values());

        return {
          ...response,
          data: {
            ...response.data,
            items: uniqueStandards,
            metadata: {
              ...response.data.metadata,
              totalItem: uniqueStandards.length
            }
          }
        };
      }
    }),
    getSubmittedBy: build.query({
      query: ({ page, max_results, search }) => {
        const queryParams = new URLSearchParams();
        if (page) queryParams.append('page', page);
        if (search) queryParams.append('search', search);
        if (max_results) queryParams.append('max_results', max_results);

        return {
          url: `v2/questionnaire/submission/submitted-by/list?${queryParams}`,
          method: 'GET'
        };
      }
    }),
    getSubmittedYears: build.query({
      query: ({ page, max_results, search }) => {
        const queryParams = new URLSearchParams();
        if (page) queryParams.append('page', page);
        if (search) queryParams.append('search', search);
        if (max_results) queryParams.append('max_results', max_results);

        return {
          url: `/v2/questionnaire/submission/years/list?${queryParams}`,
          method: 'GET'
        };
      }
    })
  })
});

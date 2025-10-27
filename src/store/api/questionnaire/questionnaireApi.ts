import { privateApiSlice } from '../api';

export const questionnaireApi = privateApiSlice.injectEndpoints({
  endpoints: build => ({
    createQuestionnaireBank: build.mutation({
      query: data => ({
        url: 'v2/questionnaire/bank',
        method: 'POST',
        body: data
      })
    }),
    updateQuestionnaireBank: build.mutation({
      query: ({ id, data }) => {
        return {
          url: `v2/questionnaire/bank/${id}`,
          method: 'PATCH',
          body: data
        };
      }
    }),

    deleteQuestionnaireBank: build.mutation({
      //working fine now
      query: bankId => ({
        url: `v2/questionnaire/bank/${bankId}`,
        method: 'DELETE'
      })
    }),
    generateQuestionnaire: build.mutation({
      query: data => {
        console.log('🚨 generateQuestionnaire CALLED!');
        console.log('📋 Payload:', data);
        console.log('🔍 Call Stack:');
        console.trace();

        // Detailed caller analysis
        const stack = new Error().stack;
        console.log('📍 Full Stack Trace:', stack);
        if (stack?.includes('useQuestionUserAssignment')) {
          console.log('🎯 Called FROM useQuestionUserAssignment hook');
        }
        if (stack?.includes('AssignCategoryModal')) {
          console.log('🎯 Called FROM AssignCategoryModal component');
        }
        if (stack?.includes('AssignStandard')) {
          console.log('🎯 Called FROM AssignStandard component');
        }

        // EMERGENCY BRAKE: Check window global for unassign operation
        if (typeof window !== 'undefined' && (window as any).__UNASSIGN_OPERATION_ACTIVE__) {
          console.log('🛑 BLOCKED generateQuestionnaire - unassign operation detected via window global!');
          throw new Error('generateQuestionnaire blocked during unassign operation');
        }

        // EMERGENCY BRAKE: Check if this is called during an unassign operation
        // Look for signs that this might be an unassign operation
        if (data.question_id && data.reportingAnswerYear) {
          console.log(
            '⚠️ WARNING: generateQuestionnaire called for question',
            data.question_id,
            'during year',
            data.reportingAnswerYear
          );
          console.log('🛑 This might be an unassign operation. Proceeding anyway but flagging for review.');
        }

        return {
          url: 'v2/questionnaire-v2/bank/generate_questionnaire_report',
          method: 'POST',
          body: data
        };
      }
    }),

    updateReviewStatus: build.mutation({
      query: data => ({
        url: 'v2/questionnaire/review',
        method: 'PATCH',
        body: data
      })
    }),

    getQuestionnaireBankList: build.query({
      query: ({ page, max_results, search }) => {
        const queryParams = new URLSearchParams();
        console.log('searchsearch, ', search);
        if (page) queryParams.append('page', page);
        if (max_results) queryParams.append('max_results', max_results);
        if (search) queryParams.append('search', search);

        return {
          url: `v2/questionnaire/bank?${queryParams}`,
          method: 'GET'
        };
      }
    }),
    getQuestionnaireList: build.query({
      query: ({ page, max_results, search }) => {
        const queryParams = new URLSearchParams();

        if (page) queryParams.append('page', page);
        if (max_results) queryParams.append('max_results', max_results);
        if (search) queryParams.append('search', search);

        return {
          url: `v2/questionnaire-v2/grouped_questions?${queryParams}`,
          method: 'GET'
        };
      }
    }),
    getQuestionBankListById: build.query({
      query: ({
        bankId,
        search,
        institution_id,
        framework_id,
        industry_id,
        department_id,
        scope_id,
        page,
        max_results
      }) => {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (institution_id && institution_id.length > 0) {
          queryParams.append('institutionIds', JSON.stringify(institution_id));
        }
        if (framework_id && framework_id.length > 0) {
          queryParams.append('frameworkIds', JSON.stringify(framework_id));
        }
        if (industry_id && industry_id.length > 0) {
          queryParams.append('industryIds', JSON.stringify(industry_id));
        }
        if (department_id && department_id.length > 0) {
          queryParams.append('departmentId', JSON.stringify(department_id));
        }
        if (scope_id && scope_id.length > 0) {
          queryParams.append('scopeId', JSON.stringify(scope_id));
        }

        if (page) queryParams.append('page', page);
        if (max_results) queryParams.append('max_results', max_results);

        return {
          url: `v2/questionnaire/bank/${bankId}?${queryParams}`,
          method: 'GET'
        };
      }
    }),
    createQuestion: build.mutation({
      query: data => ({
        url: 'v2/questionnaire/question',
        method: 'POST',
        body: data
      })
    }),
    assignUsers: build.mutation({
      query: ({ questionId, users, year, action = 'assign' }) => {
        const payload = { users, year, action };
        return {
          url: `v2/questionnaire/question/${questionId}/assign-users`,
          method: 'POST',
          body: payload
        };
      }
    }),
    createSubmission: build.mutation({
      query: data => ({
        url: 'v2/questionnaire/submission',
        method: 'POST',
        body: data
      })
    }),
    updateSubmission: build.mutation({
      query: data => ({
        url: 'v2/questionnaire/submission',
        method: 'PUT',
        body: data
      })
    }),
    getSubmissionById: build.query({
      query: ({ submissionId, year }) => ({
        url: `v2/questionnaire/submission/${submissionId}?year=${year}`,
        method: 'GET'
      })
    }),
    deleteSubmissions: build.mutation({
      query: data => {
        if (data.userQuestionnaireIds && data.userQuestionnaireIds.length > 0) {
          return {
            url: `v2/questionnaire/submission?userQuestionnaireIds=${data.userQuestionnaireIds.join(',')}`,
            method: 'DELETE',
            body: data
          };
        } else {
          return {
            url: `v2/questionnaire/submission`,
            method: 'DELETE',
            body: data
          };
        }
      }
    }),
    deleteQuestions: build.mutation({
      query: questionIds => ({
        url: `v2/questionnaire/question`,
        method: 'DELETE',
        body: { questionIds }
      })
    }),
    deleteAnswerByQuestionId: build.mutation({
      query: questionId => ({
        url: `v2/questionnaire/bank/answer/${questionId}`,
        method: 'DELETE'
      })
    }),
    uploadQuestions: build.mutation({
      query: data => ({
        url: 'v2/questionnaire/question/file',
        method: 'POST',
        body: data,
        formData: true
      })
    }),
    updateQuestions: build.mutation({
      query: data => ({
        url: `v2/questionnaire/question`,
        method: 'PUT',
        body: data
      })
    }),
    updateQuestionnaireReview: build.mutation({
      query: data => ({
        url: `/v2/questionnaire/review/options?`,
        method: 'PUT',
        body: data
      })
    }),
    getQuestionnaireReview: build.query({
      query: () => ({
        url: `/v2/questionnaire/review/options?`,
        method: 'GET'
      })
    }),
    getQuestionHistory: build.query({
      query: questionId => ({
        url: `v2/questionnaire/question/${questionId}/history`,
        method: 'GET'
      })
    }),

    getQuestion: build.query({
      query: questionId => ({
        url: `v2/questionnaire/question/${questionId}`,
        method: 'GET'
      })
    }),

    getQuestionsByCompanyAndFramework: build.query({
      query: ({ userQuestionnaireId }) => {
        console.log('userQuestionnaireIduserQuestionnaireId99', userQuestionnaireId);
        const queryParams = new URLSearchParams();
        // if (companyId) queryParams.append('companyId', companyId);
        // if (industryId) queryParams.append('industryId', industryId);
        // if (frameworkId) queryParams.append('frameworkId', frameworkId);
        if (userQuestionnaireId) queryParams.append('userQuestionnaireId', userQuestionnaireId);

        return {
          url: `v2/questionnaire/question/all?${queryParams}`,
          method: 'GET'
        };
      }
    }),
    updateAnswer: build.mutation({
      query: ({ data }) => ({
        url: 'v2/questionnaire/bank/answer',
        method: 'POST',
        body: data
      })
    }),
    assignStandardToCompany: build.mutation({
      query: ({ question_bank_id, company_id }) => ({
        url: 'v2/questionnaire-v2/bank/assign_standard_to_company',
        method: 'POST',
        body: { question_bank_id, company_id }
      })
    }),
    unassignStandardFromCompany: build.mutation({
      query: ({ question_bank_id, company_id }) => ({
        url: 'v2/questionnaire-v2/bank/unassign_standard_from_company',
        method: 'DELETE',
        body: { question_bank_id, company_id }
      })
    })
  })
});

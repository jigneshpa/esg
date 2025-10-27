import { useCallback, useState } from 'react';

import { departmentApi } from '@/store/api/department/departmentApi';
import { scopeApi } from '@/store/api/scope/scopeApi';
import { userApi } from '@/store/api/user/userApi';
import { Department } from '@/types/store/api/department';
import { Scope } from '@/types/store/api/scope';

import { companyApi } from '../store/api/company/companyApi';
import { industryApi } from '../store/api/industry/industryApi';
import { institutionApi } from '../store/api/institution/institutionApi';
import { submissions } from '../store/api/submissions/submissions';
import { LoadOptionsFunction } from '../types/common/load-options';
import { Framework } from '../types/store/api/framework';
import { Industry } from '../types/store/api/industry';
import { Institution } from '../types/store/api/institution';
import { SubmittedBy } from '../types/store/api/submission';
import { User } from '@/types/user';
import { questionnaireApi } from '@/store/api/questionnaire/questionnaireApi';

export enum ApiType {
  Institution = 'institution',
  Framework = 'framework',
  Industry = 'industry',
  SubmittedBy = 'submittedBy',
  SubmittedYear = 'submittedYear',
  CompanyIds = 'companyIds',
  Department = 'department',
  Scope = 'scope',
  Users = 'users'
}

function useLoadOptions(apiType: string) {
  const [getAllinstitutions] = institutionApi.useLazyGetAllinstitutionsQuery();
  const [getAllQuestionnaireBank] = questionnaireApi.useLazyGetQuestionnaireBankListQuery();
  const [getAllIndustries] = industryApi.useLazyGetAllIndustriesQuery();
  const [getAlldepartments] = departmentApi.useLazyGetAlldepartmentsQuery();
  const [getSubmittedBy] = submissions.useLazyGetSubmittedByQuery();
  const [getSubmittedYears] = submissions.useLazyGetSubmittedYearsQuery();
  const [getAllCompanies] = companyApi.useLazyGetAllCompaniesQuery();
  const [getAllScopes] = scopeApi.useLazyGetAllScopesQuery();
  const [getUserList] = userApi.useLazyGetUserListQuery();

  const [data, setData] = useState<{
    companyIds: { value: number, label: string }[],
    department: { value: number, label: string }[],
    framework: { value: number, label: string }[],
    industry: { value: number, label: string }[],
    institution: { value: number, label: string }[],
    scope: { value: number, label: string }[],
    users: { value: number, label: string }[]
    submittedBy: { value: number, label: string }[],
    submittedYear: { value: number, label: string }[]
  }>({
    companyIds: [],
    department: [],
    framework: [],
    industry: [],
    institution: [],
    scope: [],
    submittedBy: [],
    submittedYear: [],
    users: []
  });
  const [loading, setLoading] = useState(false);
  // useEffect(() => {
  //   console.log('Updated data:', data);
  // }, [data]);
  const loadOptions: LoadOptionsFunction = useCallback(
    async (search, loadedOptions, { page = 1 } = {}) => {
      const max_results = 150;
      // If we already have cached options for this apiType from an initial prefetch,
      // avoid making a duplicate API call on first menu open (empty search, first page).
      // Return cached options immediately and allow subsequent pages/search to hit API.
      const cached = (data as any)?.[apiType];
      if ((!search || search.trim() === '') && page === 1 && (!loadedOptions || loadedOptions.length === 0) && Array.isArray(cached) && cached.length > 0) {
        return {
          options: cached,
          // Keep hasMore true for page>1 requests to still fetch if needed
          hasMore: true,
          additional: { page: page + 1 }
        };
      }

      setLoading(true);
      try {
        let response;
        switch (apiType) {
          case ApiType.Institution:
            response = await getAllinstitutions({ page, search, max_results }, true);
            break;
          case ApiType.Framework:
            response = await getAllQuestionnaireBank({ page, search, max_results }, true);
            break;
          case ApiType.Industry:
            response = await getAllIndustries({ page, search, max_results }, true);
            break;
          case ApiType.Department:
            response = await getAlldepartments({ page, search, max_results }, true);
            break;
          case ApiType.SubmittedBy:
            response = await getSubmittedBy({ page, search, max_results }, true);
            break;
          case ApiType.SubmittedYear:
            response = await getSubmittedYears({ page, search, max_results }, true);
            break;
          case ApiType.CompanyIds:
            response = await getAllCompanies({ page, search, max_results }, true);
            break;
          case ApiType.Scope:
            response = await getAllScopes({});
            break;
          case ApiType.Users:
            response = await getUserList({ page, search, max_results, roles: ['user'] });
            break;
          default:
            throw new Error('Invalid API type');
        }

        if (!response || !response.data.data) {
          return { options: [], hasMore: false, additional: { page } };
        }

        let newOptions: { value: number, label: string }[]

        if (response.data?.data?.results) {
          newOptions = response.data?.data?.results?.map(
            (item: Framework | Industry | Institution | SubmittedBy | Department | Scope | User) => ({
              value: item.id,
              //@ts-ignore
              label: item.name || item.userName
            }))
        } else {
          newOptions = response.data?.data?.items?.map(
            (item: Framework | Industry | Institution | SubmittedBy | Department | Scope | User) => ({
              value: item.id,
              //@ts-ignore
              label: item.name || item.userName
            }))
        }

        // const newOptions: { value: number, label: string }[] = response.data?.data?.results ? response.data?.data?.results?.map(
        //   (item: Framework | Industry | Institution | SubmittedBy | Department | Scope | User) => ({
        //     value: item.id,
        //     //@ts-ignore
        //     label: item.name || item.userName
        //   })
        // ) : response.data?.data?.items?.map(
        //   (item: Framework | Industry | Institution | SubmittedBy | Department | Scope | User) => ({
        //     value: item.id,
        //     //@ts-ignore
        //     label: item.name || item.userName
        //   })
        // )

        setData(prev => {
          const updatedData = { ...prev, [apiType]: [...newOptions] };
          // console.log('Updated state:', updatedData);
          return updatedData;
        });
        return {
          options: newOptions,
          hasMore: response.data.data.hasMore,
          additional: { page: page + 1 }
        };
      } catch (error) {
        console.error('Error in loadOptions:', error);
        return { options: [], hasMore: false, additional: { page } };
      } finally {
        setLoading(false);
      }
    },
    [
      apiType,
      getAllinstitutions,
      getAllQuestionnaireBank,
      getAllIndustries,
      getAlldepartments,
      getSubmittedBy,
      getSubmittedYears,
      getAllCompanies,
      getAllScopes,
      getUserList
    ]
  );

  return { loadOptions, data, loading };
}
export default useLoadOptions;

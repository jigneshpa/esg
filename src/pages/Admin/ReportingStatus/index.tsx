import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flex, HStack } from '@chakra-ui/react';

import HeadingText from '@/components/common/HeadingText';
import Pagination from '@/components/common/Pagination';
import Table from '@/components/common/Table';
import { companyColumnsReportingStatus } from '@/constants/coloumns/companyColumnsReportingStatus';
import { useCompanyAccess } from '@/hooks/useCompanyAccess';
import useInitializeUser from '@/hooks/useInitializeUser';
import { useRefreshCompanyAccess } from '@/hooks/useRefreshCompanyAccess';
import useTableParams from '@/hooks/useTableParams';
import { companyApi } from '@/store/api/company/companyApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { CompanyAccess } from '@/store/slices/companyAccess/companyAccessSlice';
import { selectCompanyAll } from '@/store/slices/refresh/refreshSelectors';
import { setRefetchQuery } from '@/store/slices/refresh/refreshSlice';
import {
  selectUserCompanyId,
  selectUserFullAccess,
  selectUserId,
  selectUserRole
} from '@/store/slices/user/userSelectors';

const CompanyReportingStatus = () => {
  const dispatch = useAppDispatch();
  const userRole = useAppSelector(selectUserRole);
  const companyId = useAppSelector(selectUserCompanyId);
  const userId = useAppSelector(selectUserId);
  const userFullAccess = useAppSelector(selectUserFullAccess);
  useInitializeUser();

  // Use the company access data from the store
  const { companies: companyData, isLoading: isCompanyLoading, error: companyAccessError } = useCompanyAccess();

  // Hook to handle refreshing company access data
  useRefreshCompanyAccess();

  // Log the company access data to see what we're getting
  console.log('Company Access Data:', {
    companies: companyData,
    isLoading: isCompanyLoading,
    error: companyAccessError,
    count: companyData?.length || 0
  });

  // Example: Get companies by parent ID (for subsidiaries)
  const subsidiaries = companyData?.filter(company => company.parentId) || [];
  console.log('Subsidiaries from company access:', subsidiaries);

  // Example: Get company by ID
  const currentCompany = companyData?.find(company => company.id === companyId);
  console.log('Current company from company access:', currentCompany);

  const initialParams = {
    page: 1,
    max_results: userRole === 'user-admin' ? 2000 : 10,
    sort_by: null
  };

  const { params, activeSortKey, handleSortChange, handleMaxResultsChange, handlePageChange, handleFilterChange } =
    useTableParams(initialParams);

  const [companiesSelected, setCompaniesSelected] = useState<any>();
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [getCompanyByFilter, { data: subsidiariesData, isLoading: subsidiariesIsLoading }] =
    companyApi.useLazyGetCompanyByFilterQuery();

  // LEI ID column visibility state
  const [showLeiIdColumn, setShowLeiIdColumn] = useState(false);

  const toggleLeiIdColumn = () => {
    setShowLeiIdColumn(prev => !prev);
  };

  const queryParams = {
    ...params,
    companyIds: [...(companyData || []).map((company: CompanyAccess) => company.id)]
  } as any; // Type assertion to allow additional properties

  if (userRole === 'user-admin') {
    queryParams.clientAdminUserId = userId;
  }
  // Only run the query if we're not loading company data or if we're an admin
  // For user-admin and manager, wait until company data is loaded
  const shouldSkipQuery =
    ((userRole === 'user-admin' || userRole === 'manager') && (isCompanyLoading || !companyData)) ||
    companyData?.length === 0 ||
    !Boolean(userRole);

  const { data, isLoading, isFetching, refetch } = companyApi.useGetAllCompaniesReportingSubmissionsQuery(queryParams, {
    skip: shouldSkipQuery
  });

  const refetchQueries = useAppSelector(selectCompanyAll);
  let filteredResults = data?.data?.results || [];
  console.log('filteredData is', filteredResults);
  filteredResults = {
    ...data,
    data: {
      ...data?.data,
      results: data?.data?.results || [] // Keep all results or an empty array
    }
  };

  const handleChooseOne = (rowIndex: number) => {
    const companyItem = filteredResults.data?.results[rowIndex];
    console.log('companyItem is', companyItem);

    const companyId = companyItem?.id;

    if (companiesSelected === companyId) {
      setCompaniesSelected(null);
    } else {
      setCompaniesSelected(companyId);
    }
  };

  const toggleRowExpansion = (rowId: string) => {
    setExpandedRows((prev: string[]) => {
      if (prev.includes(rowId)) {
        return prev.filter(id => id !== rowId);
      }
      getCompanyByFilter({ parent_id: [rowId] }, true);
      return [...prev, rowId];
    });
  };

  console.log('12345 filteredResults', filteredResults);
  const navigate = useNavigate();
  const columns = companyColumnsReportingStatus({
    data: filteredResults,
    handleSortChange,
    activeSortKey,
    isAllChecked: false,
    companiesSelected,
    handleChooseOne,
    handleFilterChange,
    params,
    toggleRowExpansion,
    expandedRows,
    navigate,
    shouldShowActionModal: false,
    userRole,
    showLeiIdColumn,
    toggleLeiIdColumn
  });

  const SubsidiariesColumns = companyColumnsReportingStatus({
    data: subsidiariesData,
    handleSortChange,
    activeSortKey,
    isAllChecked: false,
    companiesSelected,
    handleChooseOne,
    handleFilterChange,
    params,
    isSub: true,
    navigate,
    shouldShowActionModal: false,
    userRole,
    showLeiIdColumn,
    toggleLeiIdColumn
  });

  useEffect(() => {
    if (refetchQueries) {
      refetch();
      dispatch(setRefetchQuery({ queryKey: 'companyAll', value: false }));
    }
  }, [refetchQueries, refetch, dispatch]);
  console.log('123 filteredResults', filteredResults?.data?.results, userRole);
  return (
    <Flex
      flex={1}
      flexDir={'column'}
      gap={'24px'}
      p={{ base: 0, md: '20px' }}
      h={'100%'}
      w={'100%'}
      overflow={'hidden'}
    >
      <Flex flexDir={'column'} gap={'16px'}>
        <HeadingText>List of Company / Subsidiaries</HeadingText>
      </Flex>
      <Table
        loading={
          isLoading ||
          isFetching ||
          ((userRole === 'user-admin' || userRole === 'manager') && (isCompanyLoading || !companyData))
        }
        columns={columns}
        dataSource={filteredResults?.data?.results}
        bg={'white'}
        overflowY={'auto'}
        TableContainerMinHeight={'260px'}
        rowSelections={undefined}
        subsidiariesData={subsidiariesData?.data?.result} // Pass this prop
        SubsidiariesColumns={SubsidiariesColumns as unknown as never[]}
        getCompanyByFilter={getCompanyByFilter}
        expandedRows={expandedRows as never[]}
        subsidiariesIsLoading={subsidiariesIsLoading}
        shouldShowActionModal={false}
      />

      <HStack>
        {filteredResults?.data?.metadata?.totalItem > 10 && (
          <Pagination
            totalItems={data?.data?.metadata?.totalItem}
            totalPage={data?.data?.metadata?.totalPage}
            currentPage={data?.data?.metadata?.page}
            maxResults={params.max_results}
            onMaxResultsChange={handleMaxResultsChange}
            onPageChange={handlePageChange}
          />
        )}
      </HStack>
    </Flex>
  );
};

export default CompanyReportingStatus;

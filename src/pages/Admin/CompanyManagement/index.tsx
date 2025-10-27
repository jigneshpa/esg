import { useEffect, useState } from 'react';
import { BsSearch } from 'react-icons/bs';
import { Flex, FormControl, FormLabel, HStack, Icon, Input, InputGroup, InputLeftElement } from '@chakra-ui/react';

import HeadingText from '@/components/common/HeadingText';
import Pagination from '@/components/common/Pagination';
import Table from '@/components/common/Table';
import { companyColoumns } from '@/constants/coloumns/companyColumns';
import useInitializeUser from '@/hooks/useInitializeUser';
import useTableParams from '@/hooks/useTableParams';
import { companyApi } from '@/store/api/company/companyApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCompanyAll } from '@/store/slices/refresh/refreshSelectors';
import { setRefetchQuery } from '@/store/slices/refresh/refreshSlice';
import {
  selectUserCompanyId,
  selectUserCountryId,
  selectUserFullAccess,
  selectUserRole
} from '@/store/slices/user/userSelectors';
import { useDebounce } from '@uidotdev/usehooks';

import AddCompany from './AddCompany';

interface Metadata {
  totalItem: number;
  totalPage: number;
  page: number;
}

interface CompanyData {
  hasMore: boolean;
  metadata: Metadata;
  results: any[]; // Replace `any[]` with a proper type if possible
}

interface FilteredResults {
  code?: string;
  data?: CompanyData;
  message?: string;
}

const CompanyManagement = () => {
  const dispatch = useAppDispatch();
  useInitializeUser();
  const initialParams = { page: 1, max_results: 10, sort_by: null };

  const { params, activeSortKey, handleSortChange, handleMaxResultsChange, handlePageChange, handleFilterChange } =
    useTableParams(initialParams);
  const userRole = useAppSelector(selectUserRole);
  const companyId = useAppSelector(selectUserCompanyId);
  console.log('usercompanyId', companyId);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [companiesSelected, setCompaniesSelected] = useState<any>();
  const [companies, setcompanies] = useState({});
  const [isAllChecked] = useState(false);
  const [expandedRows, setExpandedRows] = useState([]);
  const [subsidiaryRefresh, setSubsidiaryRefresh] = useState(0);
  const [getCompanyByFilter, { data: subsidiariesData, isLoading: subsidiariesIsLoading }] =
    companyApi.useLazyGetCompanyByFilterQuery();
  // get wheather it has full acess or not
  const userFullAccess = useAppSelector(selectUserFullAccess);
  const userCountryId = useAppSelector(selectUserCountryId);

  // LEI ID column visibility state
  const [showLeiIdColumn, setShowLeiIdColumn] = useState(false);

  const toggleLeiIdColumn = () => {
    setShowLeiIdColumn(prev => !prev);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    handlePageChange(1);
  };

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  useEffect(() => {
    handlePageChange(1);
  }, [debouncedSearchTerm]);

  const { data, isLoading, isFetching, refetch } = companyApi.useGetAllCompaniesQuery(
    {
      ...params,
      ...(userRole === 'user-admin' && !userFullAccess ? { country_id: [userCountryId] } : {}),
      search: debouncedSearchTerm,
      ...(userRole === 'user-admin' ? { id: companyId } : {}) // Include id only if userRole is "user-admin"
    },
    {
      skip: userRole === 'user-admin' && !companyId // Skip API call if userRole is "user-admin" but companyId is missing
    }
  );
  let filteredResults: FilteredResults | null = null;
  if (userRole === 'user-admin') {
    filteredResults = {
      code: data?.code,
      data: {
        hasMore: false, // No more pages as all data is returned
        metadata: {
          totalItem: data?.data?.length || 0, // Total items from response
          totalPage: 1, // Only one page for user-admin
          page: 1 // Set page to 1
        },
        results: data?.data || [] // The actual company data
      },
      message: data?.message
    };
  } else {
    filteredResults = data;
  }
  console.log('filtered results from data', filteredResults);
  const refetchQueries = useAppSelector(selectCompanyAll);

  const handleChooseOne = (rowIndex: number) => {
    const companyItem = filteredResults?.data?.results[rowIndex];

    const companyId = companyItem?.id;

    if (companiesSelected === companyId) {
      setcompanies({});
      setCompaniesSelected(null);
    } else {
      const companyInfo = {
        companyId: companyItem?.id,
        name: companyItem?.name
      };

      setcompanies(companyInfo);
      setCompaniesSelected(companyId);
    }
  };

  const toggleRowExpansion = (rowId: any) => {
    // @ts-ignore
    setExpandedRows((prev: any) => {
      const isCurrentlyExpanded = prev.includes(rowId);
      if (isCurrentlyExpanded) {
        // return [];
        return prev.filter((id: any) => id !== rowId);
      } else {
        getCompanyByFilter({ parent_id: [rowId] });
        return [...prev, rowId];
        // return [rowId];
      }
    });
  };
  const handleSubsidiaryDeleted = () => {
    setSubsidiaryRefresh(prev => prev + 1);
  };

  // Function to check if a row has children (subsidiaries)
  const hasChildren = (row: any) => {
    // For now, we'll assume all companies can have subsidiaries
    // In a real implementation, you might want to check if the company has subsidiaries
    return true;
  };

  const columns = companyColoumns({
    data: filteredResults,
    handleSortChange,
    activeSortKey,
    isAllChecked,
    companiesSelected,
    handleChooseOne,
    handleFilterChange,
    params,
    toggleRowExpansion,
    expandedRows,
    getCompanyByFilter,
    onSubsidiaryDeleted: handleSubsidiaryDeleted,
    showLeiIdColumn,
    toggleLeiIdColumn
  });

  const SubsidiariesColumns = companyColoumns({
    data: subsidiariesData,
    handleSortChange,
    activeSortKey,
    isAllChecked,
    companiesSelected,
    handleChooseOne,
    handleFilterChange,
    params,
    isSub: true,
    getCompanyByFilter,
    onSubsidiaryDeleted: handleSubsidiaryDeleted,
    showLeiIdColumn,
    toggleLeiIdColumn
  });

  useEffect(() => {
    if (refetchQueries) {
      refetch();
      dispatch(setRefetchQuery({ queryKey: 'companyAll', value: false }));
    }
  }, [refetchQueries, refetch, dispatch]);

  useEffect(() => {
    // When subsidiaryRefresh changes, re-fetch subsidiaries for each expanded parent row.
    expandedRows.forEach(parentId => {
      if (getCompanyByFilter) {
        getCompanyByFilter({
          parent_id: [parentId],
          // Use refreshKey to force a fresh fetch if needed.
          refreshKey: new Date().getTime().toString()
        });
      }
    });
  }, [subsidiaryRefresh, expandedRows, getCompanyByFilter]);

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

        <Flex gap={'30px'} justifyContent={'space-between'}>
          <HStack gap={'10px'}>
            <FormControl variant="floating">
              <InputGroup
                flex={1}
                minW={'150px'}
                maxW={{
                  base: '80%',
                  xl: '280px'
                }}
                h={'30px'}
                bg={'white'}
                borderRadius={'8px'}
                p={'1px'}
                color={'grey.800'}
              >
                <InputLeftElement>
                  <Icon as={BsSearch} />
                </InputLeftElement>
                <Input onChange={handleSearchChange} placeholder="" />
                <FormLabel>Search</FormLabel>
              </InputGroup>
            </FormControl>
          </HStack>
          <Flex gap={'15px'}>
            <AddCompany companySelected={companiesSelected != undefined} companies={companies} />
          </Flex>
        </Flex>
      </Flex>
      <Table
        loading={isLoading || isFetching}
        columns={columns}
        dataSource={filteredResults?.data?.results || []}
        bg={'white'}
        overflowY={'auto'}
        TableContainerMinHeight={'260px'}
        rowSelections={undefined}
        subsidiariesData={subsidiariesData?.data?.result}
        // @ts-ignore
        SubsidiariesColumns={SubsidiariesColumns}
        getCompanyByFilter={getCompanyByFilter}
        expandedRows={expandedRows}
        subsidiariesIsLoading={subsidiariesIsLoading}
        shouldShowActionModal={true}
        // New expandable props
        showExpandColumn={true}
        onToggleRowExpansion={toggleRowExpansion}
        hasChildren={hasChildren}
        expandedRowsState={new Set(expandedRows)}
      />

      <HStack>
        {(filteredResults?.data?.metadata?.totalItem ?? 0) > 10 && (
          <Pagination
            totalItems={filteredResults?.data?.metadata?.totalItem ?? 0}
            totalPage={filteredResults?.data?.metadata?.totalPage ?? 1}
            currentPage={filteredResults?.data?.metadata?.page ?? 1}
            maxResults={params.max_results}
            onMaxResultsChange={handleMaxResultsChange}
            onPageChange={handlePageChange}
          />
        )}
      </HStack>
    </Flex>
  );
};

export default CompanyManagement;

import { useEffect, useState } from 'react';
import { AiOutlineDownload } from 'react-icons/ai';
import { BsSearch } from 'react-icons/bs';
import { IoInformationCircleOutline } from 'react-icons/io5';
import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    HStack,
    Icon,
    Input,
    InputGroup,
    InputLeftElement,
    ListItem,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Text,
    UnorderedList
} from '@chakra-ui/react';

import { DropDown } from '@/components';
import ExportDropDown from '@/components/common/ExportDropDown';
import HeadingText from '@/components/common/HeadingText';
import Pagination from '@/components/common/Pagination';
import Table from '@/components/common/Table';
import { userManagmentColumns } from '@/constants/coloumns/userManagmentColumns';
import { rolesOptions } from '@/constants/roles';
import { useCompanyAccess } from '@/hooks/useCompanyAccess';
import useDebounce from '@/hooks/useDebounce';
import { useDeleteBulkUser } from '@/hooks/useDeleteBulkUser';
import useExport from '@/hooks/useExport';
import useInitializeUser from '@/hooks/useInitializeUser';
import { useRefreshCompanyAccess } from '@/hooks/useRefreshCompanyAccess';
import useTableParams from '@/hooks/useTableParams';
import { departmentApi } from '@/store/api/department/departmentApi';
import { userApi } from '@/store/api/user/userApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { CompanyAccess } from '@/store/slices/companyAccess/companyAccessSlice';
import { selectCountryList } from '@/store/slices/country/countrySelectors';
import { selectUsersAll } from '@/store/slices/refresh/refreshSelectors';
import { setRefetchQuery } from '@/store/slices/refresh/refreshSlice';
import {
    selectUser,
    selectUserCompanyId,
    selectUserCountryId,
    selectUserFullAccess,
    selectUserRole
} from '@/store/slices/user/userSelectors';

import AddUser from './AddUser';

const UserManagement = () => {
  const dispatch = useAppDispatch();
  const userRole = useAppSelector(selectUserRole);
  const companyId = useAppSelector(selectUserCompanyId);
  const userCountryId = useAppSelector(selectUserCountryId);
  const userFullAccess = useAppSelector(selectUserFullAccess);
  const subsidiaryIds = JSON.parse(sessionStorage.getItem('subsidiaryIds') || '[]').map((id: string) => Number(id)); // Parse string array to number array
  useInitializeUser();
  const userInfo = useAppSelector(selectUser);

  // Use the new company access data from the store
  const { companies: companyData, isLoading: isCompanyLoading, error: companyAccessError } = useCompanyAccess();
  console.log("companyData", companyData)
  // Hook to handle refreshing company access data
  const { forceRefreshCompanyAccess } = useRefreshCompanyAccess();

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

  const initialParams = { page: 1, max_results: 10, sort_by: null };
  const [searchKey, setSearchKey] = useState('');
  const [debouncedValue] = useDebounce(searchKey);
  const [selectedRows, setSelectedRows] = useState([]);
  const [exportPayload, setExportPayload] = useState<any>({});
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  const { params, activeSortKey, handleSortChange, handleMaxResultsChange, handlePageChange, handleFilterChange } =
    useTableParams(initialParams);
  const handleDeleteUser = useDeleteBulkUser();
  console.log('12345 companyData', companyData);
  // Add companyIds to query params only for user-admin
  const queryParams = {
    ...params,
    search: debouncedValue,
    companyIds: [
      ...(subsidiaries || []).map((company: CompanyAccess) => company.id),
      ...(currentCompany ? [currentCompany.id] : [])
    ]
  };

  // Add country filtering for user-admin users without full access
  if (userRole === 'user-admin' && !userFullAccess && userCountryId) {
    queryParams.countryIds = [userCountryId];
  }

  if (userRole === 'admin') {
    queryParams.companyIds = [];
  }

  // Only run the query if we're not loading company data or if we're an admin
  // For user-admin and manager, wait until company data is loaded
  const shouldSkipQuery =
    ((userRole === 'user-admin' || userRole === 'manager') && (isCompanyLoading || !companyData)) ||
    companyData?.length === 0;

  const { data, isLoading, isFetching, refetch } = userApi.useGetUserListQuery(queryParams, { skip: shouldSkipQuery });

  const refetchQueries = useAppSelector(selectUsersAll);
  const rowSelections = {
    onChange: setSelectedRows,
    selectedRowKeys: selectedRows
  };

  // useEffect(() => {
  //   if (userRole === 'user-admin' && params.max_results !== 100000) {
  //     handleMaxResultsChange(100000000); // Update max_results dynamically
  //   }
  // }, [userRole]);

  const {
    data: departmentData,
    isLoading: departmentIsLoading,
    isFetching: departmentIsFetching,
    refetch: departmentRefetch
  } = departmentApi.useGetAlldepartmentsQuery({});
  let filteredResults = data?.data?.items || [];

  filteredResults = {
    ...data,
    data: {
      ...data?.data,
      items: data?.data?.items || [] // Keep all results or an empty array
    }
  };

  // Fix the filteredResults logic to properly handle the data structure
  // const filteredResults = data ? {
  //   ...data,
  //   data: {
  //     ...data.data,
  //     items: data.data?.items || []
  //   }
  // } : {
  //   data: {
  //     items: [],
  //     metadata: {
  //       totalItem: 0,
  //       totalPage: 0,
  //       page: 1
  //     }
  //   }
  // };

  useEffect(() => {
    if (refetchQueries) {
      refetch();
      setSelectedRows([]);
      dispatch(setRefetchQuery({ queryKey: 'usersAll', value: false }));
    }
  }, [refetchQueries, refetch, dispatch]);

  // Force refresh company access data on component mount to get fresh data
  useEffect(() => {
    console.log('UserManagement: Force refreshing company access data on mount...');
    forceRefreshCompanyAccess();
  }, []); // Empty dependency array means this runs only once on mount

  const user = useAppSelector(selectUser);
  const columns = userManagmentColumns({
    data: filteredResults,
    handleSortChange,
    activeSortKey,
    handleFilterChange,
    params,
    companyData
  }).filter(column => {
    if (column.accessor === 'companyName' && user.role !== 'admin') {
      return false;
    }
    return true;
  });
  const { handleExportAsset, isDownloading } = useExport({ title: 'User Details' });

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKey(event.target.value);
    handlePageChange(1);
  };

  const countries = useAppSelector(selectCountryList);

  useEffect(() => {
    if (exportMenuOpen) {
      departmentRefetch();
    }
  }, [exportMenuOpen]);

  useEffect(() => {
    if (params?.countryIds) {
      setExportPayload({
        ...exportPayload,
        countryIds: params?.countryIds || null
      });
    }
  }, [params?.countryIds]);

  useEffect(() => {
    if (params?.roles) {
      setExportPayload({
        ...exportPayload,
        roles: params?.roles || null
      });
    }
  }, [params?.roles]);

  useEffect(() => {
    if (params?.departmentIds) {
      setExportPayload({
        ...exportPayload,
        department: params?.departmentIds || null
      });
    }
  }, [params?.departmentIds]);
  useEffect(() => {
    let payload = {};
    if (params?.roles) {
      payload = { ...payload, roles: params?.roles || null };
    }
    if (params?.countryIds) {
      payload = { ...payload, countryIds: params?.countryIds || null };
    }
    if (params?.departmentIds) {
      payload = { ...payload, department: params?.departmentIds || null };
    }
    if (userRole === 'user-admin' && subsidiaryIds.length > 0) {
      payload = { ...payload, companyIds: subsidiaryIds };
    }
    // Add country filtering for user-admin users without full access
    if (userRole === 'user-admin' && !userFullAccess && userCountryId) {
      payload = { ...payload, countryIds: [userCountryId] };
    }
    setExportPayload(payload);
  }, [exportMenuOpen]);

  console.log('filteredResults?.data?.items', filteredResults?.data?.items);
  return (
    <Flex
      flex={1}
      flexDir={'column'}
      gap={'22px'}
      p={{ base: 0, md: '20px' }}
      h={'100%'}
      w={'100%'}
      overflow={'hidden'}
    >
      <HeadingText>List of Users</HeadingText>
      <Flex flexDir={'row'} justifyContent={'space-between'} align={'center'}>
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
            <Input onChange={handleSearch} placeholder="" />
            <FormLabel>Search</FormLabel>
          </InputGroup>
        </FormControl>
        <Flex gap={'30px'}>
          <ExportDropDown
            setExportMenuOpen={setExportMenuOpen}
            exportMenuOpen={exportMenuOpen}
            display={{ base: 'none', md: 'flex' }}
            _hover={{
              color: '#648332',
              fill: '#648332'
            }}
            color={'#3F6600'}
            fill={'rgba(19, 82, 0, 1)'}
            ExportBtn={
              <>
                <Button
                  variant="downloadReport"
                  leftIcon={<Icon as={AiOutlineDownload} fontSize={'20px'} color={'#137E59'} />}
                  isLoading={isDownloading}
                >
                  <Text color={'#137E59'}>Download User Data</Text>
                </Button>
              </>
            }
            handleExport={(exportType: any) =>
              handleExportAsset({
                endpoint: 'user',
                sort_by: params.sort_by,
                type: exportType,
                selected_id: selectedRows.join(',') || undefined,
                department_Ids: exportPayload?.department,
                country_id: exportPayload?.countryIds,
                roles: exportPayload?.roles,
                companyIds: userRole === 'user-admin' && subsidiaryIds.length > 0 ? subsidiaryIds : undefined
              })
            }
            Filters={
              <>
                <Text display={'flex'} alignItems={'center'}>
                  Select Filter Type{' '}
                  <span style={{ marginLeft: '3px' }}>
                    <Popover trigger={'hover'} placement="top">
                      <PopoverTrigger>
                        <Box>
                          <IoInformationCircleOutline />
                        </Box>
                      </PopoverTrigger>
                      <PopoverContent bg={'grey.900'} color={'white'} w={'300px'}>
                        <PopoverArrow bg={'grey.900'} />
                        <PopoverBody userSelect={'text'} fontWeight={500}>
                          <UnorderedList>
                            <ListItem fontSize={'14px'}>To download all data - click download tab</ListItem>
                            <ListItem fontSize={'14px'}>To download specific data - choose filters below</ListItem>
                          </UnorderedList>
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                  </span>
                </Text>
                <Box marginY={'20px'}>
                  <Text fontSize={'16px'}>
                    <DropDown
                      placeholder="Select Country"
                      value={exportPayload?.countryIds || []}
                      selection="multiple"
                      w="100%"
                      options={countries || []}
                      borderRadius="10px"
                      borderColor="#E2E4E9"
                      onChange={(value: any) => {
                        setExportPayload({
                          ...exportPayload,
                          countryIds: value || null
                        });
                      }}
                      isDisabled={false}
                    />
                  </Text>
                </Box>
                <Box marginY={'20px'}>
                  <Text fontSize={'16px'}>
                    <DropDown
                      placeholder="Select Role"
                      value={exportPayload?.roles || []}
                      selection="multiple"
                      w="100%"
                      options={rolesOptions || []}
                      borderRadius="10px"
                      borderColor="#E2E4E9"
                      onChange={(value: any) => {
                        setExportPayload({
                          ...exportPayload,
                          roles: value || null
                        });
                      }}
                      isDisabled={false}
                    />
                  </Text>
                </Box>
                <Box marginY={'20px'}>
                  <Text fontSize={'16px'}>
                    <DropDown
                      placeholder="Select Department"
                      value={exportPayload?.department || []}
                      selection="multiple"
                      w="100%"
                      options={
                        departmentData?.data?.results.map((item: { id: any, name: any }) => ({
                          value: item.id,
                          label: item.name
                        })) || []
                      }
                      borderRadius="10px"
                      borderColor="#E2E4E9"
                      isLoading={departmentIsLoading}
                      onChange={(value: any) => {
                        setExportPayload({
                          ...exportPayload,
                          department: value || null
                        });
                      }}
                      isDisabled={false}
                    />
                  </Text>
                </Box>
              </>
            }
          />
          <Button
            fontSize={'0.9em'}
            fontWeight={700}
            w="auto"
            h="44px"
            bg="#137E59"
            onClick={() => handleDeleteUser(selectedRows.filter(userId => userId != userInfo?.id))}
            isDisabled={selectedRows?.length > 0 ? false : true}
            _hover={{
              opacity: 0.8
            }}
          >
            Delete User{selectedRows?.length > 1 ? 's' : ''}
          </Button>
          <AddUser />
        </Flex>
      </Flex>
      {/*@ts-ignore */}
      <Table
        loading={
          isLoading ||
          isFetching ||
          ((userRole === 'user-admin' || userRole === 'manager') && (isCompanyLoading || !companyData))
        }
        columns={columns}
        dataSource={filteredResults?.data?.items}
        bg={'white'}
        overflowY={'auto'}
        rowSelections={rowSelections}
        TableContainerMinHeight={'260px'}
      />

      <HStack>
        {filteredResults?.data?.metadata?.totalItem > 10 && (
          <Pagination
            totalItems={filteredResults?.data?.metadata?.totalItem}
            totalPage={filteredResults?.data?.metadata?.totalPage}
            currentPage={filteredResults?.data?.metadata?.page}
            maxResults={filteredResults.data.items.length < 10 ? filteredResults.data.items.length : 10}
            onMaxResultsChange={handleMaxResultsChange}
            onPageChange={handlePageChange}
          />
        )}
      </HStack>
    </Flex>
  );
};

export default UserManagement;

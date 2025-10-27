import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { AiFillFilter } from 'react-icons/ai';
import { FaSort } from 'react-icons/fa';
import { components } from 'react-select';
import { Box, Flex, Icon, Text, Tooltip } from '@chakra-ui/react';

import useLoadOptions, { ApiType } from '@/hooks/useLoadOptions';
import useSearchAndSelect from '@/hooks/useSearchAndSelect';
import { countryFilterApi } from '@/store/api/country/countryApi';
import { submissions } from '@/store/api/submissions/submissions';
import { userApi } from '@/store/api/user/userApi';
import { useAppSelector } from '@/store/hooks';
import { selectCountryList } from '@/store/slices/country/countrySelectors';
import { CSSObject } from '@emotion/styled';

import { rolesOptions, statusOptions } from '../../constants/mock';
import DropDown from './DropDown';

interface ISortableHeader {
  onClick: () => void;
  activeSortKey: string | null;
  text: string;
  sortKey: string;
  handleFilterChange?: any;
  filter?: string;
  filterParams?: any;
  companyId?: number; // Add companyId prop
}

const customStyles = {
  control: (baseStyles: Record<string, any>) => ({
    ...baseStyles,
    backgroundColor: 'transparent',
    border: 'none',
    minWidth: '200px',
    cursor: 'pointer',
    color: '#6C757D',
    boxShadow: 'none !important'
  }),
  option: (
    baseStyles: Record<string, any>,
    { isFocused, isSelected }: { isFocused: boolean, isSelected: boolean }
  ) => ({
    ...baseStyles,
    backgroundColor: isSelected ? '#fff' : isFocused ? '#fff' : '#fff',
    color: '#6C757D !important'
  }),

  placeholder: (baseStyles: Record<string, any>) => ({
    ...baseStyles,
    color: 'white'
  }),

  noOptionsMessage: (baseStyles: Record<string, any>) => ({
    ...baseStyles,
    color: '#6C757D'
  }),
  indicatorSeparator: (baseStyles: Record<string, any>) => ({
    ...baseStyles,
    display: 'none'
  }),

  IndicatorsContainer2: (baseStyles: Record<string, any>) => ({
    ...baseStyles,
    color: '#FFF !important'
  }),
  container: (baseStyles: Record<string, any>) => ({
    ...baseStyles,
    width: '100%'
  }),

  menu: (baseStyles: Record<string, any>) => ({
    ...baseStyles,
    backgroundColor: 'white',
    border: '0px solid',
    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 0px 16px 0px'
  }),
  menuList: (baseStyles: Record<string, any>) => ({
    ...baseStyles,
    maxHeight: '180px'
  }),
  input: (baseStyles: Record<string, any>) => ({
    ...baseStyles,
    color: 'white'
  })
};

const ClearIndicatorStyles = (base: any): CSSObject => ({
  ...base,
  cursor: 'pointer',
  color: '#6C757D'
});

const DropdownIndicator = (props: any) => {
  return (
    components.DropdownIndicator && (
      <components.DropdownIndicator {...props}>
        <AiFillFilter style={{ color: props.isFocused ? '#ffff' : '#ffff' }} />
      </components.DropdownIndicator>
    )
  );
};

const CheckboxOption = (props: any) => {
  return (
    <components.Option {...props}>
      <input
        type="checkbox"
        checked={props.isSelected}
        onChange={() => null}
        style={{ marginRight: '5px', accentColor: '#137E59' }}
      />
      {props.children}
    </components.Option>
  );
};

export const CustomValueContainer = (props: any) => {
  const { children, getValue } = props;
  const selectedValues = getValue();

  const selectedLabels = selectedValues.map((value: { label: any }) => value.label).join(', ');

  return (
    <components.ValueContainer {...props}>
      <Flex alignItems="center" maxWidth="90px">
        {selectedValues.length > 0 ? (
          <Tooltip label={selectedLabels} aria-label="Selected values">
            <Text isTruncated maxWidth="100%">
              {selectedLabels}
            </Text>
          </Tooltip>
        ) : (
          children
        )}
      </Flex>
    </components.ValueContainer>
  );
};

const SortableHeader: FC<ISortableHeader> = ({
  onClick,
  activeSortKey,
  text,
  sortKey,
  handleFilterChange,
  filter,
  filterParams,
  companyId
}) => {
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<number[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const countries = useAppSelector(selectCountryList);
  const {
    industry,
    submittedBy,
    company,
    department,
    framework,
    submittedYear,
    handleCompanyChange,
    handleDepartmentChange,
    handleSubmittedYearChange,
    handleFrameworkChange,
    handleIndustryChange,
    handleSubmittedByChange,
    handleUsersChange
  } = useSearchAndSelect<any>({
    handleFilterChange
  });

  // const loadIndustryOptions = useLoadOptions(ApiType.Industry);
  // const loadSubmittedByOptions = useLoadOptions(ApiType.SubmittedBy);
  // const loadFrameworkOptions = useLoadOptions(ApiType.Framework);
  // const loadSubmittedYearOptions = useLoadOptions(ApiType.SubmittedYear);
  // const loadCompanyOptions = useLoadOptions(ApiType.CompanyIds);
  // const loadDepartmentOptions = useLoadOptions(ApiType.Department);
  const { loadOptions: loadIndustryOptions } = useLoadOptions(ApiType.Industry);
  const { loadOptions: loadSubmittedByOptions } = useLoadOptions(ApiType.SubmittedBy);
  const { loadOptions: loadFrameworkOptions } = useLoadOptions(ApiType.Framework);
  const { loadOptions: loadSubmittedYearOptions } = useLoadOptions(ApiType.SubmittedYear);
  const { loadOptions: loadCompanyOptions } = useLoadOptions(ApiType.CompanyIds);
  const { loadOptions: loadDepartmentOptions } = useLoadOptions(ApiType.Department);

  const {
    data: countryByUserFilterData,
    isLoading: countryByUserFilterIsLoading,
    isFetching: countryByUserFilterFetching,
    refetch: countryByUserFilterRefetch
  } = countryFilterApi.useGetCountryForUserQuery({ filter: 'user' });
  const initialParams = { page: 1, max_results: 2, sort_by: null };

  const {
    data: submissionData,
    isLoading: submissionByUserFilterIsLoading,
    isFetching,
    refetch
  } = submissions.useGetUserQuestionnairesListQuery({
    ...filterParams,
    search: ''
  });

  const { data: adminCompanyDisclosureData, isLoading } = submissions.useGetAdminCompanyDisclosureListQuery({
    ...filterParams,
    search: '',
    max_results: 1000000, // Fetch all data for filter options
    page: 1,
    companyIds: companyId ? [companyId] : undefined // Use companyId prop
  });

  const { data: userManagmentTableData, isLoading: userManagmentFilterLoading } = userApi.useGetUserListQuery({
    ...filterParams,
    search: ''
  });

  let loadOptionsFunction;
  let onChangeHandler;
  let currentValue;

  switch (filter) {
    case 'Industry':
      loadOptionsFunction = loadIndustryOptions;
      onChangeHandler = handleIndustryChange;
      currentValue = industry;
      break;
    case 'SubmittedBy':
      loadOptionsFunction = loadSubmittedByOptions;
      onChangeHandler = handleSubmittedByChange;
      currentValue = submittedBy;
      break;
    case 'Framework':
      loadOptionsFunction = loadFrameworkOptions;
      onChangeHandler = handleFrameworkChange;
      currentValue = framework;
      break;
    case 'SubmittedYear':
      loadOptionsFunction = loadSubmittedYearOptions;
      onChangeHandler = handleSubmittedYearChange;
      currentValue = submittedYear;
      break;
    case 'companyIds':
      loadOptionsFunction = loadCompanyOptions;
      onChangeHandler = handleCompanyChange;
      currentValue = company;
      break;
    case 'departmentIds':
      loadOptionsFunction = loadDepartmentOptions;
      onChangeHandler = handleDepartmentChange;
      currentValue = department;
      break;
    default:
      loadOptionsFunction = () => Promise.resolve({ options: [], hasMore: false });
      onChangeHandler = () => {};
      currentValue = null;
  }

  const onSelectionChange = (selectedOptions: any) => {
    // console.log('Selected Countries:', selectedOptions); // Log selected countries
    const filterKeyMap: { [key: string]: string } = {
      userManagementRoleList: 'roles',
      userManagementCountryList: 'countryIds',
      userManagementDepartmentList: 'departmentIds',
      userCountryList: 'countryIds',
      userSubmissionCompanyList: 'companyIds',
      userSubmissionFrameworkList: 'frameworkIds',
      adminDisclosureCompanyList: 'companyIds',
      adminDisclosureIndustryList: 'industryIds',
      adminDisclosureFrameworkList: 'questionBankIds',
      adminDisclosureDepartmentList: 'departmentIds',
      adminDisclosureCountryList: 'countryIds',
      userManagementStatusList: 'status'
    };

    const filterKey = filterKeyMap[filter as keyof typeof filterKeyMap] || filter;
    handleFilterChange(filterKey, selectedOptions);
    setSelectedValue(selectedOptions);
    console.log('selected value is ', selectedValue);
  };
  const selectedValueRef = useRef<number[]>([]); // New ref to store latest selectedValue
  const onSelectionAsyncChange = (selectedOptions: any) => {
    handleFilterChange(filter, selectedOptions);
    setSelectedValue(selectedOptions);
  };

  const onRoleChange = (selectedOptions: any) => {
    handleFilterChange('roles', selectedOptions);
    setSelectedValue(selectedOptions);
  };
  const onStatusChange = (selectedOptions: any) => {
    handleFilterChange('status', selectedOptions);
    setSelectedValue(selectedOptions);
  };
  useEffect(() => {
    selectedValueRef.current = selectedValue;
    // console.log('selectedValueRef',selectedValueRef)
    // console.log('selectedValue updated:', selectedValue);
  }, [selectedValue]);
  // console.log('selectedValueRef',selectedValueRef)
  const getUniqueOptions = (data: any[], labelPath: string, valuePath: string) => {
    return data?.reduce((acc: any[], item: any) => {
      const label = labelPath.split('.').reduce((o: any, i: string) => o?.[i], item);
      let newValue;
      const val = valuePath.split('.').reduce((o: any, i: string) => o?.[i], item);
      if (labelPath === 'role') {
        if (label === 'Admin') {
          newValue = 'Admin';
        } else if (label === 'Manager-L1' || label === 'Manager-L2') {
          newValue = 'Manager';
        } else {
          newValue = 'User';
        }
      }
      const value = newValue || val;
      if (label && !acc.some((option: any) => option.label === label)) {
        acc.push({ label, value });
      }
      return acc;
    }, []);
  };

  const userManagementCountryOptions = countryByUserFilterData?.data?.map(
    ({ id, name }: { id: number, name: string }) => ({
      label: name,
      value: id
    })
  );

  const userManagementDepartmentOptions = getUniqueOptions(
    userManagmentTableData?.data?.items,
    'department_info.name',
    'department_info.id'
  );
  const userManagementRoleOptions = getUniqueOptions(userManagmentTableData?.data?.items, 'role', 'role');
  const adminCompanyDisclosureDepartmentOptions = getUniqueOptions(
    adminCompanyDisclosureData?.data?.items,
    'department.name',
    'department.id'
  );
  const adminCompanyDisclosureCompanyOptions = getUniqueOptions(
    adminCompanyDisclosureData?.data?.items,
    'company.name',
    'company.id'
  );
  const adminCompanyDisclosureIndustryOptions = getUniqueOptions(
    adminCompanyDisclosureData?.data?.items,
    'industry.name',
    'industry.id'
  );
  const adminCompanyDisclosureFrameworkOptions = getUniqueOptions(
    adminCompanyDisclosureData?.data?.items,
    'questionBank.name', // Changed from 'framework.name'
    'questionBank.id' // Changed from 'framework.id'
  );
  const adminCompanyDisclosureCountryOptions = getUniqueOptions(
    adminCompanyDisclosureData?.data?.items,
    'country.name',
    'country.id'
  );
  const countryByUserFilterList = getUniqueOptions(submissionData?.data?.items, 'country.name', 'country.id');
  const companySubmissionData = getUniqueOptions(submissionData?.data?.items, 'company.name', 'company.id');
  const frameworkSubmission = getUniqueOptions(submissionData?.data?.items, 'framework.name', 'framework.id');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsSelectOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  const toggleSelect = () => setIsSelectOpen(!isSelectOpen);

  const loadCountryOptions = useCallback(
    async (inputValue: string) => {
      const filteredCountries = countries.filter(country =>
        country.label.toLowerCase().includes(inputValue.toLowerCase())
      );
      const selectedCountryIds = selectedValueRef.current.map(item => item);
      // console.log('selected VALUE IN LOAD OPTION', selectedValueRef.current);
      const selectedCountries = filteredCountries.filter(country => selectedValueRef.current.includes(country?.value));
      // console.log('selectedCountries,', selectedCountries);
      const unselectedCountries = filteredCountries.filter(country => !selectedCountryIds.includes(country.value));
      console.log('un selectedCountries,', unselectedCountries);
      const sortedCountries = [...selectedCountries, ...unselectedCountries];
      console.log('sorted countries,', sortedCountries);
      return { options: sortedCountries, hasMore: false };
    },
    [selectedValue, countries] // Dependencies: recreate when these change
  );

  // Function to sort countries with selected ones at the top
  const getSortedCountries = useCallback(() => {
    const selectedCountryIds = selectedValue.map(item => item);
    const selectedCountries = countries.filter(country => selectedCountryIds.includes(country?.value));
    const unselectedCountries = countries.filter(country => !selectedCountryIds.includes(country.value));
    return [...selectedCountries, ...unselectedCountries];
  }, [selectedValue, countries]);

  return (
    <Box display="flex" ref={wrapperRef} alignItems="center" justifyContent="space-between">
      {filter === 'userManagementCountryList' ? (
        <DropDown
          flex={{ base: 1, lg: 'unset' }}
          placeholder={text}
          isLoading={userManagmentFilterLoading}
          options={userManagementCountryOptions || []}
          selection="multiple"
          minW={'150px'}
          value={selectedValue}
          onChange={onSelectionChange}
          fontSize={'14px'}
          background={'#137E59'}
          DropdownIndicator={AiFillFilter}
          borderNone
          table
          customStyles
          ClearIndicatorStyles={ClearIndicatorStyles}
          isTableHead={true}
        />
      ) : filter === 'userManagementDepartmentList' ? (
        <DropDown
          flex={{ base: 1, lg: 'unset' }}
          placeholder={text}
          isLoading={userManagmentFilterLoading}
          options={userManagementDepartmentOptions || []}
          selection="multiple"
          minW={'150px'}
          value={selectedValue}
          onChange={onSelectionChange}
          fontSize={'14px'}
          background={'#137E59'}
          DropdownIndicator={AiFillFilter}
          borderNone
          table
          customStyles
          ClearIndicatorStyles={ClearIndicatorStyles}
          isTableHead={true}
        />
      ) : filter === 'userManagementRoleList' ? (
        <DropDown
          flex={{ base: 1, lg: 'unset' }}
          placeholder={text}
          isLoading={userManagmentFilterLoading}
          options={userManagementRoleOptions || []}
          selection="multiple"
          minW={'150px'}
          value={selectedValue}
          onChange={onRoleChange}
          fontSize={'14px'}
          background={'#137E59'}
          DropdownIndicator={AiFillFilter}
          borderNone
          table
          customStyles
          ClearIndicatorStyles={ClearIndicatorStyles}
          isTableHead={true}
        />
      ) : filter === 'adminDisclosureCountryList' ? (
        <DropDown
          flex={{ base: 1, lg: 'unset' }}
          placeholder={text}
          isLoading={submissionByUserFilterIsLoading}
          options={adminCompanyDisclosureCountryOptions || []}
          selection="multiple"
          minW={'150px'}
          value={selectedValue}
          onChange={onSelectionChange}
          fontSize={'14px'}
          background={'#137E59'}
          DropdownIndicator={AiFillFilter}
          borderNone
          table
          customStyles
          ClearIndicatorStyles={ClearIndicatorStyles}
          isTableHead={true}
        />
      ) : filter === 'adminDisclosureDepartmentList' ? (
        <DropDown
          flex={{ base: 1, lg: 'unset' }}
          placeholder={text}
          isLoading={submissionByUserFilterIsLoading}
          options={adminCompanyDisclosureDepartmentOptions || []}
          selection="multiple"
          minW={'150px'}
          value={selectedValue}
          onChange={onSelectionChange}
          fontSize={'14px'}
          background={'#137E59'}
          DropdownIndicator={AiFillFilter}
          borderNone
          table
          customStyles
          ClearIndicatorStyles={ClearIndicatorStyles}
          isTableHead={true}
        />
      ) : filter === 'adminDisclosureFrameworkList' ? (
        <DropDown
          flex={{ base: 1, lg: 'unset' }}
          placeholder={text}
          isLoading={submissionByUserFilterIsLoading}
          options={adminCompanyDisclosureFrameworkOptions || []}
          selection="multiple"
          minW={'150px'}
          value={selectedValue}
          onChange={onSelectionChange}
          fontSize={'14px'}
          background={'#137E59'}
          DropdownIndicator={AiFillFilter}
          borderNone
          table
          customStyles
          ClearIndicatorStyles={ClearIndicatorStyles}
          isTableHead={true}
        />
      ) : filter === 'adminDisclosureIndustryList' ? (
        <DropDown
          flex={{ base: 1, lg: 'unset' }}
          placeholder={text}
          isLoading={submissionByUserFilterIsLoading}
          options={adminCompanyDisclosureIndustryOptions || []}
          selection="multiple"
          minW={'150px'}
          value={selectedValue}
          onChange={onSelectionChange}
          fontSize={'14px'}
          background={'#137E59'}
          DropdownIndicator={AiFillFilter}
          borderNone
          table
          customStyles
          ClearIndicatorStyles={ClearIndicatorStyles}
          isTableHead={true}
        />
      ) : filter === 'adminDisclosureCompanyList' ? (
        <DropDown
          flex={{ base: 1, lg: 'unset' }}
          placeholder={text}
          isLoading={submissionByUserFilterIsLoading}
          options={adminCompanyDisclosureCompanyOptions || []}
          selection="multiple"
          minW={'150px'}
          value={selectedValue}
          onChange={onSelectionChange}
          fontSize={'14px'}
          background={'#137E59'}
          DropdownIndicator={AiFillFilter}
          borderNone
          table
          customStyles
          ClearIndicatorStyles={ClearIndicatorStyles}
          isTableHead={true}
        />
      ) : filter === 'userSubmissionFrameworkList' ? (
        <DropDown
          flex={{ base: 1, lg: 'unset' }}
          placeholder={text}
          isLoading={submissionByUserFilterIsLoading}
          options={frameworkSubmission || []}
          selection="multiple"
          minW={'150px'}
          value={selectedValue}
          onChange={onSelectionChange}
          fontSize={'14px'}
          background={'#137E59'}
          DropdownIndicator={AiFillFilter}
          borderNone
          table
          customStyles
          ClearIndicatorStyles={ClearIndicatorStyles}
          isTableHead={true}
        />
      ) : filter === 'userSubmissionCompanyList' ? (
        <DropDown
          flex={{ base: 1, lg: 'unset' }}
          placeholder={text}
          isLoading={submissionByUserFilterIsLoading}
          options={companySubmissionData || []}
          selection="multiple"
          minW={'150px'}
          value={selectedValue}
          onChange={onSelectionChange}
          fontSize={'14px'}
          background={'#137E59'}
          DropdownIndicator={AiFillFilter}
          borderNone
          table
          customStyles
          ClearIndicatorStyles={ClearIndicatorStyles}
          isTableHead={true}
        />
      ) : filter === 'userCountryList' ? (
        <DropDown
          flex={{ base: 1, lg: 'unset' }}
          placeholder={text}
          isLoading={countryByUserFilterIsLoading}
          options={countryByUserFilterList || []}
          selection="multiple"
          minW={'150px'}
          value={selectedValue}
          onChange={onSelectionChange}
          fontSize={'14px'}
          background={'#137E59'}
          DropdownIndicator={AiFillFilter}
          borderNone
          table
          customStyles
          ClearIndicatorStyles={ClearIndicatorStyles}
          isTableHead={true}
        />
      ) : filter === 'country_id' ? (
        <DropDown
          flex={{ base: 1, lg: 'unset' }}
          placeholder={text}
          isLoading={false}
          selection="multiple"
          onChange={onSelectionChange}
          noOptionsMessage={'No Countries Found'}
          minW={{ base: '100px', md: '150px' }} // Minimum width, responsive
          w={'-webkit-fill-available'}
          fontSize={'14px'}
          background={'#137E59'}
          DropdownIndicator={AiFillFilter}
          borderNone
          table
          customStyles
          ClearIndicatorStyles={ClearIndicatorStyles}
          options={getSortedCountries()}
          value={selectedValue}
          isTableHead={true}
        />
      ) : text === 'Country' ? (
        <DropDown
          flex={{ base: 1, lg: 'unset' }}
          placeholder={text}
          isLoading={false}
          selection="multiple"
          onChange={onSelectionChange}
          noOptionsMessage={'No Companies Found'}
          minW={{ base: '100px', md: '150px' }} // Minimum width, responsive
          w={'-webkit-fill-available'}
          fontSize={'14px'}
          background={'#137E59'}
          DropdownIndicator={AiFillFilter}
          borderNone
          table
          AsyncPage
          customStyles
          ClearIndicatorStyles={ClearIndicatorStyles}
          // loadOptions={() => Promise.resolve({ options: countries, hasMore: false })}
          // loadOptions={async (inputValue: string) => {
          //   const filteredCountries = countries.filter((country) =>
          //     country.label.toLowerCase().includes(inputValue.toLowerCase())
          //   );
          //   const selectedCountryIds = selectedValue.map((item) => item);
          //   console.log('selected VALUE IN LOAD OPTION', selectedValue)
          //   const selectedCountries = filteredCountries.filter((country) =>
          //     selectedValue?.includes(country?.value)
          //   );
          //   console.log('selectedCountries,',selectedCountries)
          //   const unselectedCountries = filteredCountries.filter(
          //     (country) => !selectedCountryIds.includes(country.value)
          //   );
          //   console.log('un selectedCountries,',unselectedCountries)
          //   const sortedCountries = [...selectedCountries, ...unselectedCountries];
          //   console.log('sorted countries,',sortedCountries)
          //   return { options: sortedCountries, hasMore: false };
          // }}
          loadOptions={loadCountryOptions} // Use the memoized function
        />
      ) : filter === 'Role' ? (
        <DropDown
          flex={{ base: 1, lg: 'unset' }}
          placeholder={text}
          isLoading={false}
          selection="multiple"
          onChange={onRoleChange}
          noOptionsMessage={'No Companies Found'}
          fontSize={'14px'}
          background={'#137E59'}
          DropdownIndicator={AiFillFilter}
          borderNone
          table
          AsyncPage
          customStyles
          ClearIndicatorStyles={ClearIndicatorStyles}
          loadOptions={() => Promise.resolve({ options: rolesOptions, hasMore: false })}
        />
      ) : filter === 'userManagementStatusList' ? (
        <DropDown
          flex={{ base: 1, lg: 'unset' }}
          value={selectedValue}
          isLoading={false}
          placeholder={text}
          w={'170px'}
          selection="multiple"
          onChange={onStatusChange}
          noOptionsMessage={'No Status Found'}
          fontSize={'14px'}
          background={'#137E59'}
          DropdownIndicator={AiFillFilter}
          borderNone
          table
          customStyles
          options={statusOptions}
          ClearIndicatorStyles={ClearIndicatorStyles}
          loadOptions={() => Promise.resolve({ options: statusOptions, hasMore: false })}
        />
      ) : filter === 'departmentIds' ||
        filter === 'companyIds' ||
        filter === 'Industry' ||
        filter === 'SubmittedBy' ||
        filter === 'Framework' ||
        filter === 'SubmittedYear' ? (
        <DropDown
          flex={{ base: 1, lg: 'unset' }}
          placeholder={text}
          isLoading={false}
          selection="multiple"
          onChange={onSelectionAsyncChange}
          noOptionsMessage={'No Companies Found'}
          fontSize={'14px'}
          background={'#137E59'}
          DropdownIndicator={AiFillFilter}
          borderNone
          table
          AsyncPage
          customStyles
          ClearIndicatorStyles={ClearIndicatorStyles}
          loadOptions={loadOptionsFunction}
        />
      ) : (
        <Flex minW="200px" w="100%" justify="space-between" alignItems="center" onClick={onClick}>
          <Text>{text}</Text>
          <Icon
            as={FaSort}
            w="12px"
            h="12px"
            cursor="pointer"
            color={activeSortKey === sortKey || activeSortKey === `${sortKey}_asc` ? '#40a1ff' : ''}
          />
        </Flex>
      )}
    </Box>
  );
};

export default SortableHeader;

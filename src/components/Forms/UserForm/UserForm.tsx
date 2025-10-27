//@ts-nocheck
import { ForwardedRef, forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FormControl, FormErrorMessage, FormLabel, Input, Stack, Text, Checkbox } from '@chakra-ui/react';

import { useAppSelector } from '@/store/hooks';
import { selectCountryList } from '@/store/slices/country/countrySelectors';
import { userSchema } from '@/types/validation-schemas/user';
import { yupResolver } from '@hookform/resolvers/yup';
import Select from 'react-select';
import { ISelect } from '@/constants/roles';
import { Placeholder, customStyles } from '../../common/InputOption';
import { departmentApi } from '@/store/api/department/departmentApi';
import { companyApi } from '@/store/api/company/companyApi';
import { selectUserRole } from '@/store/slices/user/userSelectors';
import { useCompanyAccess } from '@/hooks/useCompanyAccess';
import { useRefreshCompanyAccess } from '@/hooks/useRefreshCompanyAccess';

interface IEditUserTypeFormProps {
  onSubmit?: (values: any) => void;
  user?: any;
  activeTab?: number;
}

interface IUserTypeForm {
  userName: string;
  email: string;
  country_id: number;
  role: string;
  company: string;
  subsidiary: string;
  firstName: string;
  lastName: string;
  department: number;
  reportingTo: number | null;
}

interface ProcessedData {
  [key: string]: any;
}

const baseUserRoles: ISelect[] = [
  { label: 'Employee', value: 'Employee' },
  { label: 'Manager', value: 'Manager' },
 
];
enum RoleId {
  Employee = 1,
  Manager = 2,
  Admin = 3,
  'User-admin' = 7
}

// Function to map roleId to role name
const getRoleNameFromId = (roleId: number): string => {
  switch (roleId) {
    case 1: return 'Employee';
    case 2: return 'Manager';
    case 3: return 'Admin';
    case 7: return 'User-admin';
    default: return 'Employee';
  }
};

// Function to map role name to roleId
const getRoleIdFromName = (roleName: string): number => {
  switch (roleName) {
    case 'Employee': return 1;
    case 'Manager': return 2;
    case 'Admin': return 3;
    case 'User-admin': return 7;
    default: return 1;
  }
};

function getUserRolesToShow(userRole: string) {
  if (userRole === "admin") {
    return [...baseUserRoles, { label: 'Client Admin', value: 'User-admin' }, { label: 'Greenfi Admin', value: 'Admin' }];
  } else if (userRole === "user-admin") {
    return [...baseUserRoles, { label: 'Client Admin', value: 'User-admin' }];
  }
  return baseUserRoles;
}

const UserForm = forwardRef(({ activeTab, onSubmit, user }: IEditUserTypeFormProps, ref: ForwardedRef<any>) => {
  const countries = useAppSelector(selectCountryList);
  const userRole = useAppSelector(selectUserRole);
  const userRoles: ISelect[] = getUserRolesToShow(userRole);

  
  const [showFullAccess, setShowFullAccess] = useState(false);
  const { companies: companyData, isLoading: isCompanyLoading, error: companyAccessError } = useCompanyAccess();
  
  useRefreshCompanyAccess();
  // Get all companies data for dropdown options
  const { data: allCompaniesData, isLoading: isAllCompaniesLoading } = companyApi.useGetAllCompaniesQuery({});
  
  const companyId = Number(sessionStorage.getItem("companyId"))
  // const { data:companyData,isLoading: isCompanyLoading } = companyApi.useGetAllCompaniesQuery({
  //   ...params,
  //   search: debouncedSearchTerm,
  //   ...(userRole === "User-admin" ? { id: companyId } : {}), // Only add `id` if userRole is "User-admin"
  // });
  const [getCompanyByFilter, { data: subsidiariesData, isLoading: subsidiariesIsLoading }] =
    companyApi.useLazyGetCompanyByFilterQuery();


  const {
    data: departmentData,
    isLoading: departmentIsLoading,
    isFetching: departmentIsFetching,
    refetch: departmentRefetch
  } = departmentApi.useGetAlldepartmentsQuery({});
  
  // Determine the role value for form initialization
  const getInitialRoleValue = () => {
    if (user?.roleId) {
      // If roleId is provided, map it to role name
      return getRoleNameFromId(user.roleId);
    } else if (user?.role) {
      // If role name is provided, use it directly
      return (user?.role === 'Manager-L1') || (user?.role === 'Manager-L2') ? 'Manager' : user?.role;
    }
    return undefined;
  };

  const { control, handleSubmit, setValue, formState: { errors }, reset, watch } = useForm<IUserTypeForm>({
    resolver: yupResolver(userSchema),
    defaultValues: {
      ...user,
      country_id: user?.countryId,
      company: user?.companyId,
      role: getInitialRoleValue(),
      reportingTo: user?.toReporting || null
    }
  });

  // Watch role value to filter reportingTo options (after useForm initialization)
  const watchedRole = watch('role');
  const watchedCompany = watch('company');
  
  // Watch subsidiary selection as well
  const watchedSubsidiary = watch('subsidiary');
  
  // Get the effective company ID (subsidiary takes precedence over company)
  const effectiveCompanyId = watchedSubsidiary || watchedCompany;
  


  
  // State for users data
  const [reportingUsers, setReportingUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  // Fetch users based on company/subsidiary selection using the same API as assigned page
  useEffect(() => {
    const fetchUsers = async () => {
      if (!effectiveCompanyId) {
        setReportingUsers([]);
        return;
      }
      
      setLoadingUsers(true);
      const greenFiTokenStr = sessionStorage.getItem('greenFiToken') || localStorage.getItem('greenFiToken');
      const token = greenFiTokenStr ? JSON.parse(greenFiTokenStr).accessToken : null;
      
      try {
        const companyIdsParam = effectiveCompanyId;
        const apiBaseUrl = import.meta.env.VITE_GREENFI_API;
        const url = `${apiBaseUrl}/users?page=1&max_results=100000000000&companyIds=[${companyIdsParam}]`;
        
        const response = await fetch(url, {
          headers: {
            Authorization: token ? `Bearer ${token}` : ''
          }
        });
        
        const data = await response.json();
        setReportingUsers(data?.data?.items || []);
      } catch (error) {
        console.error('Error fetching users for reporting:', error);
        setReportingUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, [effectiveCompanyId]);
  
  // Filter users based on role hierarchy
  const getReportingToOptions = () => {
    if (!reportingUsers.length || !watchedRole) return [];
    
    // Role hierarchy mapping - defines who can report to whom
    const roleHierarchy: { [key: string]: string[] } = {
      'Employee': ['Manager', 'Manager-L1', 'Manager-L2', 'User-admin'], // Employee can report to Manager or Client-Admin
      'Manager': ['User-admin'], // Manager reports to Client-Admin
      'Manager-L1': ['Manager-L2', 'User-admin'], // Manager-L1 reports to Manager-L2 or Client-Admin
      'Manager-L2': ['User-admin'], // Manager-L2 reports to Client-Admin
      'User-admin': [] // Client-Admin doesn't report to anyone
    };
    
    const allowedRoles = roleHierarchy[watchedRole] || [];
    
    // Filter users by allowed roles and exclude current user if editing
    return reportingUsers
      .filter(reportingUser => {
        // Exclude current user from options
        if (user && user.id === reportingUser.id) return false;
        
        // Include users with allowed roles
        return allowedRoles.includes(reportingUser.role);
      })
      .map(reportingUser => ({
        value: reportingUser.id,
        label: `${reportingUser.firstName} ${reportingUser.lastName} (${reportingUser.role})`
      }));
  };
  
  const reportingToOptions = getReportingToOptions();
  const processData = (data: any) => {
    const processedData: ProcessedData = Object.entries(data).reduce((acc, [key, value]) => {
      if (value !== '' || (key !== 'leaseId' && key !== 'floorArea')) {
        /*@ts-ignore */
        // Trim whitespace from string values
        acc[key] = typeof value === 'string' ? value.trim() : value;
      }
      return acc;
    }, {});

    const userRole = processedData['role'];
    processedData['roleId'] = getRoleIdFromName(userRole);

  // Explicitly remove subsidiary if it's null or undefined
  if (!processedData['subsidiary']) {
    delete processedData['subsidiary'];
  }

    // Use subsidiary ID as company_id if subsidiary is selected
    if (processedData['subsidiary']) {
      processedData['company_id'] = processedData['subsidiary'];
    } else {
      processedData['company_id'] = processedData['company'];
    }

    // Handle reportingTo field - map to toReporting for backend
    if (processedData['reportingTo']) {
      processedData['toReporting'] = processedData['reportingTo'];
    } else {
      processedData['toReporting'] = null;
    }
    
    // Remove the frontend field name
    delete processedData['reportingTo'];

    processedData['company'] = processedData['company_id'];
    return processedData;
  };

  useImperativeHandle(ref, () => ({
    submitForm: (callback: (processedData: ProcessedData) => Promise<void>) =>
      handleSubmit(async data => {
        const processedData = processData(data);
        await callback(processedData);
      })(),
    resetForm: () => reset()
  }));

  useEffect(() => {
    if (activeTab === 1) {
      departmentRefetch();
    }
  }, [activeTab]);

  // Set company value for User-admin and manager roles
  useEffect(() => {
    if ((userRole === "User-admin" || userRole === "manager") && companyId) {
      setValue('company', companyId);
      // Trigger subsidiary fetch for the selected company
      getCompanyByFilter({ parent_id: [companyId] }, true);
    }
  }, [userRole, companyId, setValue, getCompanyByFilter]);

  
  return (
    <form ref={ref} onSubmit={onSubmit && handleSubmit(onSubmit)}>
      <Stack spacing={3} maxH='650px' overflow={'auto'} pt={2}>
        {/* First Row */}
        <Stack direction={['column', 'row']} spacing={4}>
          <Controller
            name='userName'
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={!!errors.userName} maxW='307px'>
                <FormLabel>Username<span style={{ color: 'red' }}>*</span></FormLabel>
                <Input {...field} placeholder='Enter user name' />
                <FormErrorMessage>{errors?.userName?.message}</FormErrorMessage>
              </FormControl>
            )}
          />
          <Controller
            name='email'
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email ID<span style={{ color: 'red' }}>*</span></FormLabel>
                <Input {...field} placeholder='Enter email' />
                <FormErrorMessage>{errors?.email?.message}</FormErrorMessage>
              </FormControl>
            )}
          />
        </Stack>

        <Stack direction={['column', 'row']} spacing={4}>
          <Controller
            name='firstName'
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={!!errors.firstName} maxW='307px'>
                <FormLabel>First Name<span style={{ color: 'red' }}>*</span></FormLabel>
                <Input {...field} placeholder='Enter First Name' />
                <FormErrorMessage>{errors?.firstName?.message}</FormErrorMessage>
              </FormControl>
            )}
          />
          <Controller
            name='lastName'
            control={control}
            render={({ field }) => (
              <FormControl isInvalid={!!errors.lastName}>
                <FormLabel>Last Name<span style={{ color: 'red' }}>*</span></FormLabel>
                <Input {...field} placeholder='Enter Last Name' />
                <FormErrorMessage>{errors?.lastName?.message}</FormErrorMessage>
              </FormControl>
            )}
          />
        </Stack>

        <Stack direction={['column', 'row']} spacing={4} w={'100%'}>
          <Controller
            name='country_id'
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl maxW='307px' isInvalid={!!errors?.country_id}>
                <FormLabel>Country<span style={{ color: 'red' }}>*</span></FormLabel>
                <Select
                  components={{ Placeholder }}
                  menuPortalTarget={document.body}
                  styles={{
                    ...customStyles,
                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                  }}
                  placeholder='Select country'
                  options={countries}
                  value={countries.find(c => c.value === value)}
                  onChange={(option) => onChange(option?.value)}
                  menuPosition='fixed'
                />
                <FormErrorMessage>{errors?.country_id?.message}</FormErrorMessage>
              </FormControl>
            )}
          />
          {/* Need to me changed Row */}
          <Controller
            name='role'
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl w={'100%'} isInvalid={!!errors?.role}>
                <FormLabel>Role<span style={{ color: 'red' }}>*</span></FormLabel>
                <Select
                  components={{ Placeholder }}
                  menuPortalTarget={document.body}
                  styles={{
                    ...customStyles,
                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                  }}
                  placeholder='Select user role'
                  options={userRoles}
                  value={userRoles.find((role: ISelect) => role.value === value)}
                  onChange={(option) =>{ 
                    if(option?.value === 'User-admin') 
                      setShowFullAccess(true)
                    else
                      setShowFullAccess(false)
                    onChange(option?.value)

                  }}
                  menuPosition='fixed'
                />
                <FormErrorMessage>{errors?.role?.message}</FormErrorMessage>
              </FormControl>
            )}
          />
        </Stack>

        {/* Hidden field for full access */}
        {showFullAccess && (
          <Controller
            name="fullAccess"
            control={control}
            defaultValue={false}
            render={({ field }) => (
              <FormControl display="flex" alignItems="center" mt={1}>
                <Checkbox
                  isChecked={!!field.value}
                  onChange={e => field.onChange(e.target.checked)}
                  colorScheme="teal"
                >
                  <b>Full Access</b>
                </Checkbox>
              </FormControl>
            )}
          />
        )}



        {/* Department, Company and Subsidiary */}
        <Stack direction={['column', 'row']} spacing={4} w={'100%'}>
          <Controller
            name='department'
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormControl maxW='307px' isInvalid={!!errors?.department}>
                <FormLabel>Department<span style={{ color: 'red' }}>*</span></FormLabel>
                <Select
                  components={{ Placeholder }}
                  menuPortalTarget={document.body}
                  styles={{
                    ...customStyles,
                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                  }}
                  placeholder='Select Department'
                  options={departmentData?.data?.results.map((item: any) => ({ value: item.id, label: item.name }))}
                  isLoading={departmentIsLoading}
                  value={departmentData?.data?.results.map((item: any) => ({
                    value: item.id,
                    label: item.name
                  })).find((c: { value: number; }) => c.value === value)}
                  onChange={(option: { value: any; }) => onChange(option?.value)}
                  menuPosition='fixed'
                />
                <FormErrorMessage>{errors?.department?.message}</FormErrorMessage>
              </FormControl>
            )}
          />
        <Controller
          name="company"
          control={control}
          render={({ field: { onChange, value } }) => {
            // Get user's accessible company IDs from new API
            const accessibleCompanyIds = companyData?.map(company => company.id) || [];
            
            // Filter all companies based on user access and organize by parent-child
            const allCompanies = allCompaniesData?.data || [];
            
            // Separate parents and subsidiaries
            const parentCompanies = allCompanies.filter(company => !company.parentId);
            const subsidiaryCompanies = allCompanies.filter(company => company.parentId);
            
            // Determine which companies user can access
            const accessibleParents = parentCompanies.filter(company => 
              accessibleCompanyIds.includes(company.id) || 
              subsidiaryCompanies.some(subsidiary => 
                subsidiary.parentId === company.id && accessibleCompanyIds.includes(subsidiary.id)
              )
            );
            
            // Filter based on user role
            const filteredCompanies = userRole?.toLowerCase() === "user-admin" 
            ? accessibleParents.filter(company => company.id === companyId || company.parentId === companyId)
            : accessibleParents;
            
            return (
              <FormControl isInvalid={!!errors?.company}>
                <FormLabel>
                  Company<span style={{ color: "red" }}>*</span>
                </FormLabel>
                <Select
                  components={{ Placeholder }}
                  menuPortalTarget={document.body}
                  styles={{
                    ...customStyles,
                    menuPortal: (base) => ({ ...base, zIndex: 9999 })
                  }}
                  placeholder="Select Company"
                  options={filteredCompanies?.map((item: any) => ({
                    value: item.id,
                    label: item.name,
                  }))}
                  value={filteredCompanies?.map((item: any) => ({
                    value: item.id,
                    label: item.name,
                  })).find((item: any) => item.value === value)}
                  isLoading={isCompanyLoading || isAllCompaniesLoading}
                  onChange={(option: { value: any }) => {
                    onChange(option?.value);
                    setValue("subsidiary", null);
                    getCompanyByFilter({ parent_id: [option?.value] }, true);
                  }}
                  menuPosition="fixed"
                />
                <FormErrorMessage>{errors?.company?.message}</FormErrorMessage>
              </FormControl>
            );
          }}
        />

        </Stack>
        {subsidiariesData && (
          <Controller
            name='subsidiary'
            control={control}
            render={({ field: { onChange, value } }) => {
              // Filter subsidiaries based on user access
              const accessibleCompanyIds = companyData?.map(company => company.id) || [];
              const accessibleSubsidiaries = subsidiariesData?.data?.result?.filter(
                (subsidiary: any) => accessibleCompanyIds.includes(subsidiary.id)
              ) || [];
              
              const selectedSubsidiary = accessibleSubsidiaries.find(item => item.id === value);
              
              return (
                <FormControl maxW="307px" isInvalid={!!errors?.subsidiary}>
                  <FormLabel>Subsidiary</FormLabel>
                  <Select
                    components={{ Placeholder }}
                    menuPortalTarget={document.body}
                    styles={{
                      ...customStyles,
                      menuPortal: (base) => ({ ...base, zIndex: 9999 })
                    }}
                    placeholder="Select Subsidiary"
                    options={accessibleSubsidiaries?.map((item: any) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                    value={selectedSubsidiary
                      ? { value: selectedSubsidiary.id, label: selectedSubsidiary.name }
                      : null}
                    isLoading={subsidiariesIsLoading}
                    onChange={(option) => onChange(option ? option.value : null)}
                    menuPosition="fixed"
                    isClearable={false}
                  />
                  <FormErrorMessage>{errors?.subsidiary?.message}</FormErrorMessage>
                </FormControl>
              );
            }}
          />
        )}

        {/* Reporting To field - Show for Employee and Manager roles (not Client-Admin) */}
        {(watchedRole === 'Employee' || watchedRole === 'Manager') && (
          <Stack direction={['column']} spacing={3} w={'100%'} mt={2}>
            <Controller
              name='reportingTo'
              control={control}
              render={({ field: { onChange, value } }) => (
                <FormControl isInvalid={!!errors?.reportingTo}>
                  <FormLabel>Reporting To</FormLabel>
                  <Select
                    components={{ Placeholder }}
                    menuPortalTarget={document.body}
                    styles={{
                      ...customStyles,
                      menuPortal: (base) => ({ ...base, zIndex: 9999 })
                    }}
                    placeholder='Select reporting manager'
                    options={reportingToOptions}
                    value={reportingToOptions.find((option) => option.value === value)}
                    onChange={(option) => onChange(option?.value || null)}
                    menuPosition='fixed'
                    isLoading={loadingUsers}
                    isDisabled={!watchedRole || !effectiveCompanyId || reportingToOptions.length === 0}
                  />
                  <FormErrorMessage>{errors?.reportingTo?.message}</FormErrorMessage>
                  {reportingToOptions.length === 0 && watchedRole && effectiveCompanyId && !loadingUsers && (
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      No available reporting managers found in this company
                    </Text>
                  )}
                </FormControl>
              )}
            />
          </Stack>
        )}

      </Stack>
    </form>
  );
});

UserForm.displayName = 'UserForm';
export default UserForm;


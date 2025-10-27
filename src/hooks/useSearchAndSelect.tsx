//@ts-nocheck
import { useCallback, useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { MultiValue, SingleValue } from 'react-select';

import { OptionType } from '@/types/common/load-options';
import { useDebounce } from '@uidotdev/usehooks';

export interface BasicSearchAndSelectI {
  institution: string;
  framework: string | string[];
  industry: string;
  submittedBy?: string;
  submittedYear?: string;
  company?: string;
}

// @ts-ignore
function useSearchAndSelect<T extends BasicSearchAndSelectI>({
  setValue,
  handleFilterChange
}: {
  setValue?: UseFormSetValue<T>,
  handleFilterChange?: (filterName: string, selectedOptions: any[]) => void
}) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, 800);

  const [institution, setInstitution] = useState<OptionType | null>(null);
  const [framework, setFramework] = useState<OptionType | null>(null);
  const [industry, setIndustry] = useState<OptionType | null>(null);
  const [department, setDepartment] = useState<OptionType | null>(null);
  const [scope, setScope] = useState<OptionType | null>(null);
  const [submittedBy, setSubmittedBy] = useState<OptionType | null>(null);
  const [company, setCompany] = useState<OptionType | null>(null);
  const [submittedYear, setSubmittedYear] = useState<OptionType | null>(null);
  const [users, setUsers] = useState<OptionType | null>(null);
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  const useCreateHandleSelectChange = (
    setter: React.Dispatch<React.SetStateAction<OptionType | null>>,
    fieldName?: keyof T
  ) =>
    useCallback(
      (selectedOption: SingleValue<OptionType> | MultiValue<OptionType>) => {
        const isMultiValue = Array.isArray(selectedOption);
        setter(isMultiValue ? selectedOption : selectedOption);

        if (setValue && fieldName) {
          const value = isMultiValue
            ? selectedOption.map(option => option?.value?.toString())
            : selectedOption
              ? selectedOption?.value?.toString()
              : '';
          // @ts-ignore
          setValue(fieldName, value, { shouldValidate: true });
        }

        if (handleFilterChange && selectedOption) {
          const ids = isMultiValue ? selectedOption?.map(option => option?.value) : [selectedOption?.value];
          handleFilterChange(`${fieldName as string}Ids`, ids);
        }
      },
      [setter, fieldName, setValue, handleFilterChange]
    );

  return {
    debouncedSearchTerm,
    institution,
    framework,
    industry,
    submittedBy,
    company,
    submittedYear,
    department,
    scope,
    users,
    handleSearchChange,
    handleCompanyChange: useCreateHandleSelectChange(setCompany, 'company'),
    handleInstitutionChange: useCreateHandleSelectChange(setInstitution, 'institution'),
    handleSubmittedByChange: useCreateHandleSelectChange(setSubmittedBy, 'submittedBy'),
    handleFrameworkChange: useCreateHandleSelectChange(setFramework, 'framework'),
    handleIndustryChange: useCreateHandleSelectChange(setIndustry, 'industry'),
    handleDepartmentChange: useCreateHandleSelectChange(setDepartment, 'department'),
    handleSubmittedYearChange: useCreateHandleSelectChange(setSubmittedYear, 'submittedYear'),
    handleScopeChange: useCreateHandleSelectChange(setScope, 'scope'),
    handleUsersChange: useCreateHandleSelectChange(setUsers, 'users')
  };
}

export default useSearchAndSelect;

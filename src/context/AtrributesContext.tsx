import React, { createContext, useContext, useMemo, useState } from 'react';

import useLoadOptions, { ApiType } from '@/hooks/useLoadOptions';

type OptionsState<T> = {
  data: T[],
  setData: React.Dispatch<React.SetStateAction<T[]>>
};

type OptionsContextType = {
  loadOptions: (apiType: ApiType) => ReturnType<typeof useLoadOptions>,
  institution: OptionsState<any>,
  framework: OptionsState<any>,
  industry: OptionsState<any>,
  department: OptionsState<any>,
  scope: OptionsState<any>,
  users: OptionsState<any>
};

const AttributesContext = createContext<OptionsContextType | undefined>(undefined);

export const AttributesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [institutionData, setInstitutionData] = useState<any[]>([]);
  const [frameworkData, setFrameworkData] = useState<any[]>([]);
  const [industryData, setIndustryData] = useState<any[]>([]);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [scopeData, setScopeData] = useState<any[]>([]);
  const [usersData, setUsersData] = useState<any[]>([]);

  const institution = useLoadOptions(ApiType.Institution);
  const framework = useLoadOptions(ApiType.Framework);
  const industry = useLoadOptions(ApiType.Industry);
  const department = useLoadOptions(ApiType.Department);
  const scope = useLoadOptions(ApiType.Scope);
  const users = useLoadOptions(ApiType.Users);

  const value = useMemo(
    () => ({
      loadOptions: (apiType: ApiType) => {
        switch (apiType) {
          case ApiType.Institution:
            return institution;
          case ApiType.Framework:
            return framework;
          case ApiType.Industry:
            return industry;
          case ApiType.Department:
            return department;
          case ApiType.Scope:
            return scope;
          case ApiType.Users:
            return users;
          default:
            throw new Error('Unsupported API type');
        }
      },
      institution: { data: institutionData, setData: setInstitutionData },
      framework: { data: frameworkData, setData: setFrameworkData },
      industry: { data: industryData, setData: setIndustryData },
      department: { data: departmentData, setData: setDepartmentData },
      scope: { data: scopeData, setData: setScopeData },
      users: { data: usersData, setData: setUsersData }
    }),
    [institutionData, frameworkData, industryData, departmentData, scopeData, usersData]
  );

  return <AttributesContext.Provider value={value}>{children}</AttributesContext.Provider>;
};

export const useAttributes = () => {
  const context = useContext(AttributesContext);
  if (!context) {
    throw new Error('useOptions must be used within an AttributesProvider');
  }
  return context;
};

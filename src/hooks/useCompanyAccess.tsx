import { useAppSelector } from '@/store/hooks';
import {
    selectCompanyAccessList,
    selectCompanyAccessLoading,
    selectCompanyAccessError,
    selectCompanyAccessById,
    selectCompanyAccessByParentId
} from '@/store/slices/companyAccess/companyAccessSelectors';

export const useCompanyAccess = () => {
  const companies = useAppSelector(selectCompanyAccessList);
  const isLoading = useAppSelector(selectCompanyAccessLoading);
  const error = useAppSelector(selectCompanyAccessError);

  const getCompanyById = (companyId: number) => {
    return useAppSelector(state => selectCompanyAccessById(state, companyId));
  };

  const getCompaniesByParentId = (parentId: number) => {
    return useAppSelector(state => selectCompanyAccessByParentId(state, parentId));
  };

  return {
    companies,
    isLoading,
    error,
    getCompanyById,
    getCompaniesByParentId
  };
}; 
import { useEffect } from 'react';
import { companyApi } from '@/store/api/company/companyApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCompanyAccess } from '@/store/slices/refresh/refreshSelectors';
import { setRefetchQuery } from '@/store/slices/refresh/refreshSlice';
import { setCompanyAccess, setCompanyAccessError, setCompanyAccessLoading } from '@/store/slices/companyAccess/companyAccessSlice';

export const useRefreshCompanyAccess = () => {
  const dispatch = useAppDispatch();
  const { data, isLoading, error, refetch } = companyApi.useGetCompanyAccessListQuery({});
  const shouldRefetch = useAppSelector(selectCompanyAccess);

  const refreshCompanyAccess = async () => {
    try {
      dispatch(setCompanyAccessLoading(true));
      const response = await refetch();
      if (response?.data?.data) {
        console.log('Refreshed company access data:', response.data.data);
        dispatch(setCompanyAccess(response.data.data));
      }
    } catch (error) {
      console.error('Error refreshing company access:', error);
      dispatch(setCompanyAccessError('Failed to refresh company access'));
    }
  };

  const forceRefreshCompanyAccess = async () => {
    try {
      console.log('Force refreshing company access data...');
      dispatch(setCompanyAccessLoading(true));
      const response = await refetch();
      if (response?.data?.data) {
        console.log('Force refreshed company access data:', response.data.data);
        dispatch(setCompanyAccess(response.data.data));
      }
    } catch (error) {
      console.error('Error force refreshing company access:', error);
      dispatch(setCompanyAccessError('Failed to force refresh company access'));
    }
  };

  // Handle initial data load and refresh requests
  useEffect(() => {
    if (shouldRefetch) {
      refreshCompanyAccess();
      dispatch(setRefetchQuery({ queryKey: 'companyAccess', value: false }));
    } else if (data?.data && !isLoading) {
      // Set initial data when it's loaded
      console.log('Setting company access data from API:', data.data);
      dispatch(setCompanyAccess(data.data));
    }
  }, [shouldRefetch, data, isLoading, dispatch]);

  return { refreshCompanyAccess, forceRefreshCompanyAccess, isLoading, error };
}; 
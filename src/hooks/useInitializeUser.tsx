import { useEffect } from 'react';

import { GREENFI_STORAGE_KEY } from '@/constants';
import { companyApi } from '@/store/api/company/companyApi';
import { countryApi } from '@/store/api/country/countryApi';
import { userApi } from '@/store/api/user/userApi';
import { setCompanyAccess } from '@/store/slices/companyAccess/companyAccessSlice';
import { selectCountryList } from '@/store/slices/country/countrySelectors';
import { setCountries } from '@/store/slices/country/countrySlice';
import { setUser } from '@/store/slices/user/userSlice';

import { mockCountries } from '../constants/mock/countries';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useLogout } from './useLogout';

const useInitializeUser = () => {
  const handleLogout = useLogout();
  const dispatch = useAppDispatch();
  const [getUserInfo] = userApi.useGetUserInfoMutation();
  const [getCountry, { isUninitialized, isSuccess }] = countryApi.useGetCountryMutation();
  const { data: companyAccessData, isLoading: isCompanyAccessLoading } = companyApi.useGetCompanyAccessListQuery({});
  const countries = useAppSelector(selectCountryList);
  const localToken = sessionStorage.getItem(GREENFI_STORAGE_KEY) || localStorage.getItem(GREENFI_STORAGE_KEY);

  useEffect(() => {
    const fetchData = async () => {
      if (!countries.length && isUninitialized) {
        const countryList = (await getCountry().unwrap()) || mockCountries;
        isSuccess && countryList?.data.length > 0
          ? dispatch(setCountries(countryList.data))
          : dispatch(setCountries(mockCountries));
      }
      if (localToken) {
        try {
          console.log('useInitializeUser: Fetching user info');
          const user = await getUserInfo().unwrap();
          console.log('useInitializeUser: User info fetched successfully', user.data);
          dispatch(setUser(user.data));
        } catch (error: any) {
          console.log('useInitializeUser: Error fetching user info:', error);

          // Only logout if it's an actual authentication error (401/403)
          // Don't logout on network errors or other issues
          if (error?.status === 401 || error?.status === 403) {
            console.log('useInitializeUser: Authentication error, logging out');
            await handleLogout();
          } else {
            console.log('useInitializeUser: Non-auth error, not logging out');
            // For other errors, just log them but don't logout
            // This prevents logout on network issues or temporary API problems
          }
        }
      }
    };

    fetchData();
  }, []);

  // Handle company access data when it's loaded
  useEffect(() => {
    if (companyAccessData?.data) {
      dispatch(setCompanyAccess(companyAccessData.data));
    }
  }, [companyAccessData, dispatch]);
};

export default useInitializeUser;

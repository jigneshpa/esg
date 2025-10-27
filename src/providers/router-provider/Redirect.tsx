import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Center, Spinner } from '@chakra-ui/react';

import { GREENFI_STORAGE_KEY, URLS, USER_ROLE } from '@/constants';
import { userApi } from '@/store/api/user/userApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUser, selectUserRole } from '@/store/slices/user/userSelectors';
import { setUser } from '@/store/slices/user/userSlice';

export const RedirectPage = () => {
  const dispatch = useAppDispatch();
  const [getUserInfo] = userApi.useGetUserInfoMutation();
  const localToken = sessionStorage.getItem(GREENFI_STORAGE_KEY) || localStorage.getItem(GREENFI_STORAGE_KEY);
  const userRole = useAppSelector(selectUserRole);
  const user = useAppSelector(selectUser);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent multiple fetches
    if (hasFetchedRef.current) {
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const fetchData = async () => {
      // Only fetch if we have a token but no user role
      if (localToken && !userRole && !user?.role) {
        try {
          console.log('RedirectPage: Fetching user info');
          setIsLoading(true);
          hasFetchedRef.current = true;

          // Set a timeout to prevent infinite loading
          timeoutId = setTimeout(() => {
            console.log('RedirectPage: Timeout reached, redirecting to login');
            setIsLoading(false);
            setHasAttemptedFetch(true);
            localStorage.removeItem(GREENFI_STORAGE_KEY);
            sessionStorage.removeItem(GREENFI_STORAGE_KEY);
            window.location.href = URLS.LOG_IN;
          }, 10000); // 10 second timeout

          const userResponse = await getUserInfo().unwrap();
          clearTimeout(timeoutId);
          console.log('RedirectPage: User info fetched successfully', userResponse.data);
          dispatch(setUser(userResponse.data));
        } catch (error: any) {
          clearTimeout(timeoutId);
          console.error('RedirectPage: Error fetching user info:', error);
          // If there's an authentication error (401/403), clear the token and redirect to login
          if (error?.status === 401 || error?.status === 403) {
            console.log('RedirectPage: Authentication error, clearing token and redirecting to login');
            localStorage.removeItem(GREENFI_STORAGE_KEY);
            sessionStorage.removeItem(GREENFI_STORAGE_KEY);
            window.location.href = URLS.LOG_IN;
            return;
          }
        } finally {
          setIsLoading(false);
          setHasAttemptedFetch(true);
        }
      } else {
        // If we have user role or no token, mark as attempted
        setHasAttemptedFetch(true);
        hasFetchedRef.current = true;
      }
    };

    fetchData();

    // Cleanup function to clear timeout if component unmounts
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [localToken, userRole, user?.role]); // Removed getUserInfo and dispatch from dependencies to prevent infinite re-renders

  // Show loading spinner while fetching user data
  if (isLoading) {
    return (
      <Center h={'100vh'}>
        <Spinner size={'xl'} thickness={'4px'} color={'grey.800'} />
      </Center>
    );
  }

  // If we have a token but no user role and we haven't attempted to fetch yet, show loading
  if (localToken && !userRole && !user?.role && !hasAttemptedFetch) {
    return (
      <Center h={'100vh'}>
        <Spinner size={'xl'} thickness={'4px'} color={'grey.800'} />
      </Center>
    );
  }

  // Redirect based on user role (check both userRole from selector and user.role from store)
  const currentRole = userRole || user?.role;

  if (localToken && currentRole === USER_ROLE.ADMIN) return <Navigate to={URLS.ADMIN} replace={true} />;
  if (localToken && currentRole === USER_ROLE.USER_ADMIN) return <Navigate to={URLS.ADMIN} replace={true} />;
  if (localToken && currentRole === USER_ROLE.MANAGER) return <Navigate to={URLS.MANAGER} replace={true} />;
  if (localToken && currentRole === USER_ROLE.MANAGERL2) return <Navigate to={URLS.MANAGER} replace={true} />;
  if (localToken && currentRole === USER_ROLE.USER) return <Navigate to={URLS.USER} replace={true} />;

  // If no token or no user role after attempting to fetch, redirect to login
  if (!localToken || (!currentRole && hasAttemptedFetch)) {
    return <Navigate to={URLS.LOG_IN} replace={true} />;
  }

  return null;
};

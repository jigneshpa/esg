import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { GREENFI_STORAGE_KEY } from '@/constants';
import { RootState } from '@/store';
import { selectUser, selectUserRole } from '@/store/slices/user/userSelectors';

export const useAuthState = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const user = useSelector(selectUser);
  const userRole = useSelector(selectUserRole);
  const token = sessionStorage.getItem(GREENFI_STORAGE_KEY) || localStorage.getItem(GREENFI_STORAGE_KEY);

  // Check if Redux persist is still rehydrating
  const isRehydrated = useSelector((state: RootState) => {
    const userState = state.user;
    return userState && typeof userState === 'object';
  });

  useEffect(() => {
    const checkAuthState = () => {
      console.log('=== useAuthState: Checking auth state ===', {
        token: !!token,
        userRole,
        isRehydrated,
        hasUser: !!user?.id,
        userData: user,
        timestamp: new Date().toISOString()
      });

      // If Redux persist is still rehydrating, wait
      if (!isRehydrated) {
        console.log('useAuthState: Waiting for rehydration');
        setIsLoading(true);
        setIsAuthenticated(false);
        return;
      }

      // If no token, not authenticated
      if (!token) {
        console.log('useAuthState: No token found');
        setIsLoading(false);
        setIsAuthenticated(false);
        return;
      }

      // If token exists but no user role yet, still loading
      if (token && !userRole && !user?.role) {
        console.log('useAuthState: Token exists but no user role, still loading');
        setIsLoading(true);
        setIsAuthenticated(false);
        return;
      }

      // If token and user role exist, authenticated
      if (token && (userRole || user?.role)) {
        console.log('useAuthState: User authenticated', { userRole, userRoleFromUser: user?.role });
        setIsLoading(false);
        setIsAuthenticated(true);
        return;
      }

      // Default case
      console.log('useAuthState: Default case - not authenticated');
      setIsLoading(false);
      setIsAuthenticated(false);
    };

    checkAuthState();
  }, [token, userRole, user, isRehydrated]);

  return {
    isLoading,
    isAuthenticated,
    user,
    userRole,
    token: !!token
  };
};

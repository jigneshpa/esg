import React from 'react';
import { Navigate } from 'react-router-dom';
import { Center, Spinner } from '@chakra-ui/react';

import { URLS, USER_ROLE } from '@/constants';
import { useAuthState } from '@/hooks/useAuthState';
import { debugAuthState } from '@/utils';

interface WithAuthProps {
  role: USER_ROLE | USER_ROLE[];
  children: React.ReactNode;
}

const WithAuth: React.FC<WithAuthProps> = ({ role, children }) => {
  const { isLoading, isAuthenticated, userRole, token } = useAuthState();

  console.log('=== WithAuth Component ===', {
    isLoading,
    isAuthenticated,
    userRole,
    role,
    hasUser: !!token,
    timestamp: new Date().toISOString()
  });

  // Show loading spinner while checking authentication
  if (isLoading) {
    console.log('WithAuth: Showing loading spinner');
    return (
      <Center h={'100vh'}>
        <Spinner size={'xl'} thickness={'4px'} color={'grey.800'} />
      </Center>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('WithAuth: Not authenticated, redirecting to login');
    debugAuthState();
    return <Navigate to={URLS.LOG_IN} replace={true} />;
  }

  // Check if user has the required role
  if (userRole && !role.includes(userRole as USER_ROLE)) {
    console.log('WithAuth: User role not authorized, redirecting');
    let redirectUrl = URLS.HOME;

    if (userRole === USER_ROLE.USER) redirectUrl = URLS.HOME;
    else if (userRole === USER_ROLE.MANAGER) redirectUrl = URLS.HOME;
    else if (userRole === USER_ROLE.MANAGERL2) redirectUrl = URLS.HOME;
    else if (userRole === USER_ROLE.ADMIN) redirectUrl = URLS.ADMIN;
    else if (userRole === USER_ROLE.USER_ADMIN) redirectUrl = URLS.ADMIN;

    return <Navigate to={redirectUrl} replace={true} />;
  }

  console.log('WithAuth: User authenticated and authorized, rendering children');
  return <>{children}</>;
};

export default WithAuth;

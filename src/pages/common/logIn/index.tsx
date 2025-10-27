import { Navigate } from 'react-router-dom';
import { Box } from '@chakra-ui/react';

import { Login as LoginForm } from '@/components';
import { GREENFI_STORAGE_KEY, URLS, USER_ROLE } from '@/constants';
import { useAppSelector } from '@/store/hooks';
import { selectUserRole } from '@/store/slices/user/userSelectors';

import AuthLayout from '../../../layouts/auth-layout';

const LogIn = () => {
  const token = localStorage.getItem(GREENFI_STORAGE_KEY) || sessionStorage.getItem(GREENFI_STORAGE_KEY);
  const userRole = useAppSelector(selectUserRole);

  if (token && userRole === USER_ROLE.ADMIN) return <Navigate to={URLS.ADMIN} replace={true} />;
  if (token && userRole === USER_ROLE.USER_ADMIN) return <Navigate to={URLS.ADMIN} replace={true} />;
  if ((token && userRole === USER_ROLE.USER) || userRole === USER_ROLE.MANAGER)
    return <Navigate to={URLS.HOME} replace={true} />;

  return (
    <AuthLayout>
      <Box
        w={{ base: '100%' }}
        maxW={{
          base: '360px',
          lg: '398px'
        }}
        m={'auto'}
      >
        <LoginForm />
      </Box>
    </AuthLayout>
  );
};

export default LogIn;

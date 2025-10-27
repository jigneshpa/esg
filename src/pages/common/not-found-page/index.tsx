import { HiHome } from 'react-icons/hi';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button, Heading, Image, Text, VStack } from '@chakra-ui/react';

import { logoGreen, UobLogo } from '@/assets';
import AuthLayout from '@/layouts/auth-layout';
import { GREENFI_STORAGE_KEY, URLS, USER_ROLE } from '@/constants';
import { useAppSelector } from '@/store/hooks';
import { selectUserRole } from '@/store/slices/user/userSelectors';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem(GREENFI_STORAGE_KEY) || sessionStorage.getItem(GREENFI_STORAGE_KEY);
  const userRole = useAppSelector(selectUserRole);

  const logoImage = import.meta.env.VITE_IS_CLIENT === 'false' ? logoGreen : UobLogo;

  if (token && userRole === USER_ROLE.ADMIN) return <Navigate to={URLS.ADMIN} replace={true} />;
  if (token && userRole === USER_ROLE.USER_ADMIN) return <Navigate to={URLS.ADMIN} replace={true} />;

  if (token && userRole === USER_ROLE.MANAGER) return <Navigate to={URLS.MANAGER} replace={true} />;

  if (token && userRole === USER_ROLE.MANAGERL2) return <Navigate to={URLS.MANAGER} replace={true} />;

  if (token && userRole === USER_ROLE.USER)
    return <Navigate to={URLS.USER} replace={true} />;

  if (!token && !userRole) {
    return <Navigate to={URLS.LOG_IN} replace={true} />;
  }

  return (
    <AuthLayout>
      <VStack
        w={{
          base: '360px',
          lg: '100%'
        }}
        m={{
          base: 'auto',
          lg: '0px'
        }}
        p={{ base: '0px', lg: '0px 60px' }}
        alignItems={{
          base: 'center',
          lg: 'flex-start'
        }}
      >
        <Image
          src={logoImage}
          cursor={'pointer'}
          display={{
            base: 'block',
            lg: 'none'
          }}
          h={{
            base: '60px',
            md: '70px'
          }}
        />
        <Heading as="h1" fontSize="8xl">
          404
        </Heading>
        <Heading as="h3" fontSize="3xl">
          UH OH! You&#39;re lost.
        </Heading>
        <Text fontSize="xl" mt="4" textAlign={'justify'}>
          The page you are looking for does not exist. How you got here is a mystery. But you can click the button below
          to go back to the homepage.
        </Text>
        <Button mt="2" leftIcon={<HiHome />} variant="outline" borderColor={'primary'} onClick={() => navigate('/')}>
          Home
        </Button>
      </VStack>
    </AuthLayout>
  );
};

export default NotFoundPage;

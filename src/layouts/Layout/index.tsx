import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Flex, Hide, Show, VStack } from '@chakra-ui/react';

import { Footer } from '@/components';
import Header from '@/components/HeaderV2';
import HeaderMobile from '@/components/HeaderMobile';
import { useAppContext } from '@/context/AppContext';
import useInactivityLogout from '@/hooks/useInactivityLogout';
import { useLogout } from '@/hooks/useLogout';
import { userApi } from '@/store/api/user/userApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/user/userSelectors';
import { setUser } from '@/store/slices/user/userSlice';
import { useWindowSize } from '@uidotdev/usehooks';

import SideBarContainer from '../../components/SideBarContainer';

const Layout = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [getUserInfo] = userApi.useGetUserInfoMutation();
  const size = useWindowSize();
  const [isUserLoading, setIsUserLoading] = useState(false);
  const { sideBarOpen, setSideBarOpen } = useAppContext() as {
    sideBarOpen: boolean,
    setSideBarOpen: (value: boolean) => void
  };
  const handleLogout = useLogout();
  useInactivityLogout(handleLogout);

  useEffect(() => {
    setSideBarOpen(false);
    //refetching user after refreshing page
    const refetchUserInfo = async () => {
      console.log('Layout: Starting user refetch', { userRole: user.role, hasUser: !!user.id });
      try {
        if (!user.role) {
          console.log('Layout: No user role found, fetching user info');
          setIsUserLoading(true);
          const result = await getUserInfo().unwrap();
          const isUserVerified = !!result.data.isVerified;
          console.log('Layout: User info fetched', {
            isUserVerified,
            userRole: result.data.role,
            userId: result.data.id
          });
          if (isUserVerified) {
            dispatch(setUser(result.data));
            console.log('Layout: User set in store');
          }
        } else {
          console.log('Layout: User role already exists, skipping fetch');
        }
      } catch (error: any) {
        console.log('Layout: Error fetching user info:', error);
        // Only logout if it's an authentication error (401/403)
        if (error?.status === 401 || error?.status === 403) {
          console.log('Layout: Authentication error, logging out');
          await handleLogout();
        }
      } finally {
        setIsUserLoading(false);
        console.log('Layout: User loading finished');
      }
    };
    refetchUserInfo();
  }, []);

  // Don't render the layout until user data is loaded (if user has a role, they're already loaded)
  if (isUserLoading && !user.role) {
    console.log('Layout: Showing loading state');
    return null;
  }

  console.log('Layout: Rendering layout', { userRole: user.role, hasUser: !!user.id });
  return (
    <Flex h={size?.height || '100vh'} justifyContent={'space-between'} bg={'grey.100'}>
      <Show above="lg">
        <SideBarContainer />
      </Show>
      <Show above={'lg'}></Show>
      <VStack flex={1} bg={'grey.100'} overflow={'hidden'} gap={0}>
        <Show above="lg">
          <Header />
        </Show>
        <Hide above="lg">
          <HeaderMobile isOpen={sideBarOpen} setIsOpen={setSideBarOpen} />
        </Hide>
        <VStack w={'100%'} flex={1} h={'100%'} overflow={'auto'} alignItems={'start'}>
          <Outlet />
        </VStack>
        <Footer />
      </VStack>
    </Flex>
  );
};

export default Layout;

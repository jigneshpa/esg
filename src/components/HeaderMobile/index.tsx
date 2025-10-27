//@ts-nocheck
import { useEffect } from 'react';
import { FiLogOut } from 'react-icons/fi';
import { MdClose } from 'react-icons/md';
import { RiMenuFill } from 'react-icons/ri';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Icon,
  IconButton,
  Image,
  Show,
  Text
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';

import { logoGreen, UobLogo } from '@/assets';
import { URLS } from '@/constants';
import { formatFileUrlWithToken } from '@/utils';

import { useLogout } from '../../hooks/useLogout';
import { useAppSelector } from '../../store/hooks';
import { selectUser } from '../../store/slices/user/userSelectors';
import SideBarMenu from '../SideBarMenu';

const HeaderMobile = ({ isOpen, setIsOpen, ...rest }) => {
  const user = useAppSelector(selectUser);
  const handleLogout = useLogout();
  const navigate = useNavigate();

  const handleClickLogOut = async () => {
    const isSuccess = await handleLogout();
    if (isSuccess) {
      setIsOpen(false);
      navigate(URLS.LOG_IN, { replace: true });
    }
  };

  useEffect(() => {
    const html = document.querySelector('html');
    const headerMobile = document.querySelector('.header-mobile');
    if (window && isOpen) {
      html.style.height = '100%';
      html.style.overflowY = 'hidden';
      headerMobile.style.overflow = 'hidden';
    } else {
      html.style.height = 'unset';
      html.style.overflowY = 'auto';
      headerMobile.style.overflow = 'unset';
    }
  }, [isOpen]);
  const logoImage = import.meta.env.VITE_IS_CLIENT === 'false' ? logoGreen : UobLogo;

  return (
    <>
      <Flex
        className="header-mobile"
        justifyContent={'space-between'}
        alignContent={'center'}
        p={{
          base: '16px 20px',
          md: '14px 30px'
        }}
        bg={'white'}
        zIndex={1100}
        boxShadow={'0px 0px 16px 0px #0000001A'}
        w={'100%'}
        {...rest}
      >
        <IconButton
          w="32px"
          h="32px"
          minWidth="unset"
          display="flex"
          alignItems="center"
          outline="none"
          variant="unstyled"
          icon={
            isOpen ? (
              <Icon as={MdClose} fontSize="2.5em" color="grey.600" />
            ) : (
              <Icon as={RiMenuFill} fontSize="2.2em" color="grey.600" />
            )
          }
          onClick={() => setIsOpen(!isOpen)}
          color="primary"
        />
      </Flex>
      <Box>
        <Show below="md">
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ ease: 'easeOut', duration: 0.3 }}
                style={{
                  position: 'fixed',
                  top: '66px',
                  left: 0,
                  bottom: 0,
                  width: '100%',
                  background: 'white',
                  zIndex: 9
                }}
              >
                <Flex h={'100%'} flexDir={'column'} overflow={'hidden'}>
                  <Flex
                    flex={1}
                    h={'100%'}
                    direction={'column'}
                    ml="20px"
                    mt="25px"
                    justifyContent={'space-between'}
                    overflow={'auto'}
                    pt="8px"
                  >
                    <SideBarMenu onClick={() => setIsOpen(false)} />
                  </Flex>
                  {user && (
                    <Flex
                      p="20px 16px"
                      borderTop="1px solid"
                      borderColor="border"
                      alignItems={'center'}
                      justifyContent={'space-between'}
                    >
                      <Flex gap="12px" alignItems={'center'}>
                        <Box display={user?.avatar?.url ? "block" : "none"}>
                          <Avatar w={'46px'} h={'46px'} name={`${user?.firstName} ${user?.lastName}`} src={formatFileUrlWithToken(user?.avatar?.url)} />
                        </Box>
                        <Box display={!user?.avatar?.url ? "block" : "none"}>
                          <Avatar w={'46px'} h={'46px'} name={`${user?.firstName} ${user?.lastName}`} />
                        </Box>
                        <Box>
                          <Text fontSize="18px" fontWeight="600" color="black">
                            {user?.firstName} {user?.lastName}
                          </Text>
                          <Text lineHeight={1} color="grey.700">
                            {user?.role}
                          </Text>
                        </Box>
                      </Flex>

                      <IconButton
                        aria-label="log-out"
                        w="32px"
                        h="32px"
                        minWidth="unset"
                        display="flex"
                        alignItems="center"
                        outline="none"
                        variant="unstyled"
                        icon={<Icon as={FiLogOut} w="24px" h="24px" fontSize="1.2rem" color="grey.300" />}
                        onClick={handleClickLogOut}
                        color="primary"
                      />
                    </Flex>
                  )}
                </Flex>
              </motion.div>
            )}
          </AnimatePresence>
        </Show>
        <Drawer isOpen={isOpen} placement="left" onClose={() => setIsOpen(false)}>
          <Show above="md">
            <DrawerOverlay />
            <DrawerContent bg="white">
              <DrawerCloseButton />
              <DrawerHeader>
                <NavLink to={URLS.HOME} onClick={() => setIsOpen(false)}>
                  <Image src={logoImage} cursor={'pointer'} h={'30px'} />
                </NavLink>
              </DrawerHeader>
              <DrawerBody p={0}>
                <Flex
                  flex={1}
                  h={'100%'}
                  direction={'column'}
                  justifyContent={'space-between'}
                  overflow={'auto'}
                  pt="10px"
                >
                  <SideBarMenu onClickMenu={() => setIsOpen(false)} />
                </Flex>
              </DrawerBody>
              <DrawerFooter p={0}>
                {user && (
                  <Flex
                    w="100%"
                    p="20px 16px"
                    borderTop="1px solid"
                    borderColor="border"
                    alignItems={'center'}
                    justifyContent={'space-between'}
                  >
                    <Flex gap="12px" alignItems={'center'}>
                      <Box display={user?.avatar?.url ? "block" : "none"}>
                        <Avatar w={'46px'} h={'46px'} name={`${user?.firstName} ${user?.lastName}`} src={formatFileUrlWithToken(user?.avatar?.url)} />
                      </Box>
                      <Box display={!user?.avatar?.url ? "block" : "none"}>
                        <Avatar w={'46px'} h={'46px'} name={`${user?.firstName} ${user?.lastName}`} />
                      </Box>
                      <Box>
                        <Text fontSize="18px" fontWeight="600" color="black">
                          {user?.firstName} {user?.lastName}
                        </Text>
                        <Text lineHeight={1} color="grey.700">
                          {user?.role}
                        </Text>
                      </Box>
                    </Flex>
                    <IconButton
                      aria-label="log-out"
                      w="32px"
                      h="32px"
                      minWidth="unset"
                      display="flex"
                      alignItems="center"
                      outline="none"
                      variant="unstyled"
                      icon={<Icon as={FiLogOut} w="24px" h="24px" fontSize="1.2rem" color="grey.300" />}
                      onClick={handleClickLogOut}
                      color="primary"
                    />
                  </Flex>
                )}
              </DrawerFooter>
            </DrawerContent>
          </Show>
        </Drawer>
      </Box>
    </>
  );
};

export default HeaderMobile;

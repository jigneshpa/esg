//@ts-nocheck
import { useState } from 'react';
import { CiLock } from 'react-icons/ci';
import { FiUser } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { chevronDown } from '@/assets';
import {
  Avatar,
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Icon,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  useStyleConfig,
  VStack
} from '@chakra-ui/react';

import { ROLE_TITLE, URLS, USER_ROLE } from '../../constants';
import { useAppSelector } from '../../store/hooks';
import { selectUser } from '../../store/slices/user/userSelectors';
import { useAppContext } from '@/context/AppContext';

const UserInfo = () => {
  const user = useAppSelector(selectUser);
  const TextEllipsis = useStyleConfig('TextEllipsis');
  const { isSideBarOpen }: any = useAppContext();
  const navigate = useNavigate();

  const redirectUrlPROFILE =
    (user?.role === USER_ROLE.USER && URLS.PROFILE) || (user?.role === USER_ROLE.ADMIN && URLS.ADMIN_PROFILE) ||(user?.role === USER_ROLE.USER_ADMIN && URLS.ADMIN_PROFILE) || (user?.role === USER_ROLE.MANAGER && URLS.MANAGER_PROFILE) ||'';

  const redirectUrlCHANGE_PASSWORD =
    (user?.role === USER_ROLE.USER && URLS.CHANGE_PASSWORD) ||
    (user?.role === USER_ROLE.ADMIN && URLS.ADMIN_CHANGE_PASSWORD) ||(user?.role === USER_ROLE.USER_ADMIN && URLS.ADMIN_CHANGE_PASSWORD) ||
    '';

  return (
    <>
      <Popover placement={'bottom-end'}>
        {({ isOpen, onClose }) => (
          <>
            <PopoverTrigger>
              <Button
                w="auto"
                display="flex"
                variant="unstyled"
                gap="8px"
                px="5px"
                _hover={{ bg: 'grey.200' }}
              >
                <Center w="32px" h="32px" borderRadius="50%">
                  <Box display={user?.avatar?.url ? "block" : "none"}>
                    <Avatar w={'32px'} h={'32px'} name={`${user?.firstName} ${user?.lastName}`} src={user?.avatar?.url} />
                  </Box>
                  <Box display={!user?.avatar?.url ? "block" : "none"}>
                    <Avatar w={'32px'} h={'32px'} name={`${user?.firstName} ${user?.lastName}`} />
                  </Box>
                </Center>
                {isSideBarOpen ? <VStack gap={0} flex={1} alignItems={'start'}>
                  <Box
                    sx={{
                      w: 'auto',
                      display: 'table',
                      tableLayout: 'fixed',
                      alignItems: 'flex-start'
                    }}
                  >
                    <Text
                      sx={{ ...TextEllipsis, display: 'table-cell', textAlign: 'left', fontSize: "large" }}
                      title={`${user?.firstName} ${user?.lastName}`}
                    >
                      {user?.firstName} {user?.lastName}
                    </Text>
                  </Box>
                  <HStack w={'100%'}>
                    <Text color={'greyBlue'} fontSize={'medium'} fontWeight={400} sx={TextEllipsis}>
                      {ROLE_TITLE[user?.role]}
                    </Text>
                    <Image src={chevronDown} cursor={'pointer'} />
                  </HStack>
                </VStack> : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent w={'auto'} bg={'white'}>
              <PopoverArrow />
              <PopoverBody h={'100%'} p={0}>
                <VStack gap={0} fontSize={'medium'} fontWeight={500} align={'start'} h="auto" m="10px 0">
                  <Box
                    onClick={() => {
                      onClose();
                      setTimeout(() => navigate(redirectUrlPROFILE, { replace: true }), 500);
                    }}
                    _hover={{ bg: 'grey.200' }}
                    w={'100%'}
                    flex={1}
                    gap="5px"
                    lineHeight={'35px'}
                    alignItems="center"
                    display="flex"
                    cursor={"pointer"}
                    p="0 10px"
                  >
                    <Icon flexBasis={'medium'} as={FiUser} />
                    My Profile
                  </Box>
                  {/* <Box
                    onClick={() => {
                      onClose();
                      setTimeout(() => navigate(redirectUrlCHANGE_PASSWORD, { replace: true }), 500);
                    }}
                    _hover={{ bg: 'grey.200' }}
                    w={'100%'}
                    flex={1}
                    gap="5px"
                    lineHeight={'35px'}
                    alignItems="center"
                    display="flex"
                    cursor={"pointer"}
                    p="0 10px"
                  >
                    <Icon flexBasis={'medium'} as={CiLock} />
                    Change Password
                  </Box> */}
                </VStack>
              </PopoverBody>
            </PopoverContent>
          </>
        )}
      </Popover>
    </>
  );
};

export default UserInfo;

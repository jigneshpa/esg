import { Avatar, VStack, HStack, Popover, PopoverTrigger, Text, PopoverContent, PopoverArrow, PopoverBody, Box, Icon } from "@chakra-ui/react";
import { FiChevronDown, FiUser, FiLogOut } from "react-icons/fi";
import { ROLE_TITLE, URLS, USER_ROLE } from "@/constants";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/user/userSelectors";
import { useNavigate } from "react-router-dom";
import { useLogout } from "@/hooks/useLogout";

const UserInfoV2 = () => {
    const user = useAppSelector(selectUser);
    const navigate = useNavigate();
    const handleLogout = useLogout();


  const redirectUrlPROFILE =
  (user?.role === USER_ROLE.USER && URLS.PROFILE) ||
  ((user?.role === USER_ROLE.ADMIN || user?.role === USER_ROLE.USER_ADMIN) &&
    URLS.ADMIN_PROFILE) ||
  ((user?.role === USER_ROLE.MANAGER ||
    user?.role === USER_ROLE.MANAGERL2) &&
    URLS.MANAGER_PROFILE) ||
  '';

    return (
        <Popover placement="bottom-end">
          {({ onClose }) => (
            <>
              <PopoverTrigger>
                <HStack spacing={4} as="button">
                  <Avatar
                    size="md"
                    name={`${user?.firstName} ${user?.lastName}`}
                    src={user?.avatar || undefined}
                    bg="#E6FFFA"
                    color="#319795"
                  />
                  <VStack align="flex-start" spacing={0}>
                    <Text fontWeight="medium" fontSize="md">
                      {`${user?.firstName} ${user?.lastName}`}
                    </Text>
                    <Text
                      fontSize="xs"
                      color="gray.500"
                      textTransform="uppercase"
                    >
                      {user?.role &&
                        ROLE_TITLE[user.role as keyof typeof ROLE_TITLE]}
                    </Text>
                  </VStack>
                  <Icon as={FiChevronDown} color="gray.600" />
                </HStack>
              </PopoverTrigger>
              <PopoverContent w={'auto'} bg={'white'}>
                <PopoverArrow />
                <PopoverBody h={'100%'} p={0}>
                  <VStack
                    gap={0}
                    fontSize={'medium'}
                    fontWeight={500}
                    align={'start'}
                    h="auto"
                    m="10px 0"
                  >
                    <Box
                      onClick={() => {
                        onClose();
                        setTimeout(
                          () =>
                            navigate(redirectUrlPROFILE, { replace: true }),
                          500,
                        );
                      }}
                      _hover={{ bg: 'grey.200' }}
                      w={'100%'}
                      flex={1}
                      gap="5px"
                      lineHeight={'35px'}
                      alignItems="center"
                      display="flex"
                      cursor={'pointer'}
                      p="0 10px"
                    >
                      <Icon flexBasis={'medium'} as={FiUser} />
                      My Profile
                    </Box>
                    <Box
                      onClick={() => {
                        onClose();
                        handleLogout();
                      }}
                      _hover={{ bg: 'grey.200' }}
                      w={'100%'}
                      flex={1}
                      gap="5px"
                      lineHeight={'35px'}
                      alignItems="center"
                      display="flex"
                      cursor={'pointer'}
                      p="0 10px"
                    >
                      <Icon flexBasis={'medium'} as={FiLogOut} />
                      Log out
                    </Box>
                  </VStack>
                </PopoverBody>
              </PopoverContent>
            </>
          )}
        </Popover>
    )
}

export default UserInfoV2;

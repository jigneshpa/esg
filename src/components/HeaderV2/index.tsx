import { useEffect, useState } from 'react';
import {
    Box,
    Divider,
    Flex,
    HStack,
    Icon,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Text
} from '@chakra-ui/react';
import { FiBell } from 'react-icons/fi';

import { useInAppNotificationContext } from '@/context/InAppNotificationContext';
import { useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/user/userSelectors';
import InAppNotificationPopup from '../InAppNotificationPopup';
import UserInfoV2 from './UserInfoV2';

interface InAppNotificationContextType {
  notificationsUnread: number;
  refreshNotificationList: () => void;
  getTotalNotificationUnread: () => void;
  isLoading: boolean;
  allNotifications: any[];
  getMoreNotifications: () => void;
  onRead: (item: any) => Promise<boolean>;
  setAllNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  setNotificationsUnread: React.Dispatch<React.SetStateAction<number>>;
  setParams: React.Dispatch<React.SetStateAction<{}>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const HeaderV2 = () => {
  const user = useAppSelector(selectUser);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const {
    notificationsUnread,
    refreshNotificationList,
    getTotalNotificationUnread,
  } = useInAppNotificationContext() as InAppNotificationContextType;

  useEffect(() => {
    if (user?.id) {
      refreshNotificationList();
      getTotalNotificationUnread();
    }
  }, [user?.id]);

  return (
    <Flex
      as="header"
      align="center"
      justify="flex-end"
      w="100%"
      h="80px"
      px={6}
      bg="white"
      borderBottomWidth="1px"
      borderColor="gray.200"
    >
      <HStack spacing={5} align="center">
        <Popover
          placement={'bottom'}
          isOpen={notificationOpen}
          onClose={() => setNotificationOpen(false)}
          onOpen={() => setNotificationOpen(true)}
        >
          <PopoverTrigger>
            <Box position="relative" as="button" p={2}>
              <Icon as={FiBell} w={5} h={5} color="gray.600" />
              {!!notificationsUnread && (
                <Text
                  position={'absolute'}
                  top={'2px'}
                  right={'2px'}
                  minW={'18px'}
                  p={'0 3px'}
                  h={'18px'}
                  lineHeight={'18px'}
                  bg={'red.500'}
                  fontSize={'10px'}
                  color={'white'}
                  borderRadius={'full'}
                  border={'1.5px solid white'}
                >
                  {notificationsUnread}
                </Text>
              )}
            </Box>
          </PopoverTrigger>
          <PopoverContent bg={'white'} w={'400px'}>
            <PopoverArrow />
            <PopoverBody p={0} h={'80vh'} maxH={'600px'}>
              <InAppNotificationPopup
                onClose={() => setNotificationOpen(false)}
              />
            </PopoverBody>
          </PopoverContent>
        </Popover>
        <Divider orientation="vertical" h="32px" />
        <UserInfoV2 />
      </HStack>
    </Flex>
  );
};

export default HeaderV2; 
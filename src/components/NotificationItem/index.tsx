//@ts-nocheck
import { BsCircleFill } from 'react-icons/bs';
import { Flex, Icon, Text, VStack } from '@chakra-ui/react';
import moment from 'moment';

import { useInAppNotificationContext } from '@/context/InAppNotificationContext';
import { useNavigate } from 'react-router-dom';

const NotificationItem = ({ item, onClosePopup, ...rest }: any) => {
    const navigate = useNavigate();
  /*@ts-ignore*/
  const { allNotifications, setAllNotifications, setNotificationsUnread, onRead } = useInAppNotificationContext();

  const handleMarkAsRead = async (e: any) => {
    e?.stopPropagation();
    if (item.unread) {
      item.unread = 0;
      await onRead(item);
      setNotificationsUnread(prev => prev - 1);
      setAllNotifications([...allNotifications]);
    }
  };

  const handleClickNotification = () => {
    if (item?.data?.path) {
      navigate(item?.data?.path);
    }
    onClosePopup?.();
    /*@ts-ignore*/
    handleMarkAsRead();
  };

  const convertFirstLatterUpperCase = (text) => {
    if (text)
      return text.charAt(0).toUpperCase() + text.slice(1);
    return ""
  };

  return (
    <Flex
      w={'100%'}
      position={'relative'}
      gap={'10px'}
      bg={'white'}
      _hover={{ bg: 'grey.100' }}
      p={'14px 20px 0'}
      cursor={'pointer'}
      onClick={handleClickNotification}
      {...rest}
    >
      <Icon
        mt={'8px'}
        as={BsCircleFill}
        w={'16px'}
        h={'16px'}
        color={item.unread ? 'primary' : 'grey.500'}
        onClick={handleMarkAsRead}
      />
      <VStack flex={1} align={'start'}>
        <Text
          fontSize={'16px'}
          fontWeight={500}
          _hover={{ textDecoration: 'underline', textDecorationColor: 'grey.500' }}
        >
          {convertFirstLatterUpperCase(item.body)}
        </Text>
        <Text fontSize={'14px'} color={'#555770'}>
          {moment(new Date(item.updatedAt || item.createdAt))?.format('DD/MM/YYYY') || '---'}
        </Text>
      </VStack>
    </Flex>
  );
};

export default NotificationItem;

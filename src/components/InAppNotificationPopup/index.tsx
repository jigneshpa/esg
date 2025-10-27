import { useMemo } from 'react';
import { AiOutlineCaretRight } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { Button, Center, Icon, Spinner, Text, VStack } from '@chakra-ui/react';

import { URLS } from '@/constants';
import { useInAppNotificationContext } from '@/context/InAppNotificationContext';

import NotificationItem from '../NotificationItem';

const InAppNotificationPopup = ({ onClose }: any) => {
  /*@ts-ignore*/
  const { isLoading, allNotifications } = useInAppNotificationContext();
  const navigate = useNavigate();

  const dataShow = useMemo(() => {
    const original = [...allNotifications];
    return original?.splice(0, 5) || [];
  }, [allNotifications]);

  return (
    <VStack
      h={'100%'}
      gap={'12px'}
      borderRadius={'16px'}
      align={'start'}
      p={'12px 0 0'}
      boxShadow={'0px 20px 24px -4px #2D36430A'}
    >
      <Text fontWeight={600} fontSize={'14px'} color={'grey.500'} p={'0 20px 0'}>
        NOTIFICATION
      </Text>
      {isLoading && (
        <Center w={'100%'} flex={1}>
          <Spinner />
        </Center>
      )}
      {!isLoading && !dataShow?.length && (
        <Center w={'100%'} flex={1}>
          <Text color={'grey.500'}>(No data)</Text>
        </Center>
      )}
      {!isLoading && !!dataShow.length && (
        <VStack w={'100%'} flex={1} overflow={'auto'} className="custom-scroll-bar">
          {dataShow.map(item => (
            <NotificationItem key={`${item.createdAt}-${item.id}`} item={item} onClosePopup={onClose} />
          ))}
        </VStack>
      )}
      {!!dataShow.length && (
        <Center w={'100%'}>
          <Button
            w={'100%'}
            display={'flex'}
            alignItems={'center'}
            variant={'unstyled'}
            fontSize={'14px'}
            color={'grey.700'}
            fontWeight={600}
            bg={'grey.100'}
            _hover={{ textDecoration: 'underline' }}
            rightIcon={<Icon as={AiOutlineCaretRight} color={'grey.700'} />}
            onClick={() => navigate(URLS.NOTIFICATION)}
          >
            View all
          </Button>
        </Center>
      )}
    </VStack>
  );
};

export default InAppNotificationPopup;

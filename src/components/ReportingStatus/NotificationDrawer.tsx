import { useEffect, useState } from 'react';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay
} from '@chakra-ui/react';

import SendNotification from '@/components/SendNotification';
import { MESSAGE, STATUS } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import { notificationApi } from '@/store/api/notification/notificationApi';
import { BellIcon } from '@chakra-ui/icons';

interface NotificationDrawerProps {
  companyName: string;
  assignedTo: string;
  userQuestionnaireId: number;
}

const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ companyName, assignedTo, userQuestionnaireId }) => {
  const { confirm, notify } = useAppContext();
  const [sendNotificationFormOpen, setSendNotificationFormOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [postRemindUserMessage, { isSuccess, isError }] = notificationApi.usePostRemindUserMessageMutation();

  useEffect(() => {
    if (isSuccess) {
      notify({
        type: STATUS.SUCCESS,
        message: MESSAGE.SEND_NOTIFICATION_SUCCESS
      });
    } else if (isError) {
      notify({
        type: STATUS.ERROR,
        message: MESSAGE.SEND_NOTIFICATION_FAIL
      });
    }
  }, [isSuccess, isError, notify]);

  const handleSendNotification = async (value: any) => {
    setFormSubmitting(true);
    try {
      const result = {
        userIds: [assignedTo], // Assuming assignedTo is the user ID
        content: `Submission for ${companyName} - ${value.content}`,
        remind: true,
        frequency: value?.frequency,
        recurring: value?.recurring,
        delay: value?.delay,
        date: value?.date,
        module: 'reporting',
        userQuestionnaireId: userQuestionnaireId
      };
      await postRemindUserMessage(result);
    } catch (error) {
      console.log('Error:: ', error);
    } finally {
      setFormSubmitting(false);
      setSendNotificationFormOpen(false);
    }
  };

  const confirmSendNotification = (value: any) => {
    confirm({
      message: 'Are you sure you want to send this notification to that users?',
      title: 'Send Notification',
      onOk: () => handleSendNotification(value)
    });
  };

  return (
    <>
      <Button
        variant="outline"
        bg="transparent"
        border="none"
        w="100%"
        type="submit"
        loadingText={'Submitting'}
        onClick={() => setSendNotificationFormOpen(true)}
      >
        <BellIcon color="yellow.500" cursor="pointer" mr={2} fontSize={20} /> Notify
      </Button>
      {sendNotificationFormOpen && (
        <Drawer
          isOpen={sendNotificationFormOpen}
          placement="right"
          size="md"
          onClose={() => setSendNotificationFormOpen(false)}
        >
          <DrawerOverlay />
          <DrawerContent bg={'white'}>
            <DrawerHeader
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              borderBottomWidth="1px"
              fontSize="18px"
              fontWeight={600}
            >
              Send Notification
              <DrawerCloseButton position={'static'} />
            </DrawerHeader>
            <DrawerBody p="24px">
              <SendNotification
                asset={{ companyName, assignedTo }}
                submitting={formSubmitting}
                onSubmit={confirmSendNotification}
              />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};

export default NotificationDrawer;

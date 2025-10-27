import { useEffect, useState } from 'react';
import { FiBell } from 'react-icons/fi';
import { MdDeleteOutline } from 'react-icons/md';
import { PiEyeLight } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import { Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, DrawerOverlay } from '@chakra-ui/react';

import SendNotification from '@/components/SendNotification';
import { MESSAGE, STATUS, USER_ROLE } from '@/constants';
import { useAppContext } from '@/context/AppContext';
import useDeleteSubmissions from '@/hooks/useDeleteSubmissions';
import { notificationApi } from '@/store/api/notification/notificationApi';
import { useAppSelector } from '@/store/hooks';
import { selectUserRole } from '@/store/slices/user/userSelectors';

import ActionButton from '../../../components/common/ActionButton';
import ActionPopover from '../../../components/common/ActionPopover';

const ActionModalButton = ({ data }: any) => {
  const { confirm, notify } = useAppContext();
  const navigate = useNavigate();
  const [sendNotificationFormOpen, setSendNotificationFormOpen] = useState(false);
  const { handleDelete } = useDeleteSubmissions();
  const userRole = useAppSelector(selectUserRole);
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
    console.log('value', value, 'value');
    setFormSubmitting(true);
    try {
      const result = {
        userIds: [data?.submittedBy?.id],
        userQuestionnaireId: data?.userQuestionnaireId,
        content: `Submission for ${data?.company?.name} - ${value.content}`,
        remind: true,
        frequency: value?.frequency,
        recurring: value?.recurring,
        delay: value?.delay,
        date: value?.date,
        module: 'reporting'
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
    console.log(value, 'x');
    confirm({
      message: 'Are you sure you want to send this notification to that users?',
      title: 'Send Notification',
      onOk: () => handleSendNotification(value)
    });
  };

  const onReview = () => {
    if (data?.userQuestionnaireId) {
      let url = `/${userRole === USER_ROLE.USER_ADMIN ? 'admin' : userRole}/survey-list/:userQuestionnaireId`;

      url = url.replace(':userQuestionnaireId', data.userQuestionnaireId);

      const params = new URLSearchParams();

      if (data?.companyId || data?.company?.id) {
        params.set('companyId', data?.companyId || data?.company?.id);
      }
      if (data?.id) {
        params.set('submissionId', data.id);
      }

      if (data?.status === 'Approved') {
        params.set('status', 'Approved');
      }

      if (data?.status === 'Rejected') {
        params.set('status', 'Rejected');
      }

      const queryString = params.toString();
      url = queryString ? `${url}?${queryString}` : url;

      navigate(url);
    }
  };

  return (
    <>
      <ActionPopover>
        <ActionButton leftIcon={<PiEyeLight />} onClick={onReview}>
          Review
        </ActionButton>
        <ActionButton leftIcon={<FiBell />} onClick={() => setSendNotificationFormOpen(true)}>
          Notify
        </ActionButton>
        <ActionButton
          color="red"
          withBorder={false}
          leftIcon={<MdDeleteOutline />}
          onClick={() => handleDelete(data.id, data.userQuestionnaireId)}
        >
          Delete
        </ActionButton>
      </ActionPopover>
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
              <SendNotification asset={data} submitting={formSubmitting} onSubmit={confirmSendNotification} />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};

export default ActionModalButton;

//@ts-nocheck
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import moment from 'moment';

import API from '@/api';
import { LAST_LOGIN_NOTIFICATION } from '@/constants';

import { getFirebaseToken, onMessageListener } from '../../firebase';
import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/slices/user/userSelectors';

export const InAppNotificationContext = createContext();

const InAppNotificationProvider = ({ children }) => {
  const user = useAppSelector(selectUser);
  const [notificationToken, setNotificationToken] = useState(null);
  const [allNotifications, setAllNotifications] = useState([]);
  const [notificationsUnread, setNotificationsUnread] = useState(0);
  const [params, setParams] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  onMessageListener()
    .then(() => {
      // Refresh the quantity of unread notifications to inform users when there is a new notification:
      getTotalNotificationUnread();
    })
    .catch(err => console.log('failed: ', err));

  const getMoreNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await API.getNotifications(params);
      const newList = [...allNotifications, ...res.items];
      const lastLoginNoti = newList.find(item => item.body === LAST_LOGIN_NOTIFICATION);
      if (lastLoginNoti) {
        const lastLoginTimeUTC = lastLoginNoti.updatedAt ? lastLoginNoti.updatedAt : lastLoginNoti.createdAt;
        lastLoginNoti.body = `${LAST_LOGIN_NOTIFICATION} ${moment(lastLoginTimeUTC).format('H:mm:ss DD/MM/YYYY  ')}`;
      }
      setAllNotifications(newList);
    } catch (error) {
      console.log('Error:: ', error);
      setAllNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshNotificationList = () => {
    setAllNotifications([]);
    setParams({ ...params, page: 1 });
  };

  useEffect(() => {
    const getToken = getFirebaseToken(setNotificationToken);
  }, []);

  useEffect(() => {
    if (user?.token && notificationToken) {
      sendDeviceToken({
        device_token: notificationToken
      });
    }
    if (user?.token) {
      getTotalNotificationUnread();
    } else {
      setAllNotifications([]);
      setNotificationsUnread(0);
    }
  }, [user, notificationToken]);

  useEffect(() => {
    if (user?.id) {
      getMoreNotifications();
    }
  }, [params, user]);

  // In-app notification token:
  const sendDeviceToken = async data => {
    try {
      await API.sendDeviceToken(data);
    } catch (error) {
      console.log('Error:: ', error);
    }
  };

  const getTotalNotificationUnread = async () => {
    try {
      const res = await API.getTotalNotificationUnread();
      setNotificationsUnread(res);
    } catch (error) {
      console.log('Error:: ', error);
      setNotificationsUnread(null);
    }
  };

  const onRead = async item => {
    try {
      await API.getNotificationDetail(item.id);
      return true;
    } catch (error) {
      console.log('Error:: ', error);

      return false;
    }
  };

  const contextValue = useMemo(
    () => ({
      isLoading,
      setIsLoading,
      setParams,
      allNotifications,
      setAllNotifications,
      getMoreNotifications,
      notificationsUnread,
      setNotificationsUnread,
      onRead,
      refreshNotificationList,
      getTotalNotificationUnread
    }),
    [
      isLoading,
      setIsLoading,
      setParams,
      allNotifications,
      setAllNotifications,
      getMoreNotifications,
      notificationsUnread,
      setNotificationsUnread,
      onRead,
      refreshNotificationList,
      getTotalNotificationUnread
    ]
  );

  return <InAppNotificationContext.Provider value={contextValue}>{children}</InAppNotificationContext.Provider>;
};

export const useInAppNotificationContext = () => {
  return useContext(InAppNotificationContext);
};

export default InAppNotificationProvider;

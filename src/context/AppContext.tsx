import { createContext, ReactNode, useContext, useMemo, useState } from 'react';

import Confirm, { ConfirmProps } from '@/components/Confirm';
import Notification, { NotificationProps } from '@/components/Notification';

import { IS_SIDEBAR_OPEN } from '../constants';

interface AppContextType {
  sideBarOpen: boolean;
  setSideBarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSideBarOpen: boolean;
  setIsSideBarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  sideMenuOpenAndClose: () => void;
  notify: (data: NotificationData) => void;
  confirm: (data: ConfirmData) => void;
}

interface ConfirmData extends Partial<Omit<ConfirmProps, 'onClose' | 'onOk'>> {
  isOpen?: boolean;
  onClose?: () => void | Promise<void> | null;
  onOk?: () => void | Promise<void> | null;
  onCancel?: () => void | Promise<void> | null; // Add optional onCancel
  isLoading?: boolean; // Add isLoading
}

interface NotificationData extends Partial<Omit<NotificationProps, 'onClose'>> {
  isOpen?: boolean;
  onClose?: () => void;
}

const defaultContextValue: AppContextType = {
  sideBarOpen: false,
  setSideBarOpen: () => {},
  isSideBarOpen: false,
  setIsSideBarOpen: () => {},
  sideMenuOpenAndClose: () => {},
  notify: () => {},
  confirm: () => {}
};

export const AppContext = createContext<AppContextType>(defaultContextValue);

const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sideBarOpen, setSideBarOpen] = useState<boolean>(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState<boolean>(localStorage.getItem(IS_SIDEBAR_OPEN) === 'true');

  const [notificationData, setNotificationData] = useState<NotificationData>({
    isOpen: false,
    onClose: () => null
  });

  const [confirmData, setConfirmData] = useState<ConfirmData>({
    isOpen: false,
    onClose: () => null,
    onOk: () => null
  });

  const notify = (data: NotificationData) => {
    setNotificationData({
      ...data,
      isOpen: true,
      onClose: () => {
        data.onClose?.();
        setNotificationData({ isOpen: false, onClose: () => null });
      }
    });
  };

  const confirm = (data: ConfirmData) => {
    setConfirmData({
      ...data,
      isOpen: true,
      onClose: async () => {
        if (data.onClose) {
          await data.onClose();
        }
        setConfirmData({ isOpen: false, onClose: () => null, onOk: () => null });
      },
      onOk: async () => {
        if (data.onOk) {
          await data.onOk();
        }
        setConfirmData({ isOpen: false, onClose: () => null, onOk: () => null });
      },
      onCancel: async () => {
        if (data.onCancel) {
          await data.onCancel(); // Call onCancel if provided
        }
        setConfirmData({ isOpen: false, onClose: () => null, onOk: () => null });
      },
    });
  };

  const sideMenuOpenAndClose = () => {
    setIsSideBarOpen(!isSideBarOpen);
    localStorage.setItem(IS_SIDEBAR_OPEN, String(!isSideBarOpen));
  };

  const contextValue = useMemo<AppContextType>(
    () => ({
      sideBarOpen,
      setSideBarOpen,
      isSideBarOpen,
      setIsSideBarOpen,
      sideMenuOpenAndClose,
      notify,
      confirm
    }),
    [sideBarOpen, isSideBarOpen]
  );

  return (
    <AppContext.Provider value={contextValue}>
      {confirmData.isOpen && <Confirm {...(confirmData as ConfirmProps)} />}
      {notificationData.isOpen && <Notification {...(notificationData as NotificationProps)} />}
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};

export default AppProvider;

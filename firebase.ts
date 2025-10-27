// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';

import { getNotificationKey, setNotificationKey } from '@/utils';

import firebaseConfig from './firebase.config.json';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);
const vapidKey = firebaseConfig.vapidKey;

export const getFirebaseToken = async (setNotificationToken: any) => {
  const isBrowserSupported = await isSupported();
  const localNotificationKey = getNotificationKey();

  if (localNotificationKey) {
    setNotificationToken(localNotificationKey);
  } else if (isBrowserSupported) {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted' && messaging) {
        return getToken(messaging, {
          vapidKey
        })
          .then(currentToken => {
            if (currentToken) {
              setNotificationToken(currentToken);
              setNotificationKey(currentToken);
              // Track the token -> client mapping, by sending to backend server
              // show on the UI that permission is secured
            } else {
              console.log('No registration token available. Request permission to generate one.');
              setNotificationToken(null);
              // shows on the UI that permission is required
            }
          })
          .catch(err => {
            console.log('An error occurred while retrieving token. ', err);
            // catch error while creating client token
          });
      } else return null;
    });
  }
};

export const onMessageListener = () =>
  new Promise(resolve => {
    onMessage(messaging, payload => {
      resolve(payload);
    });
  });

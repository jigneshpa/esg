/* eslint-disable no-undef */
// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

fetch('../firebase.config.json')
  .then(res => res.json())
  .then(firebaseConfig => {
    // Retrieve firebase messaging
    if (firebaseConfig) {
      firebase.initializeApp(firebaseConfig);
      const messaging = firebase.messaging();

      messaging.onBackgroundMessage(function (payload) {
        const notificationTitle = payload.notification.title;
        const notificationOptions = {
          body: payload.notification.body
        };
        self.registration.showNotification(notificationTitle, notificationOptions);
        console.log('notification on background: ', payload);
      });
    }
  });

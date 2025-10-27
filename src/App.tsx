import React from 'react';
import { Provider } from 'react-redux';
import { ChakraProvider } from '@chakra-ui/react';
import { PersistGate } from 'redux-persist/integration/react';

import AppProvider from '@/context/AppContext';
import { RouterProvider } from '@/providers';
import { persistor, store } from '@/store';
import { theme } from '@/styles/theme';
import { debugAuthState, debugPersistState, testLocalStorage } from '@/utils';

import InAppNotificationProvider from './context/InAppNotificationContext';

const App = () => {
  console.log('App: Component rendering');

  // Test localStorage on app start
  React.useEffect(() => {
    console.log('=== APP STARTUP DEBUG ===');
    testLocalStorage();
    debugPersistState();
    debugAuthState();

    // Manual test: Check if we can write and read from localStorage
    const testKey = 'app_test_' + Date.now();
    const testValue = { test: true, timestamp: Date.now() };
    try {
      localStorage.setItem(testKey, JSON.stringify(testValue));
      const retrieved = JSON.parse(localStorage.getItem(testKey) || '{}');
      console.log('Manual localStorage test:', {
        success: JSON.stringify(retrieved) === JSON.stringify(testValue),
        retrieved
      });
      localStorage.removeItem(testKey);
    } catch (error) {
      console.error('Manual localStorage test failed:', error);
    }

    console.log('=== END APP STARTUP DEBUG ===');
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <Provider store={store}>
        <PersistGate
          persistor={persistor}
          onBeforeLift={() => {
            console.log('=== PERSIST BEFORE LIFT ===');
            console.log('App: PersistGate onBeforeLift - about to restore state');
            debugAuthState();
            console.log('=== END PERSIST BEFORE LIFT ===');
          }}
        >
          {(bootstrapped) => {
            if (!bootstrapped) {
              return (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    fontSize: '16px'
                  }}
                >
                  Loading persisted state...
                </div>
              );
            }

            console.log('=== PERSIST AFTER LIFT ===');
            console.log('App: PersistGate lifted - state restored');
            debugAuthState();

            const state = store.getState();
            console.log('Store state after rehydration:', {
              user: state.user,
              hasUserRole: !!state.user?.role,
              hasUserId: !!state.user?.id
            });

            console.log('=== END PERSIST AFTER LIFT ===');
            return (
              <AppProvider>
                <InAppNotificationProvider>
                  <RouterProvider />
                </InAppNotificationProvider>
              </AppProvider>
            );
          }}
        </PersistGate>
      </Provider>
    </ChakraProvider>
  );
};

export default App;

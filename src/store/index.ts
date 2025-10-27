import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { privateApiSlice, privateCachedApiSlice, publicApiSlice } from './api/api';
import companyAccessReducer from './slices/companyAccess/companyAccessSlice';
import countryReducer from './slices/country/countrySlice';
import exportFileReducer from './slices/export/exportFileSlice';
import refreshReducer from './slices/refresh/refreshSlice';
import userSlice from './slices/user/userSlice';

const countriesPersistConfig = {
  key: 'countries',
  storage: storage
};

const userPersistConfig = {
  key: 'user',
  storage: storage,
  whitelist: [
    'id',
    'userName',
    'email',
    'roleId',
    'department',
    'status',
    'firstName',
    'lastName',
    'isVerified',
    'role',
    'country',
    'fullName',
    'companyId'
  ],
  debug: true, // Enable debug logging
  serialize: true,
  deserialize: true,
  timeout: 10000 // 10 second timeout
};

const privateCachedApiPersistConfig = {
  key: 'privateCachedApi',
  storage: storage,
  whitelist: ['queries']
};

const rootReducer = combineReducers({
  user: persistReducer(userPersistConfig, userSlice),
  refresh: refreshReducer,
  exportFile: exportFileReducer,
  country: persistReducer(countriesPersistConfig, countryReducer),
  companyAccess: companyAccessReducer,
  [privateApiSlice.reducerPath]: privateApiSlice.reducer,
  [publicApiSlice.reducerPath]: publicApiSlice.reducer,
  [privateCachedApiSlice.reducerPath]: persistReducer(privateCachedApiPersistConfig, privateCachedApiSlice.reducer)
});

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER',
          'persist/FLUSH',
          'persist/PAUSE',
          'persist/PURGE'
        ]
      }
    }).concat(privateApiSlice.middleware, publicApiSlice.middleware, privateCachedApiSlice.middleware)
});

const persistor = persistStore(store, null, () => {
  console.log('Redux persist rehydration completed');
});

// Debug: Log when store is created
console.log('Store created with persist config');

export { store, persistor };
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import propertiesReducer from './propertiesSlice';
import bookingsReducer from './bookingsSlice';
import chatbotReducer from './chatbotSlice';
import notificationsReducer from './notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertiesReducer,
    bookings: bookingsReducer,
    chatbot: chatbotReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export default store;

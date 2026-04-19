import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import propertiesReducer from './propertiesSlice';
import bookingsReducer from './bookingsSlice';
import chatbotReducer from './chatbotSlice';
import notificationsReducer from './notificationsSlice';
import themeReducer from './themeSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertiesReducer,
    bookings: bookingsReducer,
    chatbot: chatbotReducer,
    notifications: notificationsReducer,
    theme: themeReducer,
  },
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;

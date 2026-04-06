import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import servicesReducer from '../features/services/servicesSlice';
import reservationsReducer from '../features/reservations/reservationsSlice';
import chatbotReducer from '../features/chatbot/chatbotSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    services: servicesReducer,
    reservations: reservationsReducer,
    chatbot: chatbotReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export default store;

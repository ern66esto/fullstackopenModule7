import { configureStore } from '@reduxjs/toolkit';
import notificationReducer from './features/notification/notificationSlice';

export const store = configureStore({
  reducer: {
    notification: notificationReducer,
  },
});

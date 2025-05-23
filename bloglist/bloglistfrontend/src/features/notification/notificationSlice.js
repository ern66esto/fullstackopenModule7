import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    message: '',
    styleClassName: '',
  },
  reducers: {
    setNotification: (state, action) => {
      state.message = action.payload.message;
      state.styleClassName = action.payload.styleClassName;
    },
    clearNotification: (state) => {
      state.message = '';
      state.styleClassName = '';
    },
  },
});

export const { setNotification, clearNotification } = notificationSlice.actions;
export default notificationSlice.reducer;

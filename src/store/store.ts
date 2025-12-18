import { configureStore } from '@reduxjs/toolkit';
import loadingReducer from './loaderSlice';

export const store = configureStore({
  reducer: {
    loader: loadingReducer,
  },
  devTools: true,
})


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
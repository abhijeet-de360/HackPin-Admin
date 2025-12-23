import { configureStore } from '@reduxjs/toolkit';
import loadingReducer from './loaderSlice';
import authReducer from "./authSlice"
import categoryReducer from "./categorySlice"
import subCategoryReducer from "./subCategorySlice";
import userReducer from "./userSlice";

export const store = configureStore({
  reducer: {
    loader: loadingReducer,
    auth: authReducer,
    category: categoryReducer,
    subCategory: subCategoryReducer,
    user: userReducer,




  },
  devTools: true,
})


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
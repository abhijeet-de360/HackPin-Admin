import { configureStore } from '@reduxjs/toolkit';
import loadingReducer from './loaderSlice';
import authReducer from "./authSlice"
import categoryReducer from "./categorySlice"
import subCategoryReducer from "./subCategorySlice"

export const store = configureStore({
  reducer: {
    loader: loadingReducer,
    auth: authReducer,
    category: categoryReducer,
    subCategory: subCategoryReducer,




  },
  devTools: true,
})


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
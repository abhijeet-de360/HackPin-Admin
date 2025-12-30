import { configureStore } from '@reduxjs/toolkit';
import loadingReducer from './loaderSlice';
import authReducer from "./authSlice"
import categoryReducer from "./categorySlice"
import subCategoryReducer from "./subCategorySlice";
import userReducer from "./userSlice";
import postReducer from "./postSlice";
import reelReducer from './reelSlice';
import videoReducer from './videoSlice';

export const store = configureStore({
  reducer: {
    loader: loadingReducer,
    auth: authReducer,
    category: categoryReducer,
    subCategory: subCategoryReducer,
    user: userReducer,
    post: postReducer,
    reel: reelReducer,
    video: videoReducer,


  },
  devTools: false,
})


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
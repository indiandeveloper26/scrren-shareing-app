import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import screenReducer from "./slices/screenSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    screen: screenReducer,
  },
});

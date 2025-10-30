import { configureStore } from "@reduxjs/toolkit";

import userReducer from "./user/userSlice";
export const store = configureStore({
  reducer: {user:userReducer},
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({   //prevent errors in the browser
      serializableCheck: false,
    }),
});

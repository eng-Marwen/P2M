import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import userReducer from "./user/userSlice";
import { persistStore } from "redux-persist";

const rootReducer = combineReducers({
  user: userReducer,
});

const persistConfig = {
  key: "root",
  storage: storage,
  version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer); // Add persistence logic here if needed

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      //prevent errors in the browser
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import userReducer from "./user/userSlice";

// 1. Combine all reducers
const rootReducer = combineReducers({
  user: userReducer,
});

// 2. Redux persist configuration
const persistConfig = {
  key: "root",
  storage: storage,
  version: 1,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// 3. Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Disable for redux-persist
    }),
});

export const persistor = persistStore(store);

// 4. IMPORTANT: Export types for use in components
// RootState: describes the entire Redux state tree
export type RootState = ReturnType<typeof store.getState>;

// AppDispatch: describes the dispatch function type
export type AppDispatch = typeof store.dispatch;

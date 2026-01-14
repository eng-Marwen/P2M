import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 1. Define the User interface - describes what a user object looks like
interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  address?: string;
  phone?: string;
  isVerified: boolean;
  lastLogin?: Date;
  createdAt?: Date;
}

// 2. Define the UserState interface - describes the slice's state shape
interface UserState {
  currentUser: User | null;
  load: boolean;
  error: string | null;
}

// 3. Initial state with explicit type
const initialState: UserState = {
  currentUser: null,
  load: false,
  error: null,
};

// 4. Create slice with typed reducers
export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // PayloadAction<User> means the action.payload is of type User
    signInSuccess: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.load = false;
      state.error = null;
    },
    // PayloadAction<string> means the action.payload is a string (error message)
    signInFailure: (state, action: PayloadAction<string>) => {
      state.currentUser = null;
      state.error = action.payload;
      state.load = false;
    },
    // No payload needed for signOut
    signOut: (state) => {
      state.currentUser = null;
      state.load = false;
      state.error = null;
    },
  },
});

export const { signInSuccess, signInFailure, signOut } = userSlice.actions;

export default userSlice.reducer;

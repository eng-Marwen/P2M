import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    currentUser: null,
    load: false,
    error: null,
};

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        signInSuccess: (state, action) => {
            state.currentUser = action.payload;
            state.load = false;
            state.error = null;
        },
        signInFailure: (state, action) => {
            state.error = action.payload;
            state.load = false;
        },
        signOut: (state) => { 
            state.currentUser = null;
            state.load = false;
            state.error = null;
        }
        
    },
});

export const { signInSuccess, signInFailure, signOut } = userSlice.actions;

export default userSlice.reducer;
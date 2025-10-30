import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  FormData: null,
  load: false,
};

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setFormData: (state, action) => {
            state.FormData = action.payload;
        },
        setLoad: (state, action) => {
            state.load = action.payload;
        },
    },
});

export const { setFormData, setLoad } = userSlice.actions;

export default userSlice.reducer;
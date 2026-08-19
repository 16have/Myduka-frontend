import { createSlice } from "@reduxjs/toolkit";

const storedToken = localStorage.getItem("token");
const storedUser = localStorage.getItem("user");

const safeUser = storedUser ? JSON.parse(storedUser) : null;

const initialState = {
  token: storedToken || null,
  user: safeUser,
  isAuthenticated: !!storedToken && !!safeUser,
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    loginSuccess: (state, action) => {
      const { token, user } = action.payload;

      state.token = token;
      state.user = user;
      state.isAuthenticated = true;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },

    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;
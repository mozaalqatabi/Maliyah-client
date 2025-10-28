
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


export const addUser = createAsyncThunk('user/addUser', async (userData) => {
  const response = await axios.post('http://127.0.0.1:8080/insertUser', userData);
  return response.data;
});

export const updateUser = createAsyncThunk('user/updateUser', async (userData) => {
  const response = await axios.put('http://127.0.0.1:8080/updateUser', userData);
  return response.data;
});

export const getUser = createAsyncThunk('user/getUser', async (userData, thunkAPI) => {
  try {
    const response = await axios.post('http://127.0.0.1:8080/login', {
      email: userData.email,
      password: userData.password,
    });
    return response.data.user;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Login failed");
  }
});

export const logout = createAsyncThunk('user/logout', async () => {
  const response = await axios.post('http://127.0.0.1:8080/logout');
  return response.data;
});

// Initial state
const initValue = {
  user: {},
  message: '',
  isLoading: false,
  isSuccess: false,
  isError: false,
  errorMessage: '',
  isResetCodeSent: false,
  isCodeVerified: false,
  isPasswordReset: false,
};

const UserSlice = createSlice({
  name: 'user',
  initialState: initValue,
  reducers: {
    resetMessage: (state) => {
      state.message = '';
    },
    resetFlags: (state) => {
  state.isSuccess = false;
  state.isError = false;
  state.isResetCodeSent = false;
  state.isCodeVerified = false;
  state.isPasswordReset = false;
  state.message = '';
  state.isLoading = false; 
},

  },
  extraReducers: (builder) => {
    builder
      // AddUser
      .addCase(addUser.pending, (state) => { state.isLoading = true; })
      .addCase(addUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.message = action.payload;
      })
      .addCase(addUser.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      })

      // GetUser
      .addCase(getUser.pending, (state) => { state.isLoading = true; })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || "Login failed";
      })

      // Logout
      .addCase(logout.pending, (state) => { state.isLoading = true; })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = {};
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      })

      // UpdateUser
      .addCase(updateUser.pending, (state) => { state.isLoading = true; })
      .addCase(updateUser.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(updateUser.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
  },
});

export const { resetMessage, resetFlags } = UserSlice.actions;
export default UserSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://maliyah-server.onrender.com/categories";

// Add a new category
export const addCategory = createAsyncThunk(
  "categories/add",
  async (categoryData, thunkAPI) => {
    try {
      const res = await axios.post(API_URL, categoryData);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to add category"
      );
    }
  }
);

// Fetch categories for a user
export const fetchCategories = createAsyncThunk(
  "categories/fetch",
  async (userEmail, thunkAPI) => {
    try {
      const res = await axios.get(`${API_URL}/${userEmail}`);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories"
      );
    }
  }
);

// Delete category
export const deleteCategory = createAsyncThunk(
  "categories/delete",
  async ({ id, userEmail }, thunkAPI) => {
    try {
      await axios.delete(`${API_URL}/${id}/${userEmail}`);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to delete category"
      );
    }
  }
);

const categorySlice = createSlice({
  name: "categories",
  initialState: {
    list: [],
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: "",
  },
  reducers: {
    resetCategoryFlags: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // Add category
      .addCase(addCategory.pending, (state) => { state.isLoading = true; })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.list.push(action.payload);
        state.message = "Category added successfully!";
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Fetch categories
      .addCase(fetchCategories.pending, (state) => { state.isLoading = true; })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.list = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // Delete category
      .addCase(deleteCategory.pending, (state) => { state.isLoading = true; })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.list = state.list.filter((cat) => cat._id !== action.payload);
        state.message = "Category deleted successfully!";
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetCategoryFlags } = categorySlice.actions;
export default categorySlice.reducer;


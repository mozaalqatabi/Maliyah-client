// src/Features/DashboardSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { 
  getFinancialSummary, 
  getRecentTransactions, 
  getAllTransactions,
  getUserGoals, 
  getSpendingByCategory 
} from "../services/dashboardService";

// Async thunks for fetching dashboard data
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async ({ userEmail, userId }, { rejectWithValue }) => {
    try {
      const [financialSummary, recentTransactions, allTransactions, goals, spendingByCategory] = await Promise.all([
        getFinancialSummary(userEmail),
        getRecentTransactions(userEmail, 5),
        getAllTransactions(userEmail),
        getUserGoals(userId),
        getSpendingByCategory(userEmail)
      ]);

      return {
        financialSummary,
        recentTransactions,
        allTransactions,
        goals,
        spendingByCategory
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }
);

export const fetchFinancialSummary = createAsyncThunk(
  'dashboard/fetchFinancialSummary',
  async (userEmail, { rejectWithValue }) => {
    try {
      return await getFinancialSummary(userEmail);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch financial summary');
    }
  }
);

export const fetchRecentTransactions = createAsyncThunk(
  'dashboard/fetchRecentTransactions',
  async ({ userEmail, limit = 5 }, { rejectWithValue }) => {
    try {
      return await getRecentTransactions(userEmail, limit);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent transactions');
    }
  }
);

export const fetchUserGoals = createAsyncThunk(
  'dashboard/fetchUserGoals',
  async (userId, { rejectWithValue }) => {
    try {
      return await getUserGoals(userId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user goals');
    }
  }
);

export const fetchSpendingByCategory = createAsyncThunk(
  'dashboard/fetchSpendingByCategory',
  async (userEmail, { rejectWithValue }) => {
    try {
      return await getSpendingByCategory(userEmail);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch spending by category');
    }
  }
);

const initialState = {
  financialSummary: {
    currentBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    totalIncome: 0,
    totalExpenses: 0
  },
  recentTransactions: [],
  allTransactions: [],
  goals: [],
  spendingByCategory: [],
  loading: false,
  error: null,
  lastUpdated: null
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardData: (state) => {
      return { ...initialState };
    },
    clearError: (state) => {
      state.error = null;
    },
    updateFinancialSummary: (state, action) => {
      state.financialSummary = { ...state.financialSummary, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all dashboard data
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.financialSummary = action.payload.financialSummary;
        state.recentTransactions = action.payload.recentTransactions;
        state.allTransactions = action.payload.allTransactions;
        state.goals = action.payload.goals;
        state.spendingByCategory = action.payload.spendingByCategory;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch financial summary
      .addCase(fetchFinancialSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFinancialSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.financialSummary = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchFinancialSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch recent transactions
      .addCase(fetchRecentTransactions.fulfilled, (state, action) => {
        state.recentTransactions = action.payload;
      })

      // Fetch user goals
      .addCase(fetchUserGoals.fulfilled, (state, action) => {
        state.goals = action.payload;
      })

      // Fetch spending by category
      .addCase(fetchSpendingByCategory.fulfilled, (state, action) => {
        state.spendingByCategory = action.payload;
      });
  }
});

export const { clearDashboardData, clearError, updateFinancialSummary } = dashboardSlice.actions;

// Selectors
export const selectDashboardLoading = (state) => state.dashboard.loading;
export const selectDashboardError = (state) => state.dashboard.error;
export const selectFinancialSummary = (state) => state.dashboard.financialSummary;
export const selectRecentTransactions = (state) => state.dashboard.recentTransactions;
export const selectAllTransactions = (state) => state.dashboard.allTransactions;
export const selectUserGoals = (state) => state.dashboard.goals;
export const selectSpendingByCategory = (state) => state.dashboard.spendingByCategory;
export const selectLastUpdated = (state) => state.dashboard.lastUpdated;

export default dashboardSlice.reducer;
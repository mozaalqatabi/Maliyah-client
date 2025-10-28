// src/services/dashboardService.js
import axios from 'axios';

const API_BASE_URL = 'https://maliyah-server.onrender.com';

// Get dashboard analytics data
export const getDashboardAnalytics = async (userEmail) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/dashboard/analytics/${userEmail}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    throw error;
  }
};

// Get recent transactions
export const getRecentTransactions = async (userEmail, limit = 5) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/records/${userEmail}`);
    // Sort by date (newest first) and limit results for display
    const sortedRecords = response.data.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    return sortedRecords.slice(0, limit);
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    throw error;
  }
};

// Get all transactions for analytics (not limited)
export const getAllTransactions = async (userEmail) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/records/${userEmail}`);
    return response.data.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  } catch (error) {
    console.error('Error fetching all transactions:', error);
    throw error;
  }
};

// Get user goals
export const getUserGoals = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/goals/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user goals:', error);
    throw error;
  }
};

// Get spending by category
export const getSpendingByCategory = async (userEmail) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/records/${userEmail}`);
    const records = response.data;
    
    // Filter only expenses and calculate category totals
    const expenses = records.filter(record => record.type === 'expense');
    const categoryTotals = {};
    let totalExpenses = 0;
    
    expenses.forEach(expense => {
      const category = expense.category;
      const amount = Math.abs(expense.amount);
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      totalExpenses += amount;
    });
    
    // Convert to percentages
    const categoryPercentages = Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category,
      value: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
      amount: amount
    }));
    
    // Sort by percentage (highest first)
    return categoryPercentages.sort((a, b) => b.value - a.value);
  } catch (error) {
    console.error('Error calculating spending by category:', error);
    throw error;
  }
};

// Calculate financial summary
export const getFinancialSummary = async (userEmail) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/records/${userEmail}`);
    const records = response.data;
    
    // Get current date and first day of current month
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Calculate totals
    let totalIncome = 0;
    let totalExpenses = 0;
    let monthlyIncome = 0;
    let monthlyExpenses = 0;
    
    records.forEach(record => {
      const recordDate = new Date(record.startDate);
      const amount = Math.abs(record.amount);
      
      if (record.type === 'income') {
        totalIncome += amount;
        if (recordDate >= currentMonth) {
          monthlyIncome += amount;
        }
      } else if (record.type === 'expense') {
        totalExpenses += amount;
        if (recordDate >= currentMonth) {
          monthlyExpenses += amount;
        }
      }
    });
    
  // Ensure available balance is never negative for UI / allocation logic
  const currentBalance = Math.max(0, totalIncome - totalExpenses);
    
    return {
      currentBalance,
      monthlyIncome,
      monthlyExpenses,
      totalIncome,
      totalExpenses
    };
  } catch (error) {
    console.error('Error calculating financial summary:', error);
    throw error;
  }

};

// recordsSlice.js
import { createSlice } from "@reduxjs/toolkit";
 
const recordsSlice = createSlice({
  name: "records",
  initialState: [],
  reducers: {
    setRecords: (state, action) => action.payload, // overwrite with fetched records
    addRecord: (state, action) => {
      state.push(action.payload); // add new record
    },
    deleteRecord: (state, action) => {
      // Remove record by id
      return state.filter(record => record._id !== action.payload);
    },
    updateRecord: (state, action) => {
      // Replace the record with updated data
      const index = state.findIndex(r => r._id === action.payload._id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
  },
});
 
export const { setRecords, addRecord, deleteRecord, updateRecord } = recordsSlice.actions;
export default recordsSlice.reducer;
 
 

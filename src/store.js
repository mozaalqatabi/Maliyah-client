import { configureStore } from "@reduxjs/toolkit";
import UserReducer from "./Features/UserSlice";
import categoryReducer from "./Features/categorySlice";
import recordsReducer from "./Features/RecordsSlice";  // ✅ import our new slice
import dashboardReducer from "./Features/DashboardSlice";

export const store = configureStore({
  reducer: {
    counter: UserReducer,
    categories: categoryReducer,
    records: recordsReducer,
    dashboard: dashboardReducer,
  },
});

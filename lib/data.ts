import type { Category } from "./types";

export const defaultCategories: Category[] = [
  {
    id: "food",
    name: "Food & Dining",
    color: "#10b981", // emerald-500
  },
  {
    id: "bills",
    name: "Bills & Utilities",
    color: "#3b82f6", // blue-500
  },
  {
    id: "entertainment",
    name: "Entertainment",
    color: "#8b5cf6", // violet-500
  },
  {
    id: "transportation",
    name: "Transportation",
    color: "#f59e0b", // amber-500
  },
  {
    id: "shopping",
    name: "Shopping",
    color: "#ec4899", // pink-500
  },
  {
    id: "health",
    name: "Health & Medical",
    color: "#ef4444", // red-500
  },
  {
    id: "travel",
    name: "Travel",
    color: "#06b6d4", // cyan-500
  },
];

// UUID for the "other" category that will be used across the application
export const OTHER_CATEGORY_ID = "00000000-0000-0000-0000-000000000000";

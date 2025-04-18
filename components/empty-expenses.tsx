"use client"

import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyExpensesProps {
  onAddExpense: () => void
}

export function EmptyExpenses({ onAddExpense }: EmptyExpensesProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width="200"
        height="200"
        viewBox="0 0 24 24"
        fill="none"
        stroke={isDark ? "#10b981" : "#10b981"}
        strokeWidth="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mb-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
        <line x1="7" y1="15" x2="17" y2="15" />
        <motion.path
          d="M12 7.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        />
        <motion.path
          d="M7 20l5-10 5 10"
          stroke={isDark ? "#0ea5e9" : "#0ea5e9"}
          strokeWidth="0.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
        />
        <motion.circle
          cx="12"
          cy="12"
          r="9"
          strokeWidth="0.5"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
        />
      </motion.svg>

      <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-200">No expenses yet</h3>
      <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
        Start tracking your expenses by adding your first transaction. It's the first step toward financial clarity!
      </p>

      <Button onClick={onAddExpense} className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-2">
        <PlusIcon className="h-4 w-4" />
        Add Your First Expense
      </Button>
    </motion.div>
  )
}

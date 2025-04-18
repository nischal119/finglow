"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Dashboard } from "@/components/dashboard"
import { ExpenseForm } from "@/components/expense-form"
import { ExpenseList } from "@/components/expense-list"
import { FilterBar } from "@/components/filter-bar"
import { AnimatePresence, motion } from "framer-motion"
import type { Expense, Category } from "@/lib/types"
import { defaultCategories } from "@/lib/data"

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>(defaultCategories)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  })

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedExpenses = localStorage.getItem("finglow-expenses")
    const savedCategories = localStorage.getItem("finglow-categories")

    if (savedExpenses) {
      setExpenses(
        JSON.parse(savedExpenses).map((expense: any) => ({
          ...expense,
          date: new Date(expense.date),
        })),
      )
    }

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories))
    } else {
      // Save default categories if none exist
      localStorage.setItem("finglow-categories", JSON.stringify(defaultCategories))
    }
  }, [])

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("finglow-expenses", JSON.stringify(expenses))
  }, [expenses])

  // Save categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("finglow-categories", JSON.stringify(categories))
  }, [categories])

  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense = {
      ...expense,
      id: crypto.randomUUID(),
    }
    setExpenses([newExpense, ...expenses])
    setIsFormOpen(false)
  }

  const updateExpense = (updatedExpense: Expense) => {
    setExpenses(expenses.map((expense) => (expense.id === updatedExpense.id ? updatedExpense : expense)))
    setEditingExpense(null)
    setIsFormOpen(false)
  }

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter((expense) => expense.id !== id))
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setIsFormOpen(true)
  }

  const filteredExpenses = expenses.filter((expense) => {
    let matchesCategory = true
    let matchesDateRange = true

    if (filterCategory) {
      matchesCategory = expense.category === filterCategory
    }

    if (dateRange.from) {
      matchesDateRange = matchesDateRange && expense.date >= dateRange.from
    }

    if (dateRange.to) {
      matchesDateRange = matchesDateRange && expense.date <= dateRange.to
    }

    return matchesCategory && matchesDateRange
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Dashboard expenses={filteredExpenses} categories={categories} />

        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Expenses</h2>
            <button
              onClick={() => {
                setEditingExpense(null)
                setIsFormOpen(true)
              }}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-md transition-all duration-300 flex items-center gap-2"
            >
              <span className="text-lg">+</span> Add Expense
            </button>
          </div>

          <FilterBar
            categories={categories}
            setFilterCategory={setFilterCategory}
            filterCategory={filterCategory}
            dateRange={dateRange}
            setDateRange={setDateRange}
          />

          <ExpenseList
            expenses={filteredExpenses}
            categories={categories}
            onEdit={handleEditExpense}
            onDelete={deleteExpense}
          />
        </div>

        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setIsFormOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <ExpenseForm
                  categories={categories}
                  onSubmit={editingExpense ? updateExpense : addExpense}
                  onCancel={() => setIsFormOpen(false)}
                  initialData={editingExpense}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

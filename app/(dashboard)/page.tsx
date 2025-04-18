"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dashboard } from "@/components/dashboard"
import { ExpenseForm } from "@/components/expense-form"
import { ExpenseList } from "@/components/expense-list"
import { FilterBar } from "@/components/filter-bar"
import { EmptyExpenses } from "@/components/empty-expenses"
import { AnimatePresence, motion } from "framer-motion"
import type { Expense, Category } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({
    from: null,
    to: null,
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const { toast } = useToast()

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .order("name")

        if (categoriesError) throw categoriesError

        // Fetch expenses
        const { data: expensesData, error: expensesError } = await supabase
          .from("expenses")
          .select("*, categories(*)")
          .order("date", { ascending: false })

        if (expensesError) throw expensesError

        // Transform data to match our types
        const transformedExpenses: Expense[] = expensesData.map((expense: any) => ({
          id: expense.id,
          description: expense.description,
          amount: Number(expense.amount),
          category: expense.category_id,
          date: new Date(expense.date),
          categoryName: expense.categories?.name || "Unknown",
          categoryColor: expense.categories?.color || "#94a3b8",
        }))

        const transformedCategories: Category[] = categoriesData.map((category: any) => ({
          id: category.id,
          name: category.name,
          color: category.color,
        }))

        setCategories(transformedCategories)
        setExpenses(transformedExpenses)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load your data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Subscribe to changes
    const expensesSubscription = supabase
      .channel("expenses-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "expenses" }, (payload) => {
        fetchData()
      })
      .subscribe()

    const categoriesSubscription = supabase
      .channel("categories-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "categories" }, (payload) => {
        fetchData()
      })
      .subscribe()

    return () => {
      expensesSubscription.unsubscribe()
      categoriesSubscription.unsubscribe()
    }
  }, [supabase, toast])

  const addExpense = async (expense: Omit<Expense, "id">) => {
    try {
      const { data, error } = await supabase
        .from("expenses")
        .insert({
          description: expense.description,
          amount: expense.amount,
          category_id: expense.category,
          date: expense.date.toISOString().split("T")[0],
        })
        .select()

      if (error) throw error

      toast({
        title: "Success",
        description: "Expense added successfully",
      })

      setIsFormOpen(false)
    } catch (error: any) {
      console.error("Error adding expense:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add expense",
        variant: "destructive",
      })
    }
  }

  const updateExpense = async (updatedExpense: Expense) => {
    try {
      const { error } = await supabase
        .from("expenses")
        .update({
          description: updatedExpense.description,
          amount: updatedExpense.amount,
          category_id: updatedExpense.category,
          date: updatedExpense.date.toISOString().split("T")[0],
        })
        .eq("id", updatedExpense.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Expense updated successfully",
      })

      setEditingExpense(null)
      setIsFormOpen(false)
    } catch (error: any) {
      console.error("Error updating expense:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update expense",
        variant: "destructive",
      })
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase.from("expenses").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Expense deleted successfully",
      })
    } catch (error: any) {
      console.error("Error deleting expense:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense",
        variant: "destructive",
      })
    }
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
    <div>
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <Dashboard expenses={filteredExpenses} categories={categories} />

          <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Expenses</h2>
              <Button
                onClick={() => {
                  setEditingExpense(null)
                  setIsFormOpen(true)
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-md transition-all duration-300 flex items-center gap-2"
              >
                <PlusIcon className="h-4 w-4" />
                Add Expense
              </Button>
            </div>

            <FilterBar
              categories={categories}
              setFilterCategory={setFilterCategory}
              filterCategory={filterCategory}
              dateRange={dateRange}
              setDateRange={setDateRange}
            />

            {filteredExpenses.length > 0 ? (
              <ExpenseList
                expenses={filteredExpenses}
                categories={categories}
                onEdit={handleEditExpense}
                onDelete={deleteExpense}
              />
            ) : (
              <EmptyExpenses
                onAddExpense={() => {
                  setEditingExpense(null)
                  setIsFormOpen(true)
                }}
              />
            )}
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
        </motion.div>
      )}
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[300px] rounded-xl" />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

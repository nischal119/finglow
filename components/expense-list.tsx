"use client"

import type { Expense, Category } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Edit2Icon, Trash2Icon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ExpenseListProps {
  expenses: Expense[]
  categories: Category[]
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

export function ExpenseList({ expenses, categories, onEdit, onDelete }: ExpenseListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const getCategoryName = (id: string) => {
    return categories.find((cat) => cat.id === id)?.name || "Uncategorized"
  }

  const getCategoryColor = (id: string) => {
    return categories.find((cat) => cat.id === id)?.color || "#94a3b8"
  }

  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId)
      setDeleteId(null)
    }
  }

  return (
    <>
      <div className="space-y-4 mt-6">
        {expenses.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-lg font-medium">No expenses found</p>
              <p className="text-sm mt-1">Add your first expense to start tracking!</p>
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {expenses.map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                layout
              >
                <Card className="p-4 hover:shadow-md transition-shadow border-none shadow-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-3 h-3 rounded-full mt-2"
                        style={{ backgroundColor: getCategoryColor(expense.category) }}
                      />
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-slate-100">{expense.description}</h3>
                        <div className="flex flex-wrap gap-x-4 text-sm text-slate-500 dark:text-slate-400 mt-1">
                          <span>{getCategoryName(expense.category)}</span>
                          <span>{formatDate(expense.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-semibold text-slate-900 dark:text-slate-100 mr-2">
                        {formatCurrency(expense.amount)}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onEdit(expense)}
                        className="h-8 w-8 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        <Edit2Icon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setDeleteId(expense.id)}
                        className="h-8 w-8 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the expense.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

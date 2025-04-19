"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { FilterBar } from "@/components/filter-bar";
import { EmptyExpenses } from "@/components/empty-expenses";
import { AnimatePresence, motion } from "framer-motion";
import type { Expense, Category } from "@/lib/types";
import type { DateRange } from "react-day-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .order("name");

        if (categoriesError) throw categoriesError;

        // Fetch expenses
        const { data: expensesData, error: expensesError } = await supabase
          .from("expenses")
          .select("*, categories(*)")
          .order("date", { ascending: false });

        if (expensesError) throw expensesError;

        // Transform data to match our types
        const transformedExpenses: Expense[] = expensesData.map(
          (expense: any) => ({
            id: expense.id,
            description: expense.description,
            amount: Number(expense.amount),
            category: expense.category_id,
            date: new Date(expense.date),
            categoryName: expense.categories?.name || "Unknown",
            categoryColor: expense.categories?.color || "#94a3b8",
          })
        );

        const transformedCategories: Category[] = categoriesData.map(
          (category: any) => ({
            id: category.id,
            name: category.name,
            color: category.color,
          })
        );

        setCategories(transformedCategories);
        setExpenses(transformedExpenses);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load your data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Subscribe to changes
    const expensesSubscription = supabase
      .channel("expenses-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses" },
        (payload) => {
          fetchData();
        }
      )
      .subscribe();

    const categoriesSubscription = supabase
      .channel("categories-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        (payload) => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      expensesSubscription.unsubscribe();
      categoriesSubscription.unsubscribe();
    };
  }, [supabase, toast]);

  const filteredExpenses = expenses.filter((expense) => {
    let matchesCategory = true;
    let matchesDateRange = true;

    if (filterCategory) {
      matchesCategory = expense.category === filterCategory;
    }

    if (dateRange?.from) {
      matchesDateRange = matchesDateRange && expense.date >= dateRange.from;
    }

    if (dateRange?.to) {
      matchesDateRange = matchesDateRange && expense.date <= dateRange.to;
    }

    return matchesCategory && matchesDateRange;
  });

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const deleteExpense = async (expense: Expense) => {
    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expense.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expense deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting expense:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      {isLoading ? (
        <div className="space-y-8">
          <div className="space-y-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>

          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-[180px]" />
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Expenses</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Track and manage all your expenses in one place
            </p>
          </div>

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-slate-800 dark:text-slate-100">
              All Expenses
            </h2>
            <Button
              onClick={() => {
                setEditingExpense(null);
                setIsFormOpen(true);
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-md transition-all duration-300 flex items-center gap-2"
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
            <EmptyExpenses />
          )}

          <AnimatePresence>
            {isFormOpen && (
              <ExpenseForm
                categories={categories}
                editingExpense={editingExpense}
                onClose={() => {
                  setIsFormOpen(false);
                  setEditingExpense(null);
                }}
                onSubmit={async () => {
                  setIsFormOpen(false);
                  setEditingExpense(null);
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

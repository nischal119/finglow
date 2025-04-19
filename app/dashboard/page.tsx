"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Dashboard } from "@/components/dashboard";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { FilterBar } from "@/components/filter-bar";
import { EmptyExpenses } from "@/components/empty-expenses";
import { AnimatePresence, motion } from "framer-motion";
import type { Expense, Category, Income } from "@/lib/types";
import type { DateRange } from "react-day-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddIncomeButton } from "@/components/income-form";
import { IncomeList } from "@/components/income-list";
import { EmptyIncomes } from "@/components/empty-incomes";

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const { toast } = useToast();

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

      // Fetch incomes
      const { data: incomesData, error: incomesError } = await supabase
        .from("incomes")
        .select("*")
        .order("date", { ascending: false });

      if (incomesError) throw incomesError;

      // Transform expenses data
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

      // Transform incomes data
      const transformedIncomes: Income[] = incomesData.map((income: any) => ({
        id: income.id,
        description: income.description,
        amount: Number(income.amount),
        date: new Date(income.date),
        source: income.source,
      }));

      const transformedCategories: Category[] = categoriesData.map(
        (category: any) => ({
          id: category.id,
          name: category.name,
          color: category.color,
        })
      );

      setCategories(transformedCategories);
      setExpenses(transformedExpenses);
      setIncomes(transformedIncomes);
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

  useEffect(() => {
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

    const incomesSubscription = supabase
      .channel("incomes-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incomes" },
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
      incomesSubscription.unsubscribe();
      categoriesSubscription.unsubscribe();
    };
  }, [supabase, toast]);

  const handleExpenseChange = () => {
    fetchData();
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

      // Refresh the data
      fetchData();
    } catch (error: any) {
      console.error("Error deleting expense:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete expense",
        variant: "destructive",
      });
    }
  };

  const deleteIncome = async (income: Income) => {
    try {
      const { error } = await supabase
        .from("incomes")
        .delete()
        .eq("id", income.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Income deleted successfully",
      });

      fetchData();
    } catch (error: any) {
      console.error("Error deleting income:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete income",
        variant: "destructive",
      });
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
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
  }, [expenses, filterCategory, dateRange]);

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  return (
    <div>
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Dashboard
            expenses={filteredExpenses}
            incomes={incomes}
            categories={categories}
          />

          <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Income
              </h2>
              <div className="flex gap-3">
                <AddIncomeButton onIncomeChange={fetchData} />
              </div>
            </div>

            {incomes.length > 0 ? (
              <IncomeList
                incomes={incomes}
                onEdit={(income) => {
                  // Handle edit - will be implemented with the edit form
                }}
                onDelete={deleteIncome}
              />
            ) : (
              <EmptyIncomes />
            )}
          </div>

          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                Expenses
              </h2>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Button
                  onClick={() => {
                    setEditingExpense(null);
                    setIsFormOpen(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 hover:from-emerald-600 hover:via-emerald-500 hover:to-emerald-600 text-white rounded-lg shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 flex items-center gap-2 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <PlusIcon className="h-4 w-4" />
                    Add Expense
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "0%" }}
                    transition={{ duration: 0.3 }}
                  />
                </Button>
              </motion.div>
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
          </div>

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
                onExpenseChange={handleExpenseChange}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
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
  );
}

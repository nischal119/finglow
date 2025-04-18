"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Dashboard } from "@/components/dashboard";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { FilterBar } from "@/components/filter-bar";
import { EmptyExpenses } from "@/components/empty-expenses";
import { AnimatePresence, motion } from "framer-motion";
import type { Expense, Category } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: null,
    to: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  // Fetch data from Supabase
  useEffect(() => {
    if (!user) return;

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
  }, [supabase, toast, user]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const filteredExpenses = expenses.filter((expense) => {
    let matchesCategory = true;
    let matchesDateRange = true;

    if (filterCategory) {
      matchesCategory = expense.category === filterCategory;
    }

    if (dateRange.from) {
      matchesDateRange = matchesDateRange && expense.date >= dateRange.from;
    }

    if (dateRange.to) {
      matchesDateRange = matchesDateRange && expense.date <= dateRange.to;
    }

    return matchesCategory && matchesDateRange;
  });

  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Dashboard expenses={filteredExpenses} categories={categories} />

        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Expenses
            </h2>
            <Button
              onClick={() => {
                setEditingExpense(null);
                setIsFormOpen(true);
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
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ) : (
            <EmptyExpenses />
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {isFormOpen && (
          <ExpenseForm
            categories={categories}
            editingExpense={editingExpense}
            onClose={() => {
              setIsFormOpen(false);
              setEditingExpense(null);
            }}
            onSubmit={() => {}}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

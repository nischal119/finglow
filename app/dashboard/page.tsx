"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { Dashboard } from "@/components/dashboard";
import { ExpenseForm } from "@/components/expense-form";
import { ExpenseList } from "@/components/expense-list";
import { FilterBar } from "@/components/filter-bar";
import { EmptyExpenses } from "@/components/empty-expenses";
import { motion, AnimatePresence } from "framer-motion";
import type { Expense, Category } from "@/lib/types";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2 },
  },
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (categoriesError) throw categoriesError;

      // Fetch expenses with category details
      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select("*, categories(*)")
        .order("date", { ascending: false });

      if (expensesError) throw expensesError;

      // Transform data
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

  // Initial data fetch and real-time subscriptions
  useEffect(() => {
    if (!user) return;

    fetchData();

    // Real-time subscription for expenses
    const expensesChannel = supabase
      .channel("expenses-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
        },
        (payload) => {
          console.log("Expense change received:", payload);
          fetchData();
        }
      )
      .subscribe();

    // Real-time subscription for categories
    const categoriesChannel = supabase
      .channel("categories-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "categories",
        },
        (payload) => {
          console.log("Category change received:", payload);
          fetchData();
        }
      )
      .subscribe();

    return () => {
      expensesChannel.unsubscribe();
      categoriesChannel.unsubscribe();
    };
  }, [user]);

  const handleEditExpense = async (expense: Expense) => {
    // This will be handled by the ExpenseForm component
    // which will show the edit dialog
  };

  const handleDeleteExpense = async (expense: Expense) => {
    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expense.id);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  // Filter expenses based on category and date range
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesCategory =
        !filterCategory || expense.category === filterCategory;
      const matchesDateRange =
        !dateRange ||
        (!dateRange.from && !dateRange.to) ||
        ((!dateRange.from || expense.date >= dateRange.from) &&
          (!dateRange.to || expense.date <= dateRange.to));
      return matchesCategory && matchesDateRange;
    });
  }, [expenses, filterCategory, dateRange]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"
        ></motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 p-8"
    >
      <motion.div variants={itemVariants}>
        <Dashboard expenses={filteredExpenses} categories={categories} />
      </motion.div>

      <motion.div variants={itemVariants} className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold text-gray-900 dark:text-gray-100"
          >
            Expenses
          </motion.h2>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={() => {
                setEditingExpense(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Add Expense
            </Button>
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <FilterBar
            categories={categories}
            setFilterCategory={setFilterCategory}
            filterCategory={filterCategory}
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {filteredExpenses.length > 0 ? (
            <motion.div
              key="expense-list"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <ExpenseList
                expenses={filteredExpenses}
                categories={categories}
                onEdit={handleEditExpense}
                onDelete={handleDeleteExpense}
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty-state"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <EmptyExpenses />
            </motion.div>
          )}
        </AnimatePresence>
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
            onSubmit={async () => {
              setIsFormOpen(false);
              setEditingExpense(null);
              await fetchData(); // Refresh data immediately after submission
            }}
          />
        )}
      </AnimatePresence>

      <AlertDialog
        open={!!deleteExpense}
        onOpenChange={() => setDeleteExpense(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              expense.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDeleteExpense(null);
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

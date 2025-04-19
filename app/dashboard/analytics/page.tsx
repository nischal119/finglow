"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  PieChartIcon,
  BarChart3Icon,
  LineChartIcon,
  TrendingUpIcon,
} from "lucide-react";
import type { Expense, Category } from "@/lib/types";
import { ErrorBoundary } from "../../components/ErrorBoundary";

function AnalyticsPageContent() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all");
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

        // Fetch expenses with category details
        const { data: expensesData, error: expensesError } = await supabase
          .from("expenses")
          .select(
            `
            *,
            categories (
              id,
              name,
              color
            )
          `
          )
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
  }, [supabase, toast]);

  const filteredExpenses = useMemo(() => {
    if (timeRange === "all") return expenses;

    const now = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case "7days":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(now.getDate() - 90);
        break;
      case "year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return expenses;
    }

    return expenses.filter((expense) => expense.date >= startDate);
  }, [expenses, timeRange]);

  const expensesByCategory = useMemo(() => {
    const categoryMap = new Map<
      string,
      { value: number; name: string; color: string }
    >();

    filteredExpenses.forEach((expense) => {
      if (!expense.categoryName) return; // Skip if no category name
      const currentData = categoryMap.get(expense.categoryName) || {
        value: 0,
        name: expense.categoryName,
        color: expense.categoryColor || "#94a3b8",
      };
      categoryMap.set(expense.categoryName, {
        ...currentData,
        value: currentData.value + expense.amount,
      });
    });

    return Array.from(categoryMap.values());
  }, [filteredExpenses]);

  const expensesByMonth = useMemo(() => {
    const monthMap = new Map<string, number>();

    // Get the last 6 months
    const today = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${d.getMonth() + 1}`;
      months.push({
        key: monthKey,
        name: d.toLocaleString("default", { month: "short" }),
      });
      monthMap.set(monthKey, 0);
    }

    filteredExpenses.forEach((expense) => {
      const monthKey = `${expense.date.getFullYear()}-${
        expense.date.getMonth() + 1
      }`;
      if (monthMap.has(monthKey)) {
        const currentAmount = monthMap.get(monthKey) || 0;
        monthMap.set(monthKey, currentAmount + expense.amount);
      }
    });

    return months.map((month) => ({
      name: month.name,
      amount: monthMap.get(month.key) || 0,
    }));
  }, [filteredExpenses]);

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce(
      (total, expense) => total + expense.amount,
      0
    );
  }, [filteredExpenses]);

  const averageExpense = useMemo(() => {
    return filteredExpenses.length > 0
      ? totalExpenses / filteredExpenses.length
      : 0;
  }, [filteredExpenses, totalExpenses]);

  const topCategory = useMemo(() => {
    if (expensesByCategory.length === 0) return null;
    return expensesByCategory.sort((a, b) => b.value - a.value)[0];
  }, [expensesByCategory]);

  const COLORS = [
    "#10b981",
    "#3b82f6",
    "#8b5cf6",
    "#f59e0b",
    "#ec4899",
    "#ef4444",
    "#06b6d4",
    "#6b7280",
  ];

  if (isLoading) {
    return <AnalyticsPageSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Gain insights into your spending patterns and financial habits
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Expenses</CardTitle>
              <CardDescription>All time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Average Expense</CardTitle>
              <CardDescription>Per transaction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(averageExpense)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Category</CardTitle>
              <CardDescription>Highest spending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {topCategory ? topCategory.name : "N/A"}
              </div>
              {topCategory && (
                <div className="text-sm text-slate-500">
                  {formatCurrency(topCategory.value)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>Total count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredExpenses.length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Expenses Over Time</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={expensesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>Breakdown of spending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function AnalyticsPageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>

      <div className="space-y-6">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-[300px] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <ErrorBoundary>
      <AnalyticsPageContent />
    </ErrorBoundary>
  );
}

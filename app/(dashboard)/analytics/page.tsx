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

export default function AnalyticsPage() {
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

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-slate-800 dark:text-slate-100">
          Overview
        </h2>
        <div className="flex items-center gap-2">
          <Label htmlFor="time-range" className="text-sm">
            Time Range:
          </Label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger id="time-range" className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="overflow-hidden border-none shadow-md">
          <CardHeader className="pb-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center">
              <TrendingUpIcon className="h-4 w-4 mr-2 text-emerald-500" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalExpenses)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {filteredExpenses.length} transactions
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-md">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center">
              <PieChartIcon className="h-4 w-4 mr-2 text-blue-500" />
              Average Expense
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(averageExpense)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Per transaction
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-md">
          <CardHeader className="pb-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center">
              <BarChart3Icon className="h-4 w-4 mr-2 text-purple-500" />
              Top Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCategory ? (
              <>
                <div className="text-2xl font-bold">{topCategory.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {formatCurrency(topCategory.value)}
                </div>
              </>
            ) : (
              <div className="text-slate-500 dark:text-slate-400">
                No expenses yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="category" className="space-y-6">
        <TabsList>
          <TabsTrigger value="category" className="flex items-center gap-1">
            <PieChartIcon className="h-4 w-4" />
            <span>By Category</span>
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-1">
            <LineChartIcon className="h-4 w-4" />
            <span>Over Time</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="category" className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>
                See how your expenses are distributed across different
                categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-[300px]">
                  {expensesByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expensesByCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {expensesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => formatCurrency(value as number)}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                      No expense data to display
                    </div>
                  )}
                </div>

                <div className="h-[300px]">
                  {expensesByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={expensesByCategory}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `₹${value}`} />
                        <Tooltip
                          formatter={(value) => formatCurrency(value as number)}
                        />
                        <Bar dataKey="value" name="Amount">
                          {expensesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                      No expense data to display
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Spending Over Time</CardTitle>
              <CardDescription>
                Track how your expenses have changed over the past months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {expensesByMonth.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={expensesByMonth}>
                      <defs>
                        <linearGradient
                          id="colorAmount"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#10b981"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="#10b981"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `₹${value}`} />
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#10b981"
                        fillOpacity={1}
                        fill="url(#colorAmount)"
                        name="Monthly Expenses"
                        isAnimationActive={true}
                        animationBegin={0}
                        animationDuration={1200}
                        animationEasing="ease-out"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 dark:text-slate-400">
                    No expense data to display
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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

      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-[180px]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    </div>
  );
}

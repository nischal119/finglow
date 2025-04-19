"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Expense, Category, Income } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { OTHER_CATEGORY_ID } from "@/lib/data";
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
  Area,
  AreaChart,
} from "recharts";
import { motion } from "framer-motion";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BarChart3Icon,
  LineChartIcon,
  PieChartIcon,
  TrendingUpIcon,
  DollarSignIcon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { MetricCard } from "@/components/metric-card";
import { Clock, ChartPie, Wallet } from "lucide-react";

interface DashboardProps {
  expenses: Expense[];
  incomes: Income[];
  categories: Category[];
}

export function Dashboard({ expenses, incomes, categories }: DashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    // Set initial loading state
    setIsLoading(true);

    // Add a small delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
      setShouldAnimate(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [expenses]);

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Find top category
  const categoryExpenses = expenses.reduce((acc, expense) => {
    if (!expense.categoryName) return acc; // Skip if no category name
    acc[expense.categoryName] =
      (acc[expense.categoryName] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryExpenses).sort(
    ([, a], [, b]) => b - a
  )[0];

  // Get active categories (categories that have expenses)
  const activeCategories = useMemo(() => {
    const uniqueCategories = new Set(
      expenses.map((expense) => expense.categoryName).filter(Boolean)
    );
    return uniqueCategories.size;
  }, [expenses]);

  const COLORS = [
    "#10b981", // emerald-500
    "#3b82f6", // blue-500
    "#8b5cf6", // violet-500
    "#f59e0b", // amber-500
    "#ec4899", // pink-500
    "#ef4444", // red-500
    "#06b6d4", // cyan-500
  ];

  // Colors for custom categories
  const CUSTOM_COLORS = [
    "#6b7280", // gray-500
    "#9ca3af", // gray-400
    "#4b5563", // gray-600
    "#374151", // gray-700
    "#1f2937", // gray-800
    "#111827", // gray-900
    "#d1d5db", // gray-300
  ];

  const expensesByCategory = useMemo(() => {
    const categoryMap = new Map<
      string,
      { value: number; name: string; color: string; isCustom?: boolean }
    >();

    // Keep track of custom category count for color assignment
    let customCategoryCount = 0;

    expenses.forEach((expense) => {
      if (!expense.category) return; // Skip if no category

      // For custom categories (Other), use the custom name instead
      if (expense.category === OTHER_CATEGORY_ID) {
        // Use custom_category as the key and name
        const categoryName = expense.custom_category || "Other";
        const mapKey = `custom_${categoryName}`; // Use a unique key for custom categories

        const existingData = categoryMap.get(mapKey);
        if (!existingData) {
          // Assign a new color from CUSTOM_COLORS array
          const colorIndex = customCategoryCount % CUSTOM_COLORS.length;
          customCategoryCount++;

          categoryMap.set(mapKey, {
            value: expense.amount,
            name: categoryName,
            color: CUSTOM_COLORS[colorIndex],
            isCustom: true,
          });
        } else {
          categoryMap.set(mapKey, {
            ...existingData,
            value: existingData.value + expense.amount,
          });
        }
      } else {
        // For regular categories
        const currentData = categoryMap.get(expense.category) || {
          value: 0,
          name: expense.categoryName || expense.category,
          color: expense.categoryColor || "#94a3b8",
          isCustom: false,
        };
        categoryMap.set(expense.category, {
          ...currentData,
          value: currentData.value + expense.amount,
        });
      }
    });

    return Array.from(categoryMap.values());
  }, [expenses]);

  // Sort categories to group custom categories together and by value
  const sortedExpensesByCategory = useMemo(() => {
    return expensesByCategory.sort((a, b) => {
      // First sort by custom vs default
      if (a.isCustom && !b.isCustom) return 1;
      if (!a.isCustom && b.isCustom) return -1;
      // Then by value
      return b.value - a.value;
    });
  }, [expensesByCategory]);

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

    expenses.forEach((expense) => {
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
  }, [expenses]);

  const recentTrend = useMemo(() => {
    if (expenses.length < 2) return 0;

    // Get the most recent 5 expenses
    const recentExpenses = [...expenses]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5);

    // Calculate the average amount
    const avgAmount =
      recentExpenses.reduce((sum, exp) => sum + exp.amount, 0) /
      recentExpenses.length;

    // Get the previous 5 expenses
    const previousExpenses = [...expenses]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(5, 10);

    if (previousExpenses.length === 0) return 0;

    // Calculate the previous average
    const prevAvgAmount =
      previousExpenses.reduce((sum, exp) => sum + exp.amount, 0) /
      previousExpenses.length;

    // Calculate the percentage change
    return ((avgAmount - prevAvgAmount) / prevAvgAmount) * 100;
  }, [expenses]);

  const incomeVsExpenseData = useMemo(() => {
    const monthMap = new Map<
      string,
      { income: number; expense: number; profit: number }
    >();

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
      monthMap.set(monthKey, { income: 0, expense: 0, profit: 0 });
    }

    // Calculate expenses by month
    expenses.forEach((expense) => {
      const monthKey = `${expense.date.getFullYear()}-${
        expense.date.getMonth() + 1
      }`;
      if (monthMap.has(monthKey)) {
        const current = monthMap.get(monthKey)!;
        current.expense += expense.amount;
        current.profit = current.income - current.expense;
        monthMap.set(monthKey, current);
      }
    });

    // Calculate income by month
    incomes.forEach((income) => {
      const monthKey = `${income.date.getFullYear()}-${
        income.date.getMonth() + 1
      }`;
      if (monthMap.has(monthKey)) {
        const current = monthMap.get(monthKey)!;
        current.income += income.amount;
        current.profit = current.income - current.expense;
        monthMap.set(monthKey, current);
      }
    });

    return months.map((month) => ({
      name: month.name,
      income: monthMap.get(month.key)?.income || 0,
      expense: monthMap.get(month.key)?.expense || 0,
      profit: monthMap.get(month.key)?.profit || 0,
    }));
  }, [expenses, incomes]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Total Expenses"
          value={totalExpenses > 0 ? formatCurrency(totalExpenses) : ""}
          description={totalExpenses > 0 ? "Total spending so far" : undefined}
          icon={Wallet}
          className="bg-emerald-50 dark:bg-emerald-950/20"
          iconClassName="bg-emerald-500/20 text-emerald-500"
          emptyState="Track your first expense to see the total here!"
        />
        <MetricCard
          title="Top Category"
          value={topCategory ? topCategory[0] : ""}
          description={
            topCategory ? `${formatCurrency(topCategory[1])} spent` : undefined
          }
          icon={ChartPie}
          className="bg-blue-50 dark:bg-blue-950/20"
          iconClassName="bg-blue-500/20 text-blue-500"
          emptyState="Categorize expenses to see your top spending area"
        />
        <MetricCard
          title="Total Categories"
          value={activeCategories > 0 ? activeCategories.toString() : ""}
          description={
            activeCategories > 0
              ? `${activeCategories} ${
                  activeCategories === 1 ? "category" : "categories"
                } with expenses`
              : undefined
          }
          icon={Clock}
          className="bg-pink-50 dark:bg-pink-950/20"
          iconClassName="bg-pink-500/20 text-pink-500"
          emptyState="Add categories to organize your expenses"
        />
      </div>

      <div className="mt-8">
        <Tabs defaultValue="pie">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Spending by Category
            </h3>
            <TabsList>
              <TabsTrigger value="pie" className="flex items-center gap-1">
                <PieChartIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Pie Chart</span>
              </TabsTrigger>
              <TabsTrigger value="bar" className="flex items-center gap-1">
                <BarChart3Icon className="h-4 w-4" />
                <span className="hidden sm:inline">Bar Chart</span>
              </TabsTrigger>
              <TabsTrigger value="trend" className="flex items-center gap-1">
                <LineChartIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Trend</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="border-none shadow-md">
              <CardContent className="pt-6">
                <TabsContent value="pie" className="mt-0">
                  {expensesByCategory.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                        key={shouldAnimate ? "animated" : "loading"}
                      >
                        <PieChart>
                          <Pie
                            data={sortedExpensesByCategory}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                            isAnimationActive={shouldAnimate}
                            animationBegin={0}
                            animationDuration={1200}
                            animationEasing="ease-out"
                          >
                            {sortedExpensesByCategory.map((entry, index) => (
                              <Cell
                                key={`cell-${entry.name}-${index}`}
                                fill={entry.color}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) =>
                              formatCurrency(value as number)
                            }
                            animationDuration={200}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="h-[300px] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400"
                    >
                      <motion.div
                        className="mb-4"
                        animate={{ y: [0, -10, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Image
                          src="/placeholder.svg?height=100&width=100"
                          alt="No data"
                          width={100}
                          height={100}
                          className="opacity-50"
                        />
                      </motion.div>
                      <p className="font-medium text-lg">
                        No expenses tracked yet
                      </p>
                      <p className="text-sm mt-2 text-center max-w-sm">
                        Start adding expenses to see beautiful insights about
                        your spending patterns
                      </p>
                    </motion.div>
                  )}
                </TabsContent>

                <TabsContent value="bar" className="mt-0">
                  {expensesByCategory.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                        key={shouldAnimate ? "animated" : "loading"}
                      >
                        <BarChart data={expensesByCategory}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => `₹${value}`} />
                          <Tooltip
                            formatter={(value) =>
                              formatCurrency(value as number)
                            }
                            animationDuration={200}
                          />
                          <Bar
                            dataKey="value"
                            name="Amount"
                            isAnimationActive={shouldAnimate}
                            animationBegin={0}
                            animationDuration={1200}
                            animationEasing="ease-out"
                          >
                            {expensesByCategory.map((entry, index) => (
                              <Cell
                                key={`cell-${index}-${entry.value}`}
                                fill={
                                  entry.color || COLORS[index % COLORS.length]
                                }
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="h-[300px] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400"
                    >
                      <motion.div
                        className="mb-4"
                        animate={{ y: [0, -10, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Image
                          src="/placeholder.svg?height=100&width=100"
                          alt="No data"
                          width={100}
                          height={100}
                          className="opacity-50"
                        />
                      </motion.div>
                      <p className="font-medium text-lg">
                        Your expense chart awaits
                      </p>
                      <p className="text-sm mt-2 text-center max-w-sm">
                        Add your expenses to visualize spending across different
                        categories
                      </p>
                    </motion.div>
                  )}
                </TabsContent>

                <TabsContent value="trend" className="mt-0">
                  {expensesByMonth.some((month) => month.amount > 0) ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                        key={shouldAnimate ? "animated" : "loading"}
                      >
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
                            formatter={(value) =>
                              formatCurrency(value as number)
                            }
                            animationDuration={200}
                          />
                          <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="#10b981"
                            fillOpacity={1}
                            fill="url(#colorAmount)"
                            name="Monthly Expenses"
                            isAnimationActive={shouldAnimate}
                            animationBegin={0}
                            animationDuration={1200}
                            animationEasing="ease-out"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="h-[300px] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400"
                    >
                      <motion.div
                        className="mb-4"
                        animate={{ y: [0, -10, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Image
                          src="/placeholder.svg?height=100&width=100"
                          alt="No data"
                          width={100}
                          height={100}
                          className="opacity-50"
                        />
                      </motion.div>
                      <p className="font-medium text-lg">
                        No spending trends yet
                      </p>
                      <p className="text-sm mt-2 text-center max-w-sm">
                        Track your expenses over time to see monthly spending
                        patterns
                      </p>
                    </motion.div>
                  )}
                </TabsContent>
              </CardContent>
            </Card>
          </motion.div>
        </Tabs>
      </div>

      <div className="mt-8">
        <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                Total Income
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(totalIncome)}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <ArrowUpIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            From {incomes.length} income records
          </p>
        </Card>

        <Card className="p-6 mt-4 bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                Total Expenses
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(totalExpenses)}
              </h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <ArrowDownIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            From {expenses.length} expense records
          </p>
        </Card>

        <Card
          className={`p-6 mt-4 ${
            balance >= 0
              ? "bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-500/20"
              : "bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className={`text-sm font-medium ${
                  balance >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-orange-600 dark:text-orange-400"
                }`}
              >
                Balance
              </p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(balance)}
              </h3>
            </div>
            <div
              className={`h-12 w-12 rounded-full flex items-center justify-center ${
                balance >= 0
                  ? "bg-emerald-100 dark:bg-emerald-900/20"
                  : "bg-orange-100 dark:bg-orange-900/20"
              }`}
            >
              <DollarSignIcon
                className={`h-6 w-6 ${
                  balance >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-orange-600 dark:text-orange-400"
                }`}
              />
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {balance >= 0 ? "Net savings" : "Net deficit"}
          </p>
        </Card>
      </div>
    </motion.div>
  );
}

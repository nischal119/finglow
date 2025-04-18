"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Expense, Category } from "@/lib/types";
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
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { MetricCard } from "@/components/metric-card";
import { Clock, ChartPie, Wallet } from "lucide-react";

interface DashboardProps {
  expenses: Expense[];
  categories: string[];
}

export function Dashboard({ expenses, categories }: DashboardProps) {
  // Calculate total expenses
  const totalExpenses = expenses.reduce(
    (acc, expense) => acc + expense.amount,
    0
  );

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

  const expensesByCategory = useMemo(() => {
    const categoryMap = new Map<string, number>();

    expenses.forEach((expense) => {
      if (!expense.category) return; // Skip if no category
      const currentAmount = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, currentAmount + expense.amount);
    });

    return Array.from(categoryMap.entries()).map(([id, value]) => {
      const category = categories.find((c) => c === id);
      return {
        id,
        name: category || id,
        value,
        color: category ? "#10b981" : "#94a3b8",
      };
    });
  }, [expenses, categories]);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {expensesByCategory.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.color || COLORS[index % COLORS.length]
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) =>
                              formatCurrency(value as number)
                            }
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
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={expensesByCategory}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(value) => `₹${value}`} />
                          <Tooltip
                            formatter={(value) =>
                              formatCurrency(value as number)
                            }
                          />
                          <Bar dataKey="value" name="Amount">
                            {expensesByCategory.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
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
                            formatter={(value) =>
                              formatCurrency(value as number)
                            }
                          />
                          <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="#10b981"
                            fillOpacity={1}
                            fill="url(#colorAmount)"
                            name="Monthly Expenses"
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
    </motion.div>
  );
}

"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Expense, Category } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
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
} from "recharts"
import { motion } from "framer-motion"
import { ArrowDownIcon, ArrowUpIcon, BarChart3Icon, LineChartIcon, PieChartIcon, TrendingUpIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"

interface DashboardProps {
  expenses: Expense[]
  categories: Category[]
}

export function Dashboard({ expenses, categories }: DashboardProps) {
  const totalExpenses = useMemo(() => {
    return expenses.reduce((total, expense) => total + expense.amount, 0)
  }, [expenses])

  const expensesByCategory = useMemo(() => {
    const categoryMap = new Map<string, number>()

    expenses.forEach((expense) => {
      const currentAmount = categoryMap.get(expense.category) || 0
      categoryMap.set(expense.category, currentAmount + expense.amount)
    })

    return Array.from(categoryMap.entries()).map(([id, value]) => {
      const category = categories.find((c) => c.id === id)
      return {
        id,
        name: category?.name || id,
        value,
        color: category?.color || "#94a3b8",
      }
    })
  }, [expenses, categories])

  const expensesByMonth = useMemo(() => {
    const monthMap = new Map<string, number>()

    // Get the last 6 months
    const today = new Date()
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthKey = `${d.getFullYear()}-${d.getMonth() + 1}`
      months.push({ key: monthKey, name: d.toLocaleString("default", { month: "short" }) })
      monthMap.set(monthKey, 0)
    }

    expenses.forEach((expense) => {
      const monthKey = `${expense.date.getFullYear()}-${expense.date.getMonth() + 1}`
      if (monthMap.has(monthKey)) {
        const currentAmount = monthMap.get(monthKey) || 0
        monthMap.set(monthKey, currentAmount + expense.amount)
      }
    })

    return months.map((month) => ({
      name: month.name,
      amount: monthMap.get(month.key) || 0,
    }))
  }, [expenses])

  const recentTrend = useMemo(() => {
    if (expenses.length < 2) return 0

    // Get the most recent 5 expenses
    const recentExpenses = [...expenses].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5)

    // Calculate the average amount
    const avgAmount = recentExpenses.reduce((sum, exp) => sum + exp.amount, 0) / recentExpenses.length

    // Get the previous 5 expenses
    const previousExpenses = [...expenses].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(5, 10)

    if (previousExpenses.length === 0) return 0

    // Calculate the previous average
    const prevAvgAmount = previousExpenses.reduce((sum, exp) => sum + exp.amount, 0) / previousExpenses.length

    // Calculate the percentage change
    return ((avgAmount - prevAvgAmount) / prevAvgAmount) * 100
  }, [expenses])

  const COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899", "#ef4444", "#06b6d4", "#6b7280"]

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
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="pb-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center">
                <TrendingUpIcon className="h-4 w-4 mr-2 text-emerald-500" />
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
              <div className="flex items-center mt-1 text-xs">
                {recentTrend > 0 ? (
                  <>
                    <ArrowUpIcon className="h-3 w-3 text-red-500 mr-1" />
                    <span className="text-red-500">{Math.abs(recentTrend).toFixed(1)}% increase</span>
                  </>
                ) : recentTrend < 0 ? (
                  <>
                    <ArrowDownIcon className="h-3 w-3 text-emerald-500 mr-1" />
                    <span className="text-emerald-500">{Math.abs(recentTrend).toFixed(1)}% decrease</span>
                  </>
                ) : (
                  <span className="text-slate-500">No change</span>
                )}
                <span className="text-slate-400 ml-1">from previous period</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="pb-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center">
                <PieChartIcon className="h-4 w-4 mr-2 text-blue-500" />
                Top Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expensesByCategory.length > 0 ? (
                <>
                  <div className="text-2xl font-bold">
                    {expensesByCategory.sort((a, b) => b.value - a.value)[0]?.name || "None"}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {formatCurrency(expensesByCategory.sort((a, b) => b.value - a.value)[0]?.value || 0)}
                  </div>
                </>
              ) : (
                <div className="text-slate-500 dark:text-slate-400">No expenses yet</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="overflow-hidden border-none shadow-md">
            <CardHeader className="pb-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center">
                <BarChart3Icon className="h-4 w-4 mr-2 text-purple-500" />
                Total Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expensesByCategory.length}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {expensesByCategory.length > 0
                  ? `${expensesByCategory.length} active categories`
                  : "No active categories"}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="mt-8">
        <Tabs defaultValue="pie">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Spending by Category</h3>
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
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {expensesByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[300px] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                      <div className="mb-4">
                        <Image
                          src="/placeholder.svg?height=100&width=100"
                          alt="No data"
                          width={100}
                          height={100}
                          className="opacity-50"
                        />
                      </div>
                      <p>No expense data to display</p>
                      <p className="text-sm mt-2">Add your first expense to see insights</p>
                    </div>
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
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Bar dataKey="value" name="Amount">
                            {expensesByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-[300px] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                      <div className="mb-4">
                        <Image
                          src="/placeholder.svg?height=100&width=100"
                          alt="No data"
                          width={100}
                          height={100}
                          className="opacity-50"
                        />
                      </div>
                      <p>No expense data to display</p>
                      <p className="text-sm mt-2">Add your first expense to see insights</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="trend" className="mt-0">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={expensesByMonth}>
                        <defs>
                          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `₹${value}`} />
                        <Tooltip formatter={(value) => formatCurrency(value as number)} />
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
                </TabsContent>
              </CardContent>
            </Card>
          </motion.div>
        </Tabs>
      </div>
    </motion.div>
  )
}

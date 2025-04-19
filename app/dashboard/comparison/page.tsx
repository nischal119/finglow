"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import type { Income, Expense } from "@/lib/types";

export default function ComparisonPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchData = async () => {
    try {
      // Fetch expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });

      if (expensesError) throw expensesError;

      // Fetch incomes
      const { data: incomesData, error: incomesError } = await supabase
        .from("incomes")
        .select("*")
        .order("date", { ascending: false });

      if (incomesError) throw incomesError;

      // Transform data
      const transformedExpenses = expensesData.map((expense) => ({
        ...expense,
        date: new Date(expense.date),
        amount: Number(expense.amount),
      }));

      const transformedIncomes = incomesData.map((income) => ({
        ...income,
        date: new Date(income.date),
        amount: Number(income.amount),
      }));

      setExpenses(transformedExpenses);
      setIncomes(transformedIncomes);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up real-time subscriptions
    const expensesSubscription = supabase
      .channel("expenses-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses" },
        () => fetchData()
      )
      .subscribe();

    const incomesSubscription = supabase
      .channel("incomes-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incomes" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      expensesSubscription.unsubscribe();
      incomesSubscription.unsubscribe();
    };
  }, [supabase]);

  const comparisonData = useMemo(() => {
    const monthMap = new Map<
      string,
      { income: number; expense: number; profit: number }
    >();

    // Get the last 12 months
    const today = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${d.getMonth() + 1}`;
      months.push({
        key: monthKey,
        name: d.toLocaleString("default", { month: "short", year: "2-digit" }),
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

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  const totalProfit = totalIncome - totalExpenses;

  return (
    <div className="space-y-8 p-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-600 dark:text-blue-400">
              Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {incomes.length} records
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-600 dark:text-red-400">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {expenses.length} records
            </p>
          </CardContent>
        </Card>

        <Card
          className={
            totalProfit >= 0
              ? "bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-emerald-500/20"
              : "bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20"
          }
        >
          <CardHeader className="pb-2">
            <CardTitle
              className={
                totalProfit >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-orange-600 dark:text-orange-400"
              }
            >
              Net Profit/Loss
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalProfit >= 0 ? "Net Profit" : "Net Loss"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income vs Expenses (Last 12 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `₹${value}`} />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  animationDuration={200}
                />
                <Legend />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="profit"
                  name="Profit/Loss"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

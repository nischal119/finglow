"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function EmptyExpenses() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-48 h-48 mb-8">
        <Image
          src="/empty-state.svg"
          alt="No expenses"
          width={192}
          height={192}
          className="w-full h-full"
        />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        No expenses yet
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm">
        Add your first expense to start tracking your spending and see insights
        about your financial habits.
      </p>
    </div>
  );
}

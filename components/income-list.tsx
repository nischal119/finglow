import { formatDate } from "@/lib/utils";
import { Income } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Edit2Icon, Trash2Icon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

interface IncomeListProps {
  incomes: Income[];
  onEdit: (income: Income) => void;
  onDelete: (income: Income) => void;
}

export function IncomeList({ incomes, onEdit, onDelete }: IncomeListProps) {
  return (
    <div className="space-y-4">
      <AnimatePresence>
        {incomes.map((income) => (
          <motion.div
            key={income.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h3 className="font-medium text-slate-900 dark:text-slate-100">
                  {income.description}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {income.source || "No source specified"}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {formatDate(income.date)}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(income.amount)}
                </p>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(income)}
                    className="h-8 w-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  >
                    <Edit2Icon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(income)}
                    className="h-8 w-8 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

import { DollarSignIcon } from "lucide-react";

export function EmptyIncomes() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-800 rounded-xl">
      <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
        <DollarSignIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
        No income records yet
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
        Start tracking your income by clicking the "Add Income" button above.
      </p>
    </div>
  );
}

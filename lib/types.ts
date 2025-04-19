export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
  categoryName: string;
  categoryColor: string;
  custom_category?: string | null;
}

export interface Income {
  id: string;
  description: string;
  amount: number;
  date: Date;
  source?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

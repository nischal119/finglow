import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { addDays, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | null): string {
  if (!date) return "";
  return format(date, "MMM d, yyyy");
}

export function getDateRangeText(from: Date | null, to: Date | null): string {
  if (!from && !to) return "Select a date range";
  if (from && !to) return `From ${formatDate(from)}`;
  if (!from && to) return `Until ${formatDate(to)}`;
  return `${formatDate(from)} - ${formatDate(to)}`;
}

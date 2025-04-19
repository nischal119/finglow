"use client";

import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, FilterIcon, XIcon } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import { motion } from "framer-motion";
import { DateRangePicker } from "@/components/date-range-picker";

interface FilterBarProps {
  categories: Category[];
  filterCategory: string | null;
  setFilterCategory: (category: string | null) => void;
  dateRange: DateRange | undefined;
  setDateRange: (dateRange: DateRange | undefined) => void;
}

export function FilterBar({
  categories,
  filterCategory,
  setFilterCategory,
  dateRange,
  setDateRange,
}: FilterBarProps) {
  const handleCategoryChange = (value: string) => {
    setFilterCategory(value === "all" ? null : value);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  const handleClearFilters = () => {
    setFilterCategory(null);
    setDateRange(undefined);
  };

  const hasActiveFilters =
    filterCategory || (dateRange && (dateRange.from || dateRange.to));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center"
    >
      <div className="w-full sm:w-48">
        <Select
          value={filterCategory || "all"}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DateRangePicker
        date={dateRange}
        setDate={handleDateRangeChange}
        align="start"
        className="w-full sm:w-auto"
      />

      {hasActiveFilters && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleClearFilters}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-auto"
        >
          Clear filters
        </motion.button>
      )}
    </motion.div>
  );
}

"use client"

import type { Category } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, FilterIcon, XIcon } from "lucide-react"
import { cn, formatDate } from "@/lib/utils"
import type { DateRange } from "react-day-picker"
import { motion } from "framer-motion"

interface FilterBarProps {
  categories: Category[]
  filterCategory: string | null
  setFilterCategory: (category: string | null) => void
  dateRange: DateRange
  setDateRange: (range: DateRange) => void
}

export function FilterBar({ categories, filterCategory, setFilterCategory, dateRange, setDateRange }: FilterBarProps) {
  const clearFilters = () => {
    setFilterCategory(null)
    setDateRange({ from: null, to: null })
  }

  const hasActiveFilters = filterCategory || dateRange.from || dateRange.to

  return (
    <motion.div
      className="flex flex-wrap gap-3 items-center mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2">
        <FilterIcon className="h-4 w-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filters:</span>
      </div>

      <Select
        value={filterCategory || "all"}
        onValueChange={(value) => setFilterCategory(value === "all" ? null : value)}
      >
        <SelectTrigger className="h-9 w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }} />
                <span>{category.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "h-9 justify-start text-left font-normal",
              !dateRange.from && !dateRange.to && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
                </>
              ) : (
                formatDate(dateRange.from)
              )
            ) : (
              <span>Date Range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.from || new Date()}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-9 px-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <XIcon className="h-4 w-4 mr-1" />
          Clear Filters
        </Button>
      )}
    </motion.div>
  )
}

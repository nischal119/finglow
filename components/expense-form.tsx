"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import type { Category, Expense } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { OTHER_CATEGORY_ID } from "@/lib/data";

interface ExpenseFormProps {
  categories: Category[];
  editingExpense: Expense | null;
  onClose: () => void;
  onSubmit: () => void;
  onExpenseChange?: () => void;
}

export function ExpenseForm({
  categories,
  editingExpense,
  onClose,
  onSubmit,
  onExpenseChange,
}: ExpenseFormProps) {
  const [description, setDescription] = useState(
    editingExpense?.description || ""
  );
  const [amount, setAmount] = useState(
    editingExpense?.amount?.toString() || ""
  );
  const [category, setCategory] = useState(
    editingExpense?.custom_category ? "other" : editingExpense?.category || ""
  );
  const [customCategory, setCustomCategory] = useState(
    editingExpense?.custom_category || ""
  );
  const [date, setDate] = useState(editingExpense?.date || new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get the current user's ID
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const expenseData = {
        description,
        amount: parseFloat(amount),
        category_id: category,
        date: date.toISOString(),
        custom_category: category === OTHER_CATEGORY_ID ? customCategory : null,
        user_id: user.id,
      };

      if (editingExpense) {
        const { error } = await supabase
          .from("expenses")
          .update(expenseData)
          .eq("id", editingExpense.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Expense updated successfully",
        });
      } else {
        const { error } = await supabase.from("expenses").insert([expenseData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Expense added successfully",
        });
      }

      onExpenseChange?.();
      onSubmit();
    } catch (error: any) {
      console.error("Error saving expense:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save expense",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="w-[95%] sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingExpense ? "Edit Expense" : "Add New Expense"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter expense description"
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              step="0.01"
              min="0"
              required
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="w-full">
                {categories
                  .filter(
                    (cat) =>
                      cat.id !== OTHER_CATEGORY_ID && cat.name !== "Other"
                  )
                  .map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span>{cat.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                <SelectItem value={OTHER_CATEGORY_ID}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: "#6b7280" }}
                    />
                    <span>Other</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {category === OTHER_CATEGORY_ID && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2"
              >
                <Label htmlFor="customCategory">Custom Category Name</Label>
                <Input
                  id="customCategory"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter your custom category name"
                  required={category === OTHER_CATEGORY_ID}
                  className="w-full"
                />
              </motion.div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500 hover:from-emerald-600 hover:via-emerald-500 hover:to-emerald-600 text-white rounded-lg shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10">
                {isSubmitting ? "Saving..." : editingExpense ? "Update" : "Add"}
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ x: "-100%" }}
                whileHover={{ x: "0%" }}
                transition={{ duration: 0.3 }}
              />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

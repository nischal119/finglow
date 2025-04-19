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

interface ExpenseFormProps {
  categories: Category[];
  editingExpense: Expense | null;
  onClose: () => void;
  onSubmit: () => void;
}

export function ExpenseForm({
  categories,
  editingExpense,
  onClose,
  onSubmit,
}: ExpenseFormProps) {
  const [description, setDescription] = useState(
    editingExpense?.description || ""
  );
  const [amount, setAmount] = useState(editingExpense?.amount.toString() || "");
  const [category, setCategory] = useState(editingExpense?.category || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const expenseData = {
        description,
        amount: parseFloat(amount),
        category_id: category,
        date: new Date().toISOString(),
        user_id: (await supabase.auth.getUser()).data.user?.id,
      };

      if (editingExpense) {
        await supabase
          .from("expenses")
          .update(expenseData)
          .eq("id", editingExpense.id);
      } else {
        await supabase.from("expenses").insert([expenseData]);
      }

      toast({
        title: "Success",
        description: editingExpense
          ? "Expense updated successfully"
          : "Expense added successfully",
      });

      onSubmit();
      onClose();
    } catch (error) {
      console.error("Error saving expense:", error);
      toast({
        title: "Error",
        description: "Failed to save expense. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
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
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingExpense ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

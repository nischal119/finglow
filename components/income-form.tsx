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
import { createClient } from "@/lib/supabase/client";
import type { Income } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

interface IncomeFormProps {
  editingIncome: Income | null;
  onClose: () => void;
  onSubmit: () => void;
  onIncomeChange?: () => void;
}

export function IncomeForm({
  editingIncome,
  onClose,
  onSubmit,
  onIncomeChange,
}: IncomeFormProps) {
  const [description, setDescription] = useState(
    editingIncome?.description || ""
  );
  const [amount, setAmount] = useState(editingIncome?.amount?.toString() || "");
  const [source, setSource] = useState(editingIncome?.source || "");
  const [date, setDate] = useState(editingIncome?.date || new Date());
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

      const incomeData = {
        description,
        amount: parseFloat(amount),
        date: date.toISOString(),
        source,
        user_id: user.id,
      };

      if (editingIncome) {
        const { error } = await supabase
          .from("incomes")
          .update(incomeData)
          .eq("id", editingIncome.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Income updated successfully",
        });
      } else {
        const { error } = await supabase.from("incomes").insert([incomeData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Income added successfully",
        });
      }

      onIncomeChange?.();
      onSubmit();
    } catch (error: any) {
      console.error("Error saving income:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save income",
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
            {editingIncome ? "Edit Income" : "Add New Income"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter income description"
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
            <Label htmlFor="source">Source (Optional)</Label>
            <Input
              id="source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="Enter income source"
              className="w-full"
            />
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
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 hover:from-blue-600 hover:via-blue-500 hover:to-blue-600 text-white rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10">
                {isSubmitting ? "Saving..." : editingIncome ? "Update" : "Add"}
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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

export function AddIncomeButton({
  onIncomeChange,
}: {
  onIncomeChange?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 hover:from-blue-600 hover:via-blue-500 hover:to-blue-600 text-white rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
      >
        Add Income
      </Button>
      {isOpen && (
        <IncomeForm
          editingIncome={null}
          onClose={() => setIsOpen(false)}
          onSubmit={() => setIsOpen(false)}
          onIncomeChange={onIncomeChange}
        />
      )}
    </>
  );
}

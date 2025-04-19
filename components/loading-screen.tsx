"use client";

import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

export function LoadingScreen() {
  const { loading } = useAuth();

  if (!loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-50 flex items-center justify-center"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-lg font-medium text-muted-foreground">Loading...</p>
      </div>
    </motion.div>
  );
}

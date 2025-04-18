"use client";

import { motion } from "framer-motion";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        {/* Dashboard skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-[140px] rounded-lg bg-card p-6 animate-pulse"
            />
          ))}
        </div>

        {/* Expenses list skeleton */}
        <div className="space-y-4">
          <div className="h-10 w-32 bg-card rounded animate-pulse" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-card animate-pulse" />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

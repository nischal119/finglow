"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-12 h-12 border-t-2 border-b-2 border-gray-900 dark:border-gray-100 rounded-full"
        />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </motion.div>
    </div>
  );
}

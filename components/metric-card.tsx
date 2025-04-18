"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
  emptyState?: string;
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  className,
  iconClassName,
  emptyState,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
      whileHover={{ scale: 1.02 }}
      className="w-full"
    >
      <Card className={cn("h-[140px] flex flex-col", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className={cn("p-2 rounded-full bg-background/10", iconClassName)}
          >
            <Icon className="w-4 h-4" />
          </motion.div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center">
          {value !== undefined && value !== null && value !== "" ? (
            <>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.2 }}
                className="text-2xl font-bold"
              >
                {value}
              </motion.div>
              {description && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.3 }}
                  className="text-xs text-muted-foreground mt-1"
                >
                  {description}
                </motion.p>
              )}
            </>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.2 }}
              className="text-sm text-muted-foreground text-center"
            >
              {emptyState || "No data available"}
            </motion.p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

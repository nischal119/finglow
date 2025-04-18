"use client"

import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function AuthBackground() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === "dark"

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 1440 900"
        className="opacity-20 dark:opacity-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: isDark ? 0.1 : 0.2 }}
        transition={{ duration: 0.5 }}
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDark ? "#10b981" : "#10b981"} />
            <stop offset="100%" stopColor={isDark ? "#0d9488" : "#0ea5e9"} />
          </linearGradient>
        </defs>
        {/* Animated circles */}
        <motion.circle
          cx="10%"
          cy="20%"
          r="80"
          fill="url(#grad1)"
          initial={{ scale: 0.8 }}
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.7, 0.9, 0.7],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.circle
          cx="70%"
          cy="10%"
          r="120"
          fill="url(#grad1)"
          initial={{ scale: 0.8 }}
          animate={{
            scale: [1, 0.8, 1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.circle
          cx="80%"
          cy="60%"
          r="100"
          fill="url(#grad1)"
          initial={{ scale: 0.8 }}
          animate={{
            scale: [0.7, 1, 0.7],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.circle
          cx="30%"
          cy="70%"
          r="150"
          fill="url(#grad1)"
          initial={{ scale: 0.8 }}
          animate={{
            scale: [0.9, 1.1, 0.9],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 9,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.circle
          cx="50%"
          cy="30%"
          r="70"
          fill="url(#grad1)"
          initial={{ scale: 0.8 }}
          animate={{
            scale: [1.1, 0.9, 1.1],
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 7,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      </motion.svg>
    </div>
  )
}

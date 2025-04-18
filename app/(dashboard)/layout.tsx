import type React from "react"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/toaster"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Navbar />
      <main className="container mx-auto px-4 py-8">{children}</main>
      <Toaster />
    </div>
  )
}

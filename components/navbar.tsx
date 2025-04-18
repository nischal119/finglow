"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  MoonIcon,
  SunIcon,
  MenuIcon,
  LogOutIcon,
  UserIcon,
  HomeIcon,
  PieChartIcon,
  SettingsIcon,
  TrashIcon,
  CreditCardIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)

    const fetchUser = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error fetching session:", error)
          setUser(null)
        } else {
          setUser(session?.user || null)
        }
      } catch (error) {
        console.error("Error in fetchUser:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }

      router.push("/auth/login")
      router.refresh()
      toast({
        title: "Signed out",
        description: "You have been successfully signed out",
      })
    } catch (error: any) {
      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAccount = async () => {
    try {
      // First delete user data
      if (user?.id) {
        // Delete expenses
        await supabase.from("expenses").delete().eq("user_id", user.id)

        // Delete categories
        await supabase.from("categories").delete().eq("user_id", user.id)

        // Delete profile
        await supabase.from("profiles").delete().eq("id", user.id)

        // Sign out
        await supabase.auth.signOut()

        router.push("/auth/login")
        router.refresh()

        toast({
          title: "Account deleted",
          description: "Your account has been successfully deleted",
        })
      }
    } catch (error: any) {
      console.error("Error deleting account:", error)
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const userInitials = user?.user_metadata?.full_name
    ? getInitials(user.user_metadata.full_name)
    : user?.email
      ? user.email.charAt(0).toUpperCase()
      : "U"

  const isActive = (path: string) => {
    return pathname === path
  }

  if (!mounted) return null

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Menu">
                <MenuIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <div className="flex flex-col gap-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">F</span>
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                    FinGlow
                  </span>
                </div>
                <nav className="flex flex-col gap-2">
                  <Link
                    href="/"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                      isActive("/")
                        ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-50"
                        : "hover:bg-accent"
                    }`}
                  >
                    <HomeIcon className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/analytics"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                      isActive("/analytics")
                        ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-50"
                        : "hover:bg-accent"
                    }`}
                  >
                    <PieChartIcon className="h-4 w-4" />
                    <span>Analytics</span>
                  </Link>
                  <Link
                    href="/expenses"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                      isActive("/expenses")
                        ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-50"
                        : "hover:bg-accent"
                    }`}
                  >
                    <CreditCardIcon className="h-4 w-4" />
                    <span>Expenses</span>
                  </Link>
                  <Link
                    href="/profile"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                      isActive("/profile")
                        ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-50"
                        : "hover:bg-accent"
                    }`}
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                      isActive("/settings")
                        ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-50"
                        : "hover:bg-accent"
                    }`}
                  >
                    <SettingsIcon className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent hidden sm:inline-block">
              FinGlow
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {!loading && user && (
            <>
              <Link
                href="/"
                className={`text-sm font-medium transition-colors ${
                  isActive("/") ? "text-emerald-600 dark:text-emerald-400" : "hover:text-emerald-500"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/analytics"
                className={`text-sm font-medium transition-colors ${
                  isActive("/analytics") ? "text-emerald-600 dark:text-emerald-400" : "hover:text-emerald-500"
                }`}
              >
                Analytics
              </Link>
              <Link
                href="/expenses"
                className={`text-sm font-medium transition-colors ${
                  isActive("/expenses") ? "text-emerald-600 dark:text-emerald-400" : "hover:text-emerald-500"
                }`}
              >
                Expenses
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={theme}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {theme === "dark" ? <SunIcon className="h-5 w-5 text-yellow-400" /> : <MoonIcon className="h-5 w-5" />}
              </motion.div>
            </AnimatePresence>
          </Button>

          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user?.user_metadata?.avatar_url || ""}
                          alt={user?.user_metadata?.full_name || user?.email || "User"}
                        />
                        <AvatarFallback className="bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {user?.user_metadata?.full_name && (
                          <p className="font-medium">{user.user_metadata.full_name}</p>
                        )}
                        {user?.email && <p className="text-xs text-muted-foreground">{user.email}</p>}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Edit Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="cursor-pointer">
                        <SettingsIcon className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                      <LogOutIcon className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteAlert(true)}
                      className="cursor-pointer text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <TrashIcon className="mr-2 h-4 w-4" />
                      <span>Delete Account</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/auth/login">Login</Link>
                  </Button>
                  <Button asChild variant="default" size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                    <Link href="/auth/signup">Sign up</Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-500 hover:bg-red-600">
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  )
}

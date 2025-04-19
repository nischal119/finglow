"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
  UserCircle,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const { toast } = useToast();
  const { signOut } = useAuth();

  useEffect(() => {
    setMounted(true);

    const fetchUser = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error fetching session:", error);
          setUser(null);
        } else {
          setUser(session?.user || null);
        }
      } catch (error) {
        console.error("Error in fetchUser:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleDeleteAccount = async () => {
    try {
      // First delete user data
      if (user?.id) {
        // Delete expenses
        await supabase.from("expenses").delete().eq("user_id", user.id);

        // Delete categories
        await supabase.from("categories").delete().eq("user_id", user.id);

        // Delete profile
        await supabase.from("profiles").delete().eq("id", user.id);

        // Sign out
        await signOut();

        toast({
          title: "Account deleted",
          description: "Your account has been successfully deleted",
        });
      }
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const userInitials = user?.user_metadata?.full_name
    ? getInitials(user.user_metadata.full_name)
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : "U";

  const isActive = (path: string) => {
    return pathname === path;
  };

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Icons.logo className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">FinGlow</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/dashboard"
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/expenses"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/dashboard/expenses"
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              Expenses
            </Link>
            <Link
              href="/dashboard/analytics"
              className={cn(
                "transition-colors hover:text-foreground/80",
                pathname === "/dashboard/analytics"
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              Analytics
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="mr-2"
          >
            {theme === "dark" ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4">
                <Link
                  href="/dashboard"
                  className={cn(
                    "flex items-center gap-2 text-lg font-medium transition-colors hover:text-foreground/80",
                    pathname === "/dashboard"
                      ? "text-foreground"
                      : "text-foreground/60"
                  )}
                >
                  <HomeIcon className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/expenses"
                  className={cn(
                    "flex items-center gap-2 text-lg font-medium transition-colors hover:text-foreground/80",
                    pathname === "/dashboard/expenses"
                      ? "text-foreground"
                      : "text-foreground/60"
                  )}
                >
                  <CreditCardIcon className="h-5 w-5" />
                  Expenses
                </Link>
                <Link
                  href="/dashboard/analytics"
                  className={cn(
                    "flex items-center gap-2 text-lg font-medium transition-colors hover:text-foreground/80",
                    pathname === "/dashboard/analytics"
                      ? "text-foreground"
                      : "text-foreground/60"
                  )}
                >
                  <PieChartIcon className="h-5 w-5" />
                  Analytics
                </Link>
              </nav>
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserCircle className="h-5 w-5" />
                <span className="sr-only">Open user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="font-medium">
                {user?.email}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

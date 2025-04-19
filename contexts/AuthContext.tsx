"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

const PUBLIC_ROUTES = ["/auth/login", "/auth/signup", "/auth/forgot-password"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    // Check active sessions and sets the user
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (mounted) {
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          setLoading(false);

          // Handle routing based on auth state
          if (!currentUser && !PUBLIC_ROUTES.includes(pathname)) {
            router.push("/auth/login");
          } else if (currentUser && PUBLIC_ROUTES.includes(pathname)) {
            router.push("/dashboard");
          }
        }
      } catch (error) {
        console.error("Error checking auth session:", error);
        if (mounted) {
          setLoading(false);
          if (!PUBLIC_ROUTES.includes(pathname)) {
            router.push("/auth/login");
          }
        }
      }
    };

    initializeAuth();

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (mounted) {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setLoading(false);

        // Handle routing based on auth state change
        if (!currentUser && !PUBLIC_ROUTES.includes(pathname)) {
          router.push("/auth/login");
        } else if (currentUser && PUBLIC_ROUTES.includes(pathname)) {
          router.push("/dashboard");
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [pathname]);

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear any local state
      setUser(null);

      // Use router for navigation
      router.push("/auth/login");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
      // If there's an error, still try to redirect using router
      router.push("/auth/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

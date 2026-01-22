"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getClient } from "@/lib/supabase/client";
import { clearTokenCache } from "@/lib/api/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * AuthProvider - Single source of truth for authentication state
 * 
 * This provider:
 * 1. Initializes auth state ONCE on mount
 * 2. Listens for auth changes (login, logout, token refresh)
 * 3. Shares state with all consumers via context (no duplicate calls)
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = getClient();
    let mounted = true;

    // Get initial session - reads from cookies, fast
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return;

        // Only update if there's an actual change
        if (newSession?.access_token !== session?.access_token) {
          setSession(newSession);
          setUser(newSession?.user ?? null);
        }

        // Handle specific events
        if (event === "SIGNED_OUT") {
          clearTokenCache();
          queryClient.clear();
        } else if (event === "TOKEN_REFRESHED") {
          // Token was refreshed, clear old cached token
          clearTokenCache();
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty deps - only run once

  const signOut = useCallback(async () => {
    const supabase = getClient();
    clearTokenCache();
    await supabase.auth.signOut();
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isLoading,
      isAuthenticated: !!user,
      signOut,
    }),
    [user, session, isLoading, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuthContext - Access shared auth state
 * 
 * Use this instead of useAuth() to avoid duplicate Supabase calls
 */
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

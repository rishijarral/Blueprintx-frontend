"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClient } from "@/lib/supabase/client";
import { profileApi } from "@/lib/api/profile";
import { ROUTES } from "@/lib/constants/routes";
import { queryKeys } from "@/types/api";
import type { Profile } from "@/types/models";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Hook to access current auth state
 */
export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = getClient();
    let mounted = true;

    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error("Auth error:", error);
        if (mounted) {
          setIsLoading(false);
        }
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
  };
}

/**
 * Hook to get current user with profile data
 */
export function useUser() {
  const { user, session, isLoading: authLoading, isAuthenticated } = useAuth();

  const {
    data: profile,
    isLoading: profileLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => profileApi.getMe(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user,
    session,
    profile,
    isLoading: authLoading || (isAuthenticated && profileLoading),
    isAuthenticated,
    error,
  };
}

/**
 * Hook for signing in
 */
export function useSignIn() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const supabase = getClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      router.push(ROUTES.DASHBOARD);
    },
  });
}

/**
 * Hook for signing up
 */
export function useSignUp() {
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      email,
      password,
      userType,
      firstName,
      lastName,
      companyName,
    }: {
      email: string;
      password: string;
      userType: "gc" | "sub";
      firstName: string;
      lastName: string;
      companyName?: string;
    }) => {
      const supabase = getClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: userType,
            first_name: firstName,
            last_name: lastName,
            company_name: companyName,
          },
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      router.push(ROUTES.LOGIN + "?message=check-email");
    },
  });
}

/**
 * Hook for signing out
 */
export function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const supabase = getClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.clear();
      router.push(ROUTES.LOGIN);
    },
  });
}

/**
 * Hook for updating profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Profile>) => profileApi.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
  });
}

/**
 * Hook for password reset request
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const supabase = getClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    },
  });
}

/**
 * Hook for updating password
 */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (newPassword: string) => {
      const supabase = getClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
    },
  });
}

/**
 * Hook to get access token for API calls
 */
export function useAccessToken() {
  const { session } = useAuth();

  const getAccessToken = useCallback(async () => {
    if (session?.access_token) {
      return session.access_token;
    }

    const supabase = getClient();
    const {
      data: { session: freshSession },
    } = await supabase.auth.getSession();
    return freshSession?.access_token ?? null;
  }, [session]);

  return { getAccessToken, accessToken: session?.access_token };
}

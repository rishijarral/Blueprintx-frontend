"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClient } from "@/lib/supabase/client";
import { profileApi, type UpdateProfileInput } from "@/lib/api/profile";
import { clearTokenCache } from "@/lib/api/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { ROUTES } from "@/lib/constants/routes";
import { queryKeys } from "@/types/api";

/**
 * Hook to access current auth state
 * Uses shared AuthContext to avoid duplicate Supabase calls
 */
export function useAuth() {
  return useAuthContext();
}

/**
 * Hook to get current user with profile data
 * Profile is cached for 10 minutes to reduce API calls
 */
export function useUser() {
  const { user, session, isLoading: authLoading, isAuthenticated } = useAuthContext();

  const {
    data: profile,
    isLoading: profileLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => profileApi.getMe(),
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes - profile rarely changes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
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
  const { signOut } = useAuthContext();

  return useMutation({
    mutationFn: async () => {
      await signOut();
    },
    onSuccess: () => {
      router.push(ROUTES.LOGIN);
    },
  });
}

/**
 * Hook for updating profile
 * Uses the UpdateProfileInput type for type-safe updates
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => profileApi.updateMe(data),
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
 * Hook for changing email address
 * Sends a verification to the new email address
 */
export function useChangeEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newEmail: string) => {
      const supabase = getClient();
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate profile since email might be included
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
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

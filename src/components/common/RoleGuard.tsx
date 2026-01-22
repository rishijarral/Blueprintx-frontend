"use client";

import { type ReactNode } from "react";
import { useUser } from "@/hooks/useAuth";
import type { UserType } from "@/lib/constants/statuses";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserType[];
  fallback?: ReactNode;
}

/**
 * Conditionally renders children based on user role
 * Use this for showing/hiding UI elements based on user type
 */
export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { profile, isLoading } = useUser();

  if (isLoading) {
    return null;
  }

  if (!profile || !allowedRoles.includes(profile.user_type)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Shows content only to General Contractors
 */
export function GCOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["gc"]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

/**
 * Shows content only to Subcontractors
 */
export function SubOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGuard allowedRoles={["sub"]} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

"use client";

import { useUser } from "@/hooks/useAuth";
import { GCDashboard } from "@/components/features/dashboard/GCDashboard";
import { SubDashboard } from "@/components/features/dashboard/SubDashboard";
import { LoadingPage } from "@/components/common";

export default function DashboardPage() {
  const { user, profile, isLoading } = useUser();

  if (isLoading) {
    return <LoadingPage message="Loading dashboard..." />;
  }

  const userType = profile?.user_type || "gc";

  return userType === "gc" ? <GCDashboard /> : <SubDashboard />;
}

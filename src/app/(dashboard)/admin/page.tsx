"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Skeleton } from "@/components/ui";
import { adminApi } from "@/lib/api/admin";
import { queryKeys } from "@/types/api";
import {
  Users,
  Building2,
  ShieldCheck,
  FileText,
  Gavel,
  FileSignature,
  TrendingUp,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  UserPlus,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  variant?: "default" | "warning" | "success" | "info";
}

function StatCard({ title, value, description, icon, trend, variant = "default" }: StatCardProps) {
  const variantStyles = {
    default: "bg-muted/50",
    warning: "bg-warning/10",
    success: "bg-success/10",
    info: "bg-primary/10",
  };

  const iconVariantStyles = {
    default: "text-muted-foreground",
    warning: "text-warning",
    success: "text-success",
    info: "text-primary",
  };

  return (
    <Card variant="bordered">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">{value}</p>
              {trend && (
                <Badge variant="success" size="sm" className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {trend.value}
                </Badge>
              )}
            </div>
            {(description || trend?.label) && (
              <p className="text-xs text-muted-foreground">
                {trend?.label || description}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${variantStyles[variant]}`}>
            <span className={iconVariantStyles[variant]}>{icon}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
  return (
    <Card variant="bordered">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: () => adminApi.getStats(),
    refetchInterval: 60000, // Refresh every minute
  });

  if (error) {
    return (
      <Card variant="bordered">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Failed to load dashboard</h2>
          <p className="text-muted-foreground">
            Unable to fetch admin statistics. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      {stats && stats.pending_verifications > 0 && (
        <Card variant="bordered" className="border-warning/50 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/20">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium">
                    {stats.pending_verifications} pending verification{stats.pending_verifications !== 1 ? "s" : ""} require review
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Subcontractors are waiting to be verified
                  </p>
                </div>
              </div>
              <Link href="/admin/verifications">
                <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Review Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : stats ? (
          <>
            <StatCard
              title="Pending Verifications"
              value={stats.pending_verifications}
              description="Awaiting review"
              icon={<ShieldCheck className="h-6 w-6" />}
              variant={stats.pending_verifications > 0 ? "warning" : "success"}
            />
            <StatCard
              title="Total Subcontractors"
              value={stats.total_subcontractors}
              description={`${stats.verified_subcontractors} verified`}
              icon={<Building2 className="h-6 w-6" />}
              variant="info"
            />
            <StatCard
              title="Total Users"
              value={stats.total_users}
              description={`${stats.gc_users} GCs, ${stats.sub_users} Subs`}
              icon={<Users className="h-6 w-6" />}
            />
            <StatCard
              title="Recent Signups"
              value={stats.recent_signups_7d}
              description="Last 7 days"
              icon={<UserPlus className="h-6 w-6" />}
              variant="success"
            />
          </>
        ) : null}
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : stats ? (
          <>
            <StatCard
              title="Total Tenders"
              value={stats.total_tenders}
              description={`${stats.open_tenders} currently open`}
              icon={<FileText className="h-6 w-6" />}
            />
            <StatCard
              title="Total Bids"
              value={stats.total_bids}
              description="Across all tenders"
              icon={<Gavel className="h-6 w-6" />}
            />
            <StatCard
              title="Total Contracts"
              value={stats.total_contracts}
              description={`${stats.active_contracts} active`}
              icon={<FileSignature className="h-6 w-6" />}
            />
            <StatCard
              title="Recent Verifications"
              value={stats.recent_verifications_7d}
              description="Completed last 7 days"
              icon={<CheckCircle2 className="h-6 w-6" />}
              variant="success"
            />
          </>
        ) : null}
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card variant="bordered">
          <CardHeader>
            <CardTitle className="text-lg">Verification Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Review and approve subcontractor verification requests. Verify credentials, insurance, and licenses.
            </p>
            <Link href="/admin/verifications">
              <Button variant="outline" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                View Verifications
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardHeader>
            <CardTitle className="text-lg">Audit Log</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Track all admin actions including verifications, suspensions, and system changes.
            </p>
            <Link href="/admin/audit-log">
              <Button variant="outline" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                View Audit Log
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

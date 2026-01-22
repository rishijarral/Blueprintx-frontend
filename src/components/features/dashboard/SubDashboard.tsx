"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
} from "@/components/ui";
import { SkeletonStat } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common";
import { tendersApi, bidsApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import {
  formatDate,
  formatCurrency,
  formatRelativeTime,
} from "@/lib/utils/format";
import {
  TENDER_STATUS_COLORS,
  TENDER_STATUS_LABELS,
  BID_STATUS_COLORS,
  BID_STATUS_LABELS,
} from "@/lib/constants/statuses";
import {
  FileText,
  Gavel,
  TrendingUp,
  Clock,
  ArrowRight,
  Search,
  DollarSign,
  CheckCircle,
  Target,
  Award,
} from "lucide-react";

// Stat Card Component
function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color,
  isLoading,
  index = 0,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  color: "primary" | "success" | "warning" | "info";
  isLoading?: boolean;
  index?: number;
}) {
  const colorClasses = {
    primary: {
      bg: "bg-primary/10 dark:bg-primary/20",
      icon: "text-primary",
      gradient: "from-primary/5 to-transparent",
    },
    success: {
      bg: "bg-success/10 dark:bg-success/20",
      icon: "text-success",
      gradient: "from-success/5 to-transparent",
    },
    warning: {
      bg: "bg-warning/10 dark:bg-warning/20",
      icon: "text-warning",
      gradient: "from-warning/5 to-transparent",
    },
    info: {
      bg: "bg-info/10 dark:bg-info/20",
      icon: "text-info",
      gradient: "from-info/5 to-transparent",
    },
  };

  if (isLoading) {
    return <SkeletonStat />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="h-full"
    >
      <Card
        variant="default"
        className={cn(
          "relative overflow-hidden h-full",
          "hover:shadow-md hover:border-border",
          "transition-all duration-300",
        )}
      >
        {/* Subtle gradient background */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-50",
            colorClasses[color].gradient,
          )}
        />
        <CardContent className="relative p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
                {value}
              </p>
              {trend !== undefined && trendLabel && (
                <div className="flex items-center gap-1.5 pt-1">
                  <TrendingUp
                    className={cn(
                      "h-3.5 w-3.5 flex-shrink-0",
                      trend >= 0 ? "text-success" : "text-error rotate-180",
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      trend >= 0 ? "text-success" : "text-error",
                    )}
                  >
                    {trend >= 0 ? "+" : ""}
                    {trend}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {trendLabel}
                  </span>
                </div>
              )}
            </div>
            <div
              className={cn(
                "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl",
                colorClasses[color].bg,
              )}
            >
              <Icon className={cn("h-6 w-6", colorClasses[color].icon)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Quick Action Button Component
function QuickActionButton({
  href,
  icon: Icon,
  label,
  description,
  color,
  index,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  description: string;
  color: "primary" | "success" | "info" | "warning";
  index: number;
}) {
  const colorClasses = {
    primary: {
      bg: "bg-primary/10 dark:bg-primary/20",
      hoverBg: "group-hover:bg-primary/15 dark:group-hover:bg-primary/25",
      icon: "text-primary",
      border: "group-hover:border-primary/30",
    },
    success: {
      bg: "bg-success/10 dark:bg-success/20",
      hoverBg: "group-hover:bg-success/15 dark:group-hover:bg-success/25",
      icon: "text-success",
      border: "group-hover:border-success/30",
    },
    info: {
      bg: "bg-info/10 dark:bg-info/20",
      hoverBg: "group-hover:bg-info/15 dark:group-hover:bg-info/25",
      icon: "text-info",
      border: "group-hover:border-info/30",
    },
    warning: {
      bg: "bg-warning/10 dark:bg-warning/20",
      hoverBg: "group-hover:bg-warning/15 dark:group-hover:bg-warning/25",
      icon: "text-warning",
      border: "group-hover:border-warning/30",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.08, duration: 0.3 }}
    >
      <Link href={href} className="block h-full">
        <div
          className={cn(
            "group flex items-center gap-4 p-4 rounded-xl h-full",
            "bg-muted/30 dark:bg-muted/50",
            "border border-border/50",
            "hover:bg-muted/60 dark:hover:bg-muted/80",
            "transition-all duration-200",
            colorClasses[color].border,
          )}
        >
          <div
            className={cn(
              "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl",
              "transition-colors duration-200",
              colorClasses[color].bg,
              colorClasses[color].hoverBg,
            )}
          >
            <Icon className={cn("h-6 w-6", colorClasses[color].icon)} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground group-hover:text-foreground transition-colors">
              {label}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {description}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all flex-shrink-0" />
        </div>
      </Link>
    </motion.div>
  );
}

export function SubDashboard() {
  const { data: tendersData, isLoading: tendersLoading } = useQuery({
    queryKey: queryKeys.tenders.marketplace({ per_page: 5 }),
    queryFn: () => tendersApi.marketplace({ per_page: 5 }),
  });

  const { data: bidsData, isLoading: bidsLoading } = useQuery({
    queryKey: queryKeys.bids.list({ per_page: 5 }),
    queryFn: () => bidsApi.myBids({ per_page: 5 }),
  });

  const tenders = tendersData?.data || [];
  const bids = bidsData?.data || [];

  // Calculate stats
  const openTenders = tenders.length;
  const submittedBids = bids.filter(
    (b) => b.status === "submitted" || b.status === "under_review",
  ).length;
  const wonBids = bids.filter((b) => b.status === "awarded").length;
  const totalBidValue = bids.reduce((sum, b) => sum + (b.bid_amount || 0), 0);

  const isStatsLoading = tendersLoading || bidsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back! Here's your subcontracting overview and opportunities.
            </p>
          </div>
          <Link href={ROUTES.TENDERS} className="flex-shrink-0">
            <Button size="lg" leftIcon={<Search className="h-5 w-5" />}>
              Browse Tenders
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Open Tenders"
          value={openTenders}
          icon={FileText}
          trend={15}
          trendLabel="new this week"
          color="primary"
          isLoading={isStatsLoading}
          index={0}
        />
        <StatCard
          title="Active Bids"
          value={submittedBids}
          icon={Gavel}
          trendLabel="under review"
          color="warning"
          isLoading={isStatsLoading}
          index={1}
        />
        <StatCard
          title="Won Contracts"
          value={wonBids}
          icon={Award}
          trend={20}
          trendLabel="this quarter"
          color="success"
          isLoading={isStatsLoading}
          index={2}
        />
        <StatCard
          title="Total Bid Value"
          value={formatCurrency(totalBidValue)}
          icon={DollarSign}
          trend={12}
          trendLabel="vs last month"
          color="info"
          isLoading={isStatsLoading}
          index={3}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Available Tenders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Card variant="default" className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>New Opportunities</CardTitle>
              </div>
              <Link href={ROUTES.TENDERS}>
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {tendersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-20 rounded-xl bg-muted/50 animate-pulse"
                    />
                  ))}
                </div>
              ) : tenders.length === 0 ? (
                <EmptyState
                  illustration="clipboard"
                  title="No open tenders"
                  description="Check back later for new opportunities"
                />
              ) : (
                <div className="space-y-2">
                  {tenders.slice(0, 4).map((tender, index) => (
                    <motion.div
                      key={tender.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.08, duration: 0.3 }}
                    >
                      <Link
                        href={ROUTES.TENDER_DETAIL(tender.id)}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-xl p-3",
                          "bg-muted/30 hover:bg-muted/60",
                          "border border-transparent hover:border-border/50",
                          "transition-all duration-200",
                          "group",
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                            {tender.name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {tender.trade_category && (
                              <>
                                <span className="font-medium">
                                  {tender.trade_category}
                                </span>
                                <span>•</span>
                              </>
                            )}
                            {tender.estimated_value && (
                              <span className="font-medium text-foreground">
                                {formatCurrency(tender.estimated_value)}
                              </span>
                            )}
                            {tender.bid_due_date && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {formatDate(tender.bid_due_date)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <Badge
                          className={cn(
                            TENDER_STATUS_COLORS[tender.status],
                            "flex-shrink-0",
                          )}
                          size="sm"
                        >
                          {TENDER_STATUS_LABELS[tender.status]}
                        </Badge>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* My Bids */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <Card variant="default" className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 dark:bg-warning/20">
                  <Gavel className="h-5 w-5 text-warning" />
                </div>
                <CardTitle>My Recent Bids</CardTitle>
              </div>
              <Link href={ROUTES.BIDS}>
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {bidsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-20 rounded-xl bg-muted/50 animate-pulse"
                    />
                  ))}
                </div>
              ) : bids.length === 0 ? (
                <EmptyState
                  illustration="gavel"
                  title="No bids yet"
                  description="Browse tenders and submit your first bid"
                  action={{
                    label: "Browse Tenders",
                    onClick: () => (window.location.href = ROUTES.TENDERS),
                  }}
                />
              ) : (
                <div className="space-y-2">
                  {bids.slice(0, 4).map((bid, index) => (
                    <motion.div
                      key={bid.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + index * 0.08, duration: 0.3 }}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-xl p-3",
                        "bg-muted/30 hover:bg-muted/60",
                        "border border-transparent hover:border-border/50",
                        "transition-all duration-200",
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground truncate">
                          {bid.tender?.name || "Tender"}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" />
                            {formatCurrency(bid.bid_amount)}
                          </span>
                          <span>•</span>
                          <span>
                            {formatRelativeTime(bid.submitted_at || bid.created_at)}
                          </span>
                        </div>
                      </div>
                      <Badge
                        className={cn(BID_STATUS_COLORS[bid.status], "flex-shrink-0")}
                        size="sm"
                      >
                        {BID_STATUS_LABELS[bid.status]}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tips Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <Card
          variant="default"
          className={cn("relative overflow-hidden", "border-primary/20")}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent" />
          <CardContent className="relative p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div
                className={cn(
                  "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl",
                  "bg-primary/10 dark:bg-primary/20",
                )}
              >
                <TrendingUp className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-foreground mb-1">
                  Tips for Winning Bids
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Complete your profile with certifications and past projects to
                  stand out. Companies with complete profiles win 40% more contracts.
                </p>
              </div>
              <Link href={ROUTES.PROFILE} className="flex-shrink-0">
                <Button
                  variant="outline"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="w-full sm:w-auto"
                >
                  Complete Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <QuickActionButton
          href={ROUTES.TENDERS}
          icon={Search}
          label="Browse Tenders"
          description="Find new opportunities"
          color="primary"
          index={0}
        />
        <QuickActionButton
          href={ROUTES.BIDS}
          icon={Gavel}
          label="My Bids"
          description="Track your submissions"
          color="warning"
          index={1}
        />
        <QuickActionButton
          href={ROUTES.PROFILE}
          icon={CheckCircle}
          label="Update Profile"
          description="Complete your profile"
          color="success"
          index={2}
        />
        <QuickActionButton
          href={ROUTES.TASKS}
          icon={FileText}
          label="View Tasks"
          description="Manage your work"
          color="info"
          index={3}
        />
      </div>
    </div>
  );
}

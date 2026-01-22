"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Input,
  Select,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Avatar,
} from "@/components/ui";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common";
import { hiringApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils/format";
import type { HireRequest, HireRequestStatus } from "@/types/models";
import {
  Search,
  Users,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Send,
  Eye,
  DollarSign,
  Calendar,
  Building2,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "sent", label: "Sent" },
  { value: "viewed", label: "Viewed" },
  { value: "interested", label: "Interested" },
  { value: "negotiating", label: "Negotiating" },
  { value: "contract_sent", label: "Contract Sent" },
  { value: "contract_signed", label: "Contract Signed" },
  { value: "hired", label: "Hired" },
  { value: "declined", label: "Declined" },
  { value: "cancelled", label: "Cancelled" },
];

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "error" | "info" | "outline" | "glass";

const STATUS_CONFIG: Record<
  HireRequestStatus,
  { label: string; color: BadgeVariant; icon: React.ReactNode }
> = {
  draft: { label: "Draft", color: "secondary", icon: <FileText className="h-3 w-3" /> },
  pending: { label: "Pending", color: "warning", icon: <Clock className="h-3 w-3" /> },
  sent: { label: "Sent", color: "info", icon: <Send className="h-3 w-3" /> },
  viewed: { label: "Viewed", color: "info", icon: <Eye className="h-3 w-3" /> },
  interested: { label: "Interested", color: "success", icon: <CheckCircle className="h-3 w-3" /> },
  negotiating: { label: "Negotiating", color: "warning", icon: <MessageSquare className="h-3 w-3" /> },
  contract_sent: { label: "Contract Sent", color: "info", icon: <FileText className="h-3 w-3" /> },
  contract_signed: { label: "Signed", color: "success", icon: <CheckCircle className="h-3 w-3" /> },
  hired: { label: "Hired", color: "success", icon: <CheckCircle className="h-3 w-3" /> },
  declined: { label: "Declined", color: "error", icon: <XCircle className="h-3 w-3" /> },
  cancelled: { label: "Cancelled", color: "secondary", icon: <XCircle className="h-3 w-3" /> },
  expired: { label: "Expired", color: "secondary", icon: <AlertCircle className="h-3 w-3" /> },
};

type TabValue = "active" | "completed" | "all";

export default function HiringPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activeTab, setActiveTab] = useState<TabValue>("active");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.hiring.requests.list({
      search: search || undefined,
      status: statusFilter || undefined,
    }),
    queryFn: () =>
      hiringApi.requests.list({
        search: search || undefined,
        status: statusFilter || undefined,
        as_gc: true,
      }),
  });

  const requests = data?.data || [];

  // Filter by tab
  const filteredRequests = requests.filter((req) => {
    if (activeTab === "active") {
      return !["hired", "declined", "cancelled", "expired"].includes(req.status);
    }
    if (activeTab === "completed") {
      return ["hired", "declined", "cancelled", "expired"].includes(req.status);
    }
    return true;
  });

  // Count by status for tabs
  const activeCount = requests.filter(
    (r) => !["hired", "declined", "cancelled", "expired"].includes(r.status)
  ).length;
  const completedCount = requests.filter((r) =>
    ["hired", "declined", "cancelled", "expired"].includes(r.status)
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hiring Dashboard"
        description="Manage your hire requests and negotiations"
        breadcrumbs={[
          { label: "Dashboard", href: ROUTES.DASHBOARD },
          { label: "Hiring" },
        ]}
        actions={
          <Link href={ROUTES.MARKETPLACE}>
            <Button variant="primary" leftIcon={<Users className="h-4 w-4" />}>
              Find Subcontractors
            </Button>
          </Link>
        }
      />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Input
            placeholder="Search by company, project, or trade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="bg-card"
          />
        </div>
        <div className="w-full sm:w-52">
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="All Statuses"
            className="bg-card"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList>
          <TabsTrigger value="active">
            Active
            {activeCount > 0 && (
              <Badge variant="info" size="sm" className="ml-2">
                {activeCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            {completedCount > 0 && (
              <Badge variant="secondary" size="sm" className="ml-2">
                {completedCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <Card variant="bordered">
              <CardContent className="p-6">
                <EmptyState
                  icon={<Users className="h-8 w-8 text-muted-foreground" />}
                  title={
                    activeTab === "active"
                      ? "No active hire requests"
                      : activeTab === "completed"
                      ? "No completed hire requests"
                      : "No hire requests found"
                  }
                  description={
                    search || statusFilter
                      ? "Try adjusting your filters"
                      : "Start by finding subcontractors in the marketplace"
                  }
                  action={
                    !search && !statusFilter
                      ? {
                          label: "Browse Marketplace",
                          onClick: () => window.location.href = ROUTES.MARKETPLACE,
                        }
                      : {
                          label: "Clear Filters",
                          onClick: () => {
                            setSearch("");
                            setStatusFilter("");
                          },
                        }
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredRequests.map((request) => (
                <HireRequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function HireRequestCard({ request }: { request: HireRequest }) {
  const status = STATUS_CONFIG[request.status];
  const hasUnread = request.unread_messages > 0;

  return (
    <Card
      variant="bordered"
      className="hover:shadow-md transition-shadow group"
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <Avatar name={request.subcontractor.company_name} size="md" />
            <div className="min-w-0">
              <h3 className="font-semibold truncate">
                {request.subcontractor.company_name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" size="sm">
                  {request.trade}
                </Badge>
                {request.subcontractor.verified && (
                  <CheckCircle className="h-3.5 w-3.5 text-success" />
                )}
              </div>
            </div>
          </div>
          <Badge
            variant={status.color}
            size="sm"
            className="flex items-center gap-1"
          >
            {status.icon}
            {status.label}
          </Badge>
        </div>

        {/* Title */}
        <h4 className="font-medium text-sm mb-3 line-clamp-1">{request.title}</h4>

        {/* Project info */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
          <Building2 className="h-3.5 w-3.5" />
          <span className="truncate">{request.project_name}</span>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          {request.proposed_amount && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <DollarSign className="h-3.5 w-3.5" />
              <span>{formatCurrency(request.proposed_amount)}</span>
            </div>
          )}
          {request.estimated_start_date && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(request.estimated_start_date)}</span>
            </div>
          )}
        </div>

        {/* Messages indicator */}
        {hasUnread && (
          <div className="flex items-center gap-2 text-sm text-primary mb-4">
            <MessageSquare className="h-4 w-4" />
            <span className="font-medium">
              {request.unread_messages} new message{request.unread_messages > 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(request.updated_at)}
          </span>
          <Link href={ROUTES.HIRING_DETAIL(request.id)}>
            <Button
              variant="ghost"
              size="sm"
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
            >
              View
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

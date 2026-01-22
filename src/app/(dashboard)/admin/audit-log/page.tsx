"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Input,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common";
import { adminApi, type AdminAction, type AuditTargetType } from "@/lib/api/admin";
import { queryKeys } from "@/types/api";
import { formatDate, formatRelativeTime } from "@/lib/utils/format";
import {
  Search,
  SlidersHorizontal,
  ScrollText,
  ShieldCheck,
  ShieldX,
  UserPlus,
  UserMinus,
  AlertOctagon,
  CheckCircle,
  Trash2,
  Settings,
  Eye,
  Calendar,
  User,
  Filter,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const ACTION_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Actions" },
  { value: "verify_subcontractor", label: "Verify Subcontractor" },
  { value: "reject_subcontractor", label: "Reject Subcontractor" },
  { value: "grant_admin", label: "Grant Admin" },
  { value: "revoke_admin", label: "Revoke Admin" },
  { value: "suspend_user", label: "Suspend User" },
  { value: "unsuspend_user", label: "Unsuspend User" },
  { value: "delete_content", label: "Delete Content" },
  { value: "update_system_setting", label: "Update System Setting" },
  { value: "view_sensitive_data", label: "View Sensitive Data" },
];

const TARGET_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Types" },
  { value: "subcontractor", label: "Subcontractor" },
  { value: "profile", label: "Profile" },
  { value: "tender", label: "Tender" },
  { value: "bid", label: "Bid" },
  { value: "contract", label: "Contract" },
  { value: "review", label: "Review" },
  { value: "project", label: "Project" },
  { value: "system_setting", label: "System Setting" },
];

function getActionIcon(action: AdminAction) {
  switch (action) {
    case "verify_subcontractor":
      return <ShieldCheck className="h-4 w-4 text-success" />;
    case "reject_subcontractor":
      return <ShieldX className="h-4 w-4 text-destructive" />;
    case "grant_admin":
      return <UserPlus className="h-4 w-4 text-primary" />;
    case "revoke_admin":
      return <UserMinus className="h-4 w-4 text-warning" />;
    case "suspend_user":
      return <AlertOctagon className="h-4 w-4 text-destructive" />;
    case "unsuspend_user":
      return <CheckCircle className="h-4 w-4 text-success" />;
    case "delete_content":
      return <Trash2 className="h-4 w-4 text-destructive" />;
    case "update_system_setting":
      return <Settings className="h-4 w-4 text-muted-foreground" />;
    case "view_sensitive_data":
      return <Eye className="h-4 w-4 text-muted-foreground" />;
    default:
      return <ScrollText className="h-4 w-4 text-muted-foreground" />;
  }
}

function getActionLabel(action: AdminAction): string {
  const labels: Record<AdminAction, string> = {
    verify_subcontractor: "Verified Subcontractor",
    reject_subcontractor: "Rejected Subcontractor",
    grant_admin: "Granted Admin",
    revoke_admin: "Revoked Admin",
    suspend_user: "Suspended User",
    unsuspend_user: "Unsuspended User",
    delete_content: "Deleted Content",
    update_system_setting: "Updated System Setting",
    view_sensitive_data: "Viewed Sensitive Data",
  };
  return labels[action] || action;
}

function getActionBadgeVariant(action: AdminAction): "success" | "error" | "warning" | "secondary" {
  switch (action) {
    case "verify_subcontractor":
    case "unsuspend_user":
      return "success";
    case "reject_subcontractor":
    case "suspend_user":
    case "delete_content":
      return "error";
    case "revoke_admin":
      return "warning";
    default:
      return "secondary";
  }
}

export default function AuditLogPage() {
  // Filters
  const [actionFilter, setActionFilter] = useState("");
  const [targetTypeFilter, setTargetTypeFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch audit logs
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: queryKeys.admin.auditLog({
      action: actionFilter as AdminAction || undefined,
      target_type: targetTypeFilter as AuditTargetType || undefined,
      from_date: fromDate || undefined,
      to_date: toDate || undefined,
    }),
    queryFn: () =>
      adminApi.auditLog.list({
        action: actionFilter as AdminAction || undefined,
        target_type: targetTypeFilter as AuditTargetType || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        per_page: 100,
      }),
  });

  const logs = data?.data || [];

  const clearFilters = () => {
    setActionFilter("");
    setTargetTypeFilter("");
    setFromDate("");
    setToDate("");
  };

  const hasActiveFilters = actionFilter || targetTypeFilter || fromDate || toDate;

  if (error) {
    return (
      <Card variant="bordered">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Failed to load audit log</h2>
          <p className="text-muted-foreground">
            Unable to fetch audit log. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Audit Log</h2>
          <p className="text-sm text-muted-foreground">
            Track all admin actions and system changes
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          leftIcon={<RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />}
        >
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card variant="bordered">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Select
                  options={ACTION_OPTIONS}
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  placeholder="Filter by action"
                />
              </div>
              <div className="flex-1">
                <Select
                  options={TARGET_TYPE_OPTIONS}
                  value={targetTypeFilter}
                  onChange={(e) => setTargetTypeFilter(e.target.value)}
                  placeholder="Filter by type"
                />
              </div>
              <Button
                variant={showFilters ? "secondary" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="flex-shrink-0"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>

            {showFilters && (
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
                <div className="flex-1">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    From Date
                  </label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    leftIcon={<Calendar className="h-4 w-4" />}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    To Date
                  </label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    leftIcon={<Calendar className="h-4 w-4" />}
                  />
                </div>
              </div>
            )}

            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>Filters active</span>
                </div>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading..." : `${logs.length} log entries`}
        </p>
      </div>

      {/* Table */}
      {isLoading ? (
        <Card variant="bordered">
          <CardContent className="p-0">
            <SkeletonTable rows={10} cols={5} />
          </CardContent>
        </Card>
      ) : logs.length === 0 ? (
        <Card variant="bordered">
          <CardContent className="p-8">
            <EmptyState
              icon={<ScrollText className="h-12 w-12 text-muted-foreground" />}
              title="No audit logs found"
              description={
                hasActiveFilters
                  ? "No logs match your filters. Try adjusting your search criteria."
                  : "No admin actions have been recorded yet."
              }
              action={
                hasActiveFilters
                  ? {
                      label: "Clear Filters",
                      onClick: clearFilters,
                    }
                  : undefined
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Card variant="bordered">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <Badge variant={getActionBadgeVariant(log.action)} size="sm">
                          {getActionLabel(log.action)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {log.admin_name || log.admin_id.slice(0, 8)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <Badge variant="outline" size="sm" className="w-fit">
                          {log.target_type}
                        </Badge>
                        {log.target_id && (
                          <span className="text-xs text-muted-foreground font-mono mt-1">
                            {log.target_id.slice(0, 8)}...
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.details && Object.keys(log.details).length > 0 ? (
                        <div className="max-w-xs">
                          {Object.entries(log.details)
                            .slice(0, 2)
                            .map(([key, value]) => (
                              <div key={key} className="text-xs text-muted-foreground truncate">
                                <span className="font-medium">{key}:</span>{" "}
                                {typeof value === "string" ? value : JSON.stringify(value)}
                              </div>
                            ))}
                          {Object.keys(log.details).length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{Object.keys(log.details).length - 2} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm" title={formatDate(log.created_at)}>
                          {formatRelativeTime(log.created_at)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(log.created_at)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

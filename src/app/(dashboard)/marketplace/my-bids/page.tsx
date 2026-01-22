"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Select,
} from "@/components/ui";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common";
import { marketplaceApi } from "@/lib/api/marketplace";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import {
  FileText,
  Building2,
  Calendar,
  DollarSign,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
  Trophy,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "withdrawn", label: "Withdrawn" },
];

const statusConfig: Record<string, { icon: React.ReactNode; variant: "default" | "success" | "warning" | "error" | "outline" }> = {
  submitted: { icon: <Clock className="h-3 w-3" />, variant: "default" },
  under_review: { icon: <Clock className="h-3 w-3" />, variant: "warning" },
  shortlisted: { icon: <CheckCircle className="h-3 w-3" />, variant: "success" },
  accepted: { icon: <Trophy className="h-3 w-3" />, variant: "success" },
  rejected: { icon: <XCircle className="h-3 w-3" />, variant: "error" },
  withdrawn: { icon: <XCircle className="h-3 w-3" />, variant: "outline" },
};

export default function MyBidsPage() {
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.marketplace.myBids({ status: statusFilter || undefined }),
    queryFn: () =>
      marketplaceApi.bids.listMy({
        per_page: 50,
      }),
  });

  const bids = data?.data || [];

  // Client-side filter by status (API should support this, but as fallback)
  const filteredBids = statusFilter
    ? bids.filter((bid) => bid.status === statusFilter)
    : bids;

  // Group by status for summary
  const statusCounts = bids.reduce((acc, bid) => {
    acc[bid.status] = (acc[bid.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Bids"
        description="Track all your submitted bids across tenders"
        breadcrumbs={[
          { label: "Dashboard", href: ROUTES.DASHBOARD },
          { label: "Marketplace", href: "/marketplace" },
          { label: "My Bids" },
        ]}
        actions={
          <Link href="/marketplace">
            <Button variant="outline" leftIcon={<FileText className="h-4 w-4" />}>
              Browse Tenders
            </Button>
          </Link>
        }
      />

      {/* Summary Stats */}
      {!isLoading && bids.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card variant="bordered">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{bids.length}</p>
              <p className="text-xs text-muted-foreground">Total Bids</p>
            </CardContent>
          </Card>
          {Object.entries(statusCounts).map(([status, count]) => {
            const config = statusConfig[status] || statusConfig.submitted;
            return (
              <Card key={status} variant="bordered">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground capitalize">{status.replace(/_/g, " ")}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Filter */}
      <Card variant="bordered">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-48">
              <Select
                options={STATUS_OPTIONS}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                placeholder="Filter by status"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Loading..." : `${filteredBids.length} bids`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bids List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredBids.length === 0 ? (
        <Card variant="bordered">
          <CardContent className="p-6">
            <EmptyState
              icon={<FileText className="h-8 w-8 text-muted-foreground" />}
              title={statusFilter ? "No bids with this status" : "No bids yet"}
              description={
                statusFilter
                  ? "Try changing the filter"
                  : "Start bidding on tenders to see your submissions here"
              }
              action={
                !statusFilter
                  ? {
                      label: "Browse Tenders",
                      onClick: () => window.location.href = "/marketplace",
                    }
                  : {
                      label: "Clear Filter",
                      onClick: () => setStatusFilter(""),
                    }
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBids.map((bid) => {
            const config = statusConfig[bid.status] || statusConfig.submitted;
            return (
              <Card
                key={bid.id}
                variant="bordered"
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Left: Bid Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">
                          {bid.tender_name || "Tender"}
                        </h3>
                        <Badge variant={config.variant} className="flex items-center gap-1">
                          {config.icon}
                          {bid.status.replace(/_/g, " ")}
                        </Badge>
                        {bid.is_winning_bid && (
                          <Badge variant="success" className="flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            Winner
                          </Badge>
                        )}
                      </div>
                      
                      {bid.project_name && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                          <Building2 className="h-3.5 w-3.5" />
                          {bid.project_name}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-medium text-foreground">
                            {formatCurrency(bid.bid_amount / 100)}
                          </span>
                        </div>
                        {bid.proposed_timeline_days && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{bid.proposed_timeline_days} days</span>
                          </div>
                        )}
                        {bid.submitted_at && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Submitted {formatDate(bid.submitted_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Action */}
                    <div className="flex-shrink-0">
                      <Link href={`/marketplace/tenders/${bid.tender_id}`}>
                        <Button
                          variant="outline"
                          rightIcon={<ArrowRight className="h-4 w-4" />}
                        >
                          View Tender
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Breakdown preview */}
                  {bid.breakdown && bid.breakdown.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">Breakdown:</p>
                      <div className="flex flex-wrap gap-2">
                        {bid.breakdown.slice(0, 3).map((item, index) => (
                          <Badge key={index} variant="outline" size="sm">
                            {item.description}: {formatCurrency(item.total / 100)}
                          </Badge>
                        ))}
                        {bid.breakdown.length > 3 && (
                          <Badge variant="outline" size="sm">
                            +{bid.breakdown.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

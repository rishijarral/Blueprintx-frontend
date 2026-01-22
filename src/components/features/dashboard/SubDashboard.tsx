"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common";
import { tendersApi, bidsApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import { formatDate, formatCurrency, formatRelativeTime } from "@/lib/utils/format";
import { TENDER_STATUS_COLORS, TENDER_STATUS_LABELS, BID_STATUS_COLORS, BID_STATUS_LABELS } from "@/lib/constants/statuses";
import {
  FileText,
  Gavel,
  TrendingUp,
  Clock,
  ArrowRight,
  Search,
  DollarSign,
  CheckCircle,
  XCircle,
} from "lucide-react";

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
  const submittedBids = bids.filter((b) => b.status === "submitted" || b.status === "under_review").length;
  const wonBids = bids.filter((b) => b.status === "awarded").length;
  const totalBidValue = bids.reduce((sum, b) => sum + (b.bid_amount || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's your subcontracting overview."
        actions={
          <Link href={ROUTES.TENDERS}>
            <Button leftIcon={<Search className="h-4 w-4" />}>Browse Tenders</Button>
          </Link>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card variant="bordered">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Tenders</p>
                <p className="text-2xl font-bold">{openTenders}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Bids</p>
                <p className="text-2xl font-bold">{submittedBids}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Gavel className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Won Contracts</p>
                <p className="text-2xl font-bold">{wonBids}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bid Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalBidValue)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Available Tenders */}
        <Card variant="bordered">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">New Opportunities</CardTitle>
            <Link href={ROUTES.TENDERS}>
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {tendersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <SkeletonCard key={i} className="border-0 p-0" />
                ))}
              </div>
            ) : tenders.length === 0 ? (
              <EmptyState
                icon={<FileText className="h-8 w-8 text-muted-foreground" />}
                title="No open tenders"
                description="Check back later for new opportunities"
              />
            ) : (
              <div className="space-y-3">
                {tenders.map((tender) => (
                  <Link
                    key={tender.id}
                    href={ROUTES.TENDER_DETAIL(tender.id)}
                    className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{tender.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {tender.trade_category && (
                          <>
                            <span>{tender.trade_category}</span>
                            <span>•</span>
                          </>
                        )}
                        {tender.estimated_value && (
                          <span>{formatCurrency(tender.estimated_value)}</span>
                        )}
                        {tender.bid_due_date && (
                          <>
                            <span>•</span>
                            <Clock className="h-3 w-3" />
                            <span>Due {formatDate(tender.bid_due_date)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge className={TENDER_STATUS_COLORS[tender.status]}>
                      {TENDER_STATUS_LABELS[tender.status]}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Bids */}
        <Card variant="bordered">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">My Recent Bids</CardTitle>
            <Link href={ROUTES.BIDS}>
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {bidsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <SkeletonCard key={i} className="border-0 p-0" />
                ))}
              </div>
            ) : bids.length === 0 ? (
              <EmptyState
                icon={<Gavel className="h-8 w-8 text-muted-foreground" />}
                title="No bids yet"
                description="Browse tenders and submit your first bid"
                action={{
                  label: "Browse Tenders",
                  onClick: () => (window.location.href = ROUTES.TENDERS),
                }}
              />
            ) : (
              <div className="space-y-3">
                {bids.map((bid) => (
                  <div
                    key={bid.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{bid.tender?.name || "Tender"}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        <span>{formatCurrency(bid.bid_amount)}</span>
                        <span>•</span>
                        <span>{formatRelativeTime(bid.submitted_at || bid.created_at)}</span>
                      </div>
                    </div>
                    <Badge className={BID_STATUS_COLORS[bid.status]}>
                      {BID_STATUS_LABELS[bid.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips Card */}
      <Card variant="bordered" className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Tips for Winning Bids</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Complete your profile with certifications and past projects to stand out.
                Respond to tenders quickly and provide detailed scope breakdowns.
              </p>
              <Link href={ROUTES.PROFILE}>
                <Button variant="link" className="px-0 mt-2">
                  Complete Your Profile
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

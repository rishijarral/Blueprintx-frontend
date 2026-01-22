"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useUser } from "@/hooks/useAuth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input, Select } from "@/components/ui";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common";
import { tendersApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { TENDER_STATUS_COLORS, TENDER_STATUS_LABELS } from "@/lib/constants/statuses";
import { Search, FileText, Clock, DollarSign, MapPin, ArrowRight } from "lucide-react";

export default function TendersPage() {
  const { profile } = useUser();
  const [search, setSearch] = useState("");
  const [tradeFilter, setTradeFilter] = useState("");

  const isSubcontractor = profile?.user_type === "sub";

  const { data, isLoading } = useQuery({
    queryKey: isSubcontractor
      ? queryKeys.tenders.marketplace({ search: search || undefined })
      : queryKeys.tenders.list({ search: search || undefined }),
    queryFn: () =>
      isSubcontractor
        ? tendersApi.marketplace({ search: search || undefined })
        : tendersApi.list({ search: search || undefined }),
  });

  const tenders = data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isSubcontractor ? "Tender Marketplace" : "My Tenders"}
        description={
          isSubcontractor
            ? "Browse available tenders and submit your bids"
            : "Manage tenders for your projects"
        }
        breadcrumbs={[
          { label: "Dashboard", href: ROUTES.DASHBOARD },
          { label: "Tenders" },
        ]}
      />

      {/* Filters */}
      <Card variant="bordered">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search tenders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                options={[
                  { value: "", label: "All Trades" },
                  { value: "electrical", label: "Electrical" },
                  { value: "plumbing", label: "Plumbing" },
                  { value: "hvac", label: "HVAC" },
                  { value: "roofing", label: "Roofing" },
                  { value: "carpentry", label: "Carpentry" },
                  { value: "concrete", label: "Concrete" },
                  { value: "painting", label: "Painting" },
                ]}
                value={tradeFilter}
                onChange={(e) => setTradeFilter(e.target.value)}
                placeholder="All Trades"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tenders Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : tenders.length === 0 ? (
        <Card variant="bordered">
          <CardContent className="p-6">
            <EmptyState
              icon={<FileText className="h-8 w-8 text-muted-foreground" />}
              title={isSubcontractor ? "No open tenders" : "No tenders found"}
              description={
                isSubcontractor
                  ? "Check back later for new opportunities"
                  : "Create tenders from your project pages"
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tenders.map((tender) => (
            <Card key={tender.id} variant="bordered" className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{tender.name}</CardTitle>
                    {tender.trade_category && (
                      <Badge variant="secondary">{tender.trade_category}</Badge>
                    )}
                  </div>
                  <Badge className={TENDER_STATUS_COLORS[tender.status]}>
                    {TENDER_STATUS_LABELS[tender.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {tender.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {tender.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {tender.estimated_value && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatCurrency(tender.estimated_value)}</span>
                    </div>
                  )}
                  {tender.bid_due_date && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{formatDate(tender.bid_due_date)}</span>
                    </div>
                  )}
                </div>

                <Link href={ROUTES.TENDER_DETAIL(tender.id)}>
                  <Button variant="outline" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    {isSubcontractor ? "View & Bid" : "View Details"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

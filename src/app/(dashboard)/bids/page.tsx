"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge, Button } from "@/components/ui";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common";
import { bidsApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { BID_STATUS_COLORS, BID_STATUS_LABELS } from "@/lib/constants/statuses";
import { Gavel, Eye, Search } from "lucide-react";

export default function BidsPage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.bids.list(),
    queryFn: () => bidsApi.myBids(),
  });

  const bids = data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Bids"
        description="Track your submitted bids and their status"
        breadcrumbs={[
          { label: "Dashboard", href: ROUTES.DASHBOARD },
          { label: "My Bids" },
        ]}
        actions={
          <Link href={ROUTES.TENDERS}>
            <Button leftIcon={<Search className="h-4 w-4" />}>Browse Tenders</Button>
          </Link>
        }
      />

      <Card variant="bordered">
        {isLoading ? (
          <CardContent className="p-6">
            <SkeletonTable rows={5} cols={5} />
          </CardContent>
        ) : bids.length === 0 ? (
          <CardContent className="p-6">
            <EmptyState
              icon={<Gavel className="h-8 w-8 text-muted-foreground" />}
              title="No bids yet"
              description="Browse available tenders and submit your first bid"
              action={{
                label: "Browse Tenders",
                onClick: () => (window.location.href = ROUTES.TENDERS),
              }}
            />
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tender</TableHead>
                <TableHead>Bid Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bids.map((bid) => (
                <TableRow key={bid.id}>
                  <TableCell>
                    <p className="font-medium">{bid.tender?.name || "Tender"}</p>
                    {bid.tender?.trade_category && (
                      <p className="text-sm text-muted-foreground">{bid.tender.trade_category}</p>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(bid.bid_amount)}
                  </TableCell>
                  <TableCell>
                    <Badge className={BID_STATUS_COLORS[bid.status]}>
                      {BID_STATUS_LABELS[bid.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {bid.submitted_at ? formatDate(bid.submitted_at) : formatDate(bid.created_at)}
                  </TableCell>
                  <TableCell>
                    <Link href={ROUTES.TENDER_DETAIL(bid.tender_id)}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

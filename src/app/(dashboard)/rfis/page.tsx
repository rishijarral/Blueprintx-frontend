"use client";

import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge } from "@/components/ui";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common";
import { rfisApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import { formatDate } from "@/lib/utils/format";
import { RFI_STATUS_COLORS, RFI_STATUS_LABELS, PRIORITY_LABELS } from "@/lib/constants/statuses";
import { MessageSquare } from "lucide-react";

export default function RFIsPage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.rfis.list(),
    queryFn: () => rfisApi.list(),
  });

  const rfis = data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="All RFIs"
        description="View and manage RFIs across all your projects"
        breadcrumbs={[
          { label: "Dashboard", href: ROUTES.DASHBOARD },
          { label: "RFIs" },
        ]}
      />

      <Card variant="bordered">
        {isLoading ? (
          <CardContent className="p-6">
            <SkeletonTable rows={5} cols={5} />
          </CardContent>
        ) : rfis.length === 0 ? (
          <CardContent className="p-6">
            <EmptyState
              icon={<MessageSquare className="h-8 w-8 text-muted-foreground" />}
              title="No RFIs yet"
              description="Create RFIs from your project pages to track questions and information requests"
            />
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RFI #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rfis.map((rfi) => (
                <TableRow key={rfi.id}>
                  <TableCell>
                    <span className="font-mono text-sm">RFI-{String(rfi.number).padStart(3, "0")}</span>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{rfi.title}</p>
                    {rfi.category && (
                      <p className="text-sm text-muted-foreground">{rfi.category}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={RFI_STATUS_COLORS[rfi.status]}>
                      {RFI_STATUS_LABELS[rfi.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {rfi.priority ? (
                      <Badge variant="outline">{PRIORITY_LABELS[rfi.priority]}</Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {rfi.due_date ? formatDate(rfi.due_date) : "—"}
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

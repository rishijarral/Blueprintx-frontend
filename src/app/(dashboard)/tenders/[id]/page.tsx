"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUser } from "@/hooks/useAuth";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Input, Textarea, Modal } from "@/components/ui";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui";
import { LoadingPage, EmptyState } from "@/components/common";
import { useShowToast } from "@/components/ui/Toast";
import { tendersApi, bidsApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { TENDER_STATUS_COLORS, TENDER_STATUS_LABELS, BID_STATUS_COLORS, BID_STATUS_LABELS } from "@/lib/constants/statuses";
import { bidSchema, type BidFormData } from "@/types/forms";
import { FileText, DollarSign, Clock, Calendar, Gavel, CheckCircle } from "lucide-react";

interface TenderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TenderDetailPage({ params }: TenderDetailPageProps) {
  const resolvedParams = use(params);
  const { profile } = useUser();
  const queryClient = useQueryClient();
  const toast = useShowToast();
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  const isSubcontractor = profile?.user_type === "sub";

  // For now, we'll fetch from the general tenders list
  // In a real app, you'd have a proper get endpoint
  const { data: tendersData, isLoading: tenderLoading } = useQuery({
    queryKey: queryKeys.tenders.list(),
    queryFn: () => tendersApi.list(),
  });

  const tender = tendersData?.data?.find((t) => t.id === resolvedParams.id);

  const { data: bidsData, isLoading: bidsLoading } = useQuery({
    queryKey: queryKeys.bids.byTender(resolvedParams.id),
    queryFn: () => bidsApi.listByTender(resolvedParams.id),
    enabled: !isSubcontractor, // Only GCs can see all bids
  });

  const bids = bidsData?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BidFormData>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      company_name: profile?.company_name || "",
      contact_name: `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim(),
      contact_email: profile?.email || "",
      contact_phone: profile?.phone || "",
      bid_amount: 0,
      notes: "",
    },
  });

  const { mutate: submitBid, isPending: isSubmitting } = useMutation({
    mutationFn: (data: BidFormData) => bidsApi.create(resolvedParams.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bids.byTender(resolvedParams.id) });
      toast.success("Bid submitted", "Your bid has been submitted successfully.");
      setIsBidModalOpen(false);
      reset();
    },
    onError: (error: Error) => {
      toast.error("Failed to submit bid", error.message);
    },
  });

  if (tenderLoading) {
    return <LoadingPage message="Loading tender..." />;
  }

  if (!tender) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <EmptyState
          icon={<FileText className="h-8 w-8 text-muted-foreground" />}
          title="Tender not found"
          description="The tender you're looking for doesn't exist."
          action={{
            label: "Back to Tenders",
            onClick: () => (window.location.href = ROUTES.TENDERS),
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={tender.name}
        breadcrumbs={[
          { label: "Dashboard", href: ROUTES.DASHBOARD },
          { label: "Tenders", href: ROUTES.TENDERS },
          { label: tender.name },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <Badge className={TENDER_STATUS_COLORS[tender.status]} size="md">
              {TENDER_STATUS_LABELS[tender.status]}
            </Badge>
            {isSubcontractor && tender.status === "open" && (
              <Button
                leftIcon={<Gavel className="h-4 w-4" />}
                onClick={() => setIsBidModalOpen(true)}
              >
                Submit Bid
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Tender Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tender.description ? (
                <p className="text-muted-foreground">{tender.description}</p>
              ) : (
                <p className="text-muted-foreground italic">No description provided</p>
              )}

              {tender.scope_of_work && (
                <div>
                  <h4 className="font-medium mb-2">Scope of Work</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {tender.scope_of_work}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bids Section (GC Only) */}
          {!isSubcontractor && (
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Received Bids ({bids.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {bidsLoading ? (
                  <p className="text-muted-foreground">Loading bids...</p>
                ) : bids.length === 0 ? (
                  <EmptyState
                    icon={<Gavel className="h-8 w-8 text-muted-foreground" />}
                    title="No bids yet"
                    description="Subcontractors haven't submitted bids for this tender yet."
                  />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Bid Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bids.map((bid) => (
                        <TableRow key={bid.id}>
                          <TableCell>
                            <p className="font-medium">{bid.company_name}</p>
                            {bid.contact_name && (
                              <p className="text-sm text-muted-foreground">{bid.contact_name}</p>
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
                            {bid.submitted_at ? formatDate(bid.submitted_at) : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Quick Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tender.trade_category && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Trade</p>
                    <p className="text-sm text-muted-foreground">{tender.trade_category}</p>
                  </div>
                </div>
              )}

              {tender.estimated_value && (
                <div className="flex items-start gap-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Estimated Value</p>
                    <p className="text-sm text-muted-foreground">{formatCurrency(tender.estimated_value)}</p>
                  </div>
                </div>
              )}

              {tender.bid_due_date && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Bid Due Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(tender.bid_due_date)}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">{formatDate(tender.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {isSubcontractor && tender.status === "open" && (
            <Card variant="bordered" className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                <Gavel className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Ready to Bid?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Submit your competitive bid for this tender
                </p>
                <Button className="w-full" onClick={() => setIsBidModalOpen(true)}>
                  Submit Bid
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Submit Bid Modal */}
      <Modal
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        title="Submit Bid"
        description={`Submit your bid for "${tender.name}"`}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsBidModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit((data) => submitBid(data))}
              isLoading={isSubmitting}
            >
              Submit Bid
            </Button>
          </>
        }
      >
        <form className="space-y-4">
          <Input
            {...register("company_name")}
            label="Company Name"
            placeholder="Your company name"
            error={errors.company_name?.message}
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              {...register("contact_name")}
              label="Contact Name"
              placeholder="Full name"
              error={errors.contact_name?.message}
            />
            <Input
              {...register("contact_email")}
              type="email"
              label="Contact Email"
              placeholder="email@example.com"
              error={errors.contact_email?.message}
            />
          </div>

          <Input
            {...register("contact_phone")}
            label="Contact Phone"
            placeholder="(555) 123-4567"
            error={errors.contact_phone?.message}
          />

          <Input
            {...register("bid_amount", { valueAsNumber: true })}
            type="number"
            label="Bid Amount ($)"
            placeholder="Enter your bid amount"
            error={errors.bid_amount?.message}
            required
          />

          <Textarea
            {...register("notes")}
            label="Notes"
            placeholder="Any additional notes or conditions..."
            rows={3}
            error={errors.notes?.message}
          />
        </form>
      </Modal>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Textarea,
  Modal,
} from "@/components/ui";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { marketplaceApi, type SubmitBidInput, type BidLineItem } from "@/lib/api/marketplace";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import {
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Edit,
  Trash2,
  Plus,
  X,
} from "lucide-react";

export default function TenderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  
  const [showBidModal, setShowBidModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const { data: tender, isLoading, error } = useQuery({
    queryKey: queryKeys.marketplace.tenders.detail(id),
    queryFn: () => marketplaceApi.tenders.get(id),
    enabled: !!id,
  });

  const withdrawMutation = useMutation({
    mutationFn: () => marketplaceApi.bids.withdraw(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.marketplace.tenders.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.marketplace.myBids({}) });
      setShowWithdrawModal(false);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SkeletonCard />
          </div>
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error || !tender) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Tender Not Found</h2>
        <p className="text-muted-foreground mb-4">
          This tender may not exist or is no longer available.
        </p>
        <Link href="/marketplace">
          <Button variant="outline">Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  const hasBid = !!tender.my_bid;
  const isClosed = tender.status !== "open";
  const isPastDue = !!(tender.bid_due_date && new Date(tender.bid_due_date) < new Date());

  return (
    <div className="space-y-6">
      <PageHeader
        title={tender.name}
        description={`${tender.trade_category} tender from ${tender.gc_company_name || "Unknown GC"}`}
        breadcrumbs={[
          { label: "Dashboard", href: ROUTES.DASHBOARD },
          { label: "Marketplace", href: "/marketplace" },
          { label: tender.name },
        ]}
        actions={
          hasBid ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowBidModal(true)}
                leftIcon={<Edit className="h-4 w-4" />}
                disabled={isClosed || isPastDue}
              >
                Edit Bid
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowWithdrawModal(true)}
                leftIcon={<Trash2 className="h-4 w-4" />}
                disabled={isClosed || isPastDue}
              >
                Withdraw
              </Button>
            </div>
          ) : (
            <Button
              variant="primary"
              onClick={() => setShowBidModal(true)}
              leftIcon={<Send className="h-4 w-4" />}
              disabled={isClosed || isPastDue}
            >
              Submit Bid
            </Button>
          )
        }
      />

      {/* Status Alerts */}
      {isClosed && (
        <Card variant="bordered" className="bg-muted/50 border-muted">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm">This tender is closed and no longer accepting bids.</p>
          </CardContent>
        </Card>
      )}

      {!isClosed && isPastDue && (
        <Card variant="bordered" className="bg-warning/10 border-warning/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-warning" />
            <p className="text-sm text-warning">The bid deadline has passed.</p>
          </CardContent>
        </Card>
      )}

      {hasBid && !isClosed && !isPastDue && (
        <Card variant="bordered" className="bg-success/10 border-success/20">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-success" />
            <div className="flex-1">
              <p className="text-sm font-medium text-success">
                Your bid of {formatCurrency(tender.my_bid!.bid_amount / 100)} has been submitted
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Status: {tender.my_bid!.status}
                {tender.my_bid!.submitted_at && ` | Submitted ${formatDate(tender.my_bid!.submitted_at)}`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tender Details */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Tender Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <Badge variant="secondary" size="lg">{tender.trade_category}</Badge>
                <Badge variant={tender.status === "open" ? "success" : "outline"} size="lg">
                  {tender.status}
                </Badge>
                {tender.priority && (
                  <Badge variant={tender.priority === "high" ? "error" : "outline"} size="lg">
                    {tender.priority} priority
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tender.gc_company_name && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{tender.gc_company_name}</span>
                  </div>
                )}
                {tender.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{tender.location}</span>
                  </div>
                )}
                {tender.bid_due_date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Due {formatDate(tender.bid_due_date)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{tender.bids_received} bids received</span>
                </div>
              </div>

              {tender.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {tender.description}
                  </p>
                </div>
              )}

              {tender.scope_of_work && (
                <div>
                  <h4 className="font-medium mb-2">Scope of Work</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {tender.scope_of_work}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Requirements */}
          {tender.requirements && Object.keys(tender.requirements).length > 0 && (
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {Object.entries(tender.requirements).map(([key, value]) => (
                    <li key={key} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        <strong className="capitalize">{key.replace(/_/g, " ")}:</strong>{" "}
                        {String(value)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing Info */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tender.estimated_value && (
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Value</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(tender.estimated_value / 100)}
                  </p>
                </div>
              )}
              {tender.reserve_price && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Reserve Price</p>
                  <p className="text-lg font-semibold">
                    {formatCurrency(tender.reserve_price / 100)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Bids should be at or below this amount
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Action */}
          {!isClosed && !isPastDue && (
            <Card variant="bordered">
              <CardContent className="p-4">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => setShowBidModal(true)}
                  leftIcon={hasBid ? <Edit className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                >
                  {hasBid ? "Edit Your Bid" : "Submit a Bid"}
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {hasBid
                    ? "You can update your bid until the deadline"
                    : "Submit your competitive bid for this tender"}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Project Info */}
          {tender.project_name && (
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="text-sm">Project</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{tender.project_name}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Bid Modal */}
      <BidModal
        isOpen={showBidModal}
        onClose={() => setShowBidModal(false)}
        tenderId={id}
        tenderName={tender.name}
        existingBid={tender.my_bid}
        reservePrice={tender.reserve_price}
      />

      {/* Withdraw Confirmation Modal */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        title="Withdraw Bid"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Are you sure you want to withdraw your bid? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowWithdrawModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => withdrawMutation.mutate()}
              disabled={withdrawMutation.isPending}
            >
              {withdrawMutation.isPending ? "Withdrawing..." : "Withdraw Bid"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ============================================
// Bid Modal Component
// ============================================

function BidModal({
  isOpen,
  onClose,
  tenderId,
  tenderName,
  existingBid,
  reservePrice,
}: {
  isOpen: boolean;
  onClose: () => void;
  tenderId: string;
  tenderName: string;
  existingBid?: { id: string; bid_amount: number; status: string } | null;
  reservePrice?: number;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!existingBid;

  const [formData, setFormData] = useState<SubmitBidInput>({
    bid_amount: existingBid?.bid_amount || 0,
    breakdown: [],
    proposed_timeline_days: undefined,
    proposed_start_date: undefined,
    cover_letter: "",
    notes: "",
  });

  const [lineItems, setLineItems] = useState<BidLineItem[]>([]);

  const submitMutation = useMutation({
    mutationFn: (input: SubmitBidInput) =>
      isEdit
        ? marketplaceApi.bids.update(tenderId, input)
        : marketplaceApi.bids.submit(tenderId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.marketplace.tenders.detail(tenderId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.marketplace.myBids({}) });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.bid_amount <= 0) return;

    submitMutation.mutate({
      ...formData,
      breakdown: lineItems.length > 0 ? lineItems : undefined,
    });
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { description: "", total: 0 }]);
  };

  const updateLineItem = (index: number, updates: Partial<BidLineItem>) => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], ...updates };
    setLineItems(newItems);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const totalFromLineItems = lineItems.reduce((sum, item) => sum + (item.total || 0), 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Bid for ${tenderName}` : `Submit Bid for ${tenderName}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bid Amount */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Bid Amount (in cents) *
          </label>
          <Input
            type="number"
            value={formData.bid_amount}
            onChange={(e) =>
              setFormData({ ...formData, bid_amount: parseInt(e.target.value) || 0 })
            }
            placeholder="e.g., 1500000 for $15,000"
            leftIcon={<DollarSign className="h-4 w-4" />}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            = {formatCurrency(formData.bid_amount / 100)}
            {reservePrice && formData.bid_amount > reservePrice && (
              <span className="text-warning ml-2">
                (Above reserve price of {formatCurrency(reservePrice / 100)})
              </span>
            )}
          </p>
        </div>

        {/* Line Items Breakdown */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Breakdown (Optional)</label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addLineItem}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add Line Item
            </Button>
          </div>
          {lineItems.length > 0 && (
            <div className="space-y-2 mb-2">
              {lineItems.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) =>
                      updateLineItem(index, { description: e.target.value })
                    }
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={item.total || ""}
                    onChange={(e) =>
                      updateLineItem(index, { total: parseInt(e.target.value) || 0 })
                    }
                    className="w-32"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLineItem(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {lineItems.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Line items total: {formatCurrency(totalFromLineItems / 100)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Proposed Timeline (days)
            </label>
            <Input
              type="number"
              value={formData.proposed_timeline_days || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  proposed_timeline_days: parseInt(e.target.value) || undefined,
                })
              }
              placeholder="e.g., 30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Proposed Start Date
            </label>
            <Input
              type="date"
              value={formData.proposed_start_date || ""}
              onChange={(e) =>
                setFormData({ ...formData, proposed_start_date: e.target.value || undefined })
              }
            />
          </div>
        </div>

        {/* Cover Letter */}
        <div>
          <label className="block text-sm font-medium mb-1">Cover Letter</label>
          <Textarea
            value={formData.cover_letter || ""}
            onChange={(e) =>
              setFormData({ ...formData, cover_letter: e.target.value })
            }
            rows={4}
            placeholder="Introduce yourself and explain why you're the best fit for this project..."
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Additional Notes
          </label>
          <Textarea
            value={formData.notes || ""}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            placeholder="Any additional information or clarifications..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={formData.bid_amount <= 0 || submitMutation.isPending}
            leftIcon={<Send className="h-4 w-4" />}
          >
            {submitMutation.isPending
              ? "Submitting..."
              : isEdit
              ? "Update Bid"
              : "Submit Bid"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

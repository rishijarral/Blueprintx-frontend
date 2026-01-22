"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Select,
  Modal,
  Textarea,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common";
import { adminApi, type PendingVerification } from "@/lib/api/admin";
import { queryKeys } from "@/types/api";
import { useShowToast } from "@/components/ui/Toast";
import { formatDate, formatRelativeTime } from "@/lib/utils/format";
import {
  Search,
  SlidersHorizontal,
  ShieldCheck,
  ShieldX,
  Eye,
  Building2,
  Mail,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
} from "lucide-react";

const TRADE_OPTIONS = [
  { value: "", label: "All Trades" },
  { value: "electrical", label: "Electrical" },
  { value: "plumbing", label: "Plumbing" },
  { value: "hvac", label: "HVAC" },
  { value: "roofing", label: "Roofing" },
  { value: "carpentry", label: "Carpentry" },
  { value: "concrete", label: "Concrete" },
  { value: "painting", label: "Painting" },
  { value: "masonry", label: "Masonry" },
  { value: "flooring", label: "Flooring" },
  { value: "drywall", label: "Drywall" },
  { value: "framing", label: "Framing" },
  { value: "insulation", label: "Insulation" },
  { value: "fire_protection", label: "Fire Protection" },
  { value: "landscaping", label: "Landscaping" },
];

const SORT_OPTIONS = [
  { value: "created_at", label: "Newest First" },
  { value: "name", label: "Name A-Z" },
];

export default function VerificationsPage() {
  const queryClient = useQueryClient();
  const showToast = useShowToast();

  // Filters
  const [search, setSearch] = useState("");
  const [tradeFilter, setTradeFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [showFilters, setShowFilters] = useState(false);

  // Quick action modals
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState<PendingVerification | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [approveNotes, setApproveNotes] = useState("");

  // Fetch verifications
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.admin.verifications.list({
      search: search || undefined,
      trade: tradeFilter || undefined,
      sort_by: sortBy as "created_at" | "name",
      sort_order: sortBy === "name" ? "asc" : "desc",
    }),
    queryFn: () =>
      adminApi.verifications.list({
        search: search || undefined,
        trade: tradeFilter || undefined,
        sort_by: sortBy as "created_at" | "name",
        sort_order: sortBy === "name" ? "asc" : "desc",
        per_page: 50,
      }),
  });

  const verifications = data?.data || [];

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      adminApi.verifications.approve(id, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "verifications"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
      showToast.success("Verification Approved", "The subcontractor has been successfully verified.");
      setApproveModalOpen(false);
      setSelectedVerification(null);
      setApproveNotes("");
    },
    onError: (error: Error) => {
      showToast.error("Approval Failed", error.message || "Failed to approve verification.");
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.verifications.reject(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "verifications"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
      showToast.success("Verification Rejected", "The verification request has been rejected.");
      setRejectModalOpen(false);
      setSelectedVerification(null);
      setRejectReason("");
    },
    onError: (error: Error) => {
      showToast.error("Rejection Failed", error.message || "Failed to reject verification.");
    },
  });

  const handleApprove = (verification: PendingVerification) => {
    setSelectedVerification(verification);
    setApproveModalOpen(true);
  };

  const handleReject = (verification: PendingVerification) => {
    setSelectedVerification(verification);
    setRejectModalOpen(true);
  };

  const confirmApprove = () => {
    if (selectedVerification) {
      approveMutation.mutate({
        id: selectedVerification.id,
        notes: approveNotes || undefined,
      });
    }
  };

  const confirmReject = () => {
    if (selectedVerification && rejectReason.trim()) {
      rejectMutation.mutate({
        id: selectedVerification.id,
        reason: rejectReason.trim(),
      });
    }
  };

  if (error) {
    return (
      <Card variant="bordered">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Failed to load verifications</h2>
          <p className="text-muted-foreground">
            Unable to fetch pending verifications. Please try again later.
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
          <h2 className="text-xl font-semibold">Pending Verifications</h2>
          <p className="text-sm text-muted-foreground">
            Review and approve subcontractor verification requests
          </p>
        </div>
        <Badge variant={verifications.length > 0 ? "warning" : "success"} size="lg">
          <Clock className="h-4 w-4 mr-1" />
          {verifications.length} pending
        </Badge>
      </div>

      {/* Filters */}
      <Card variant="bordered">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by name, email, trade..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>
              <div className="flex gap-2">
                <div className="w-full sm:w-40">
                  <Select
                    options={TRADE_OPTIONS}
                    value={tradeFilter}
                    onChange={(e) => setTradeFilter(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-40">
                  <Select
                    options={SORT_OPTIONS}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <Card variant="bordered">
          <CardContent className="p-0">
            <SkeletonTable rows={5} cols={6} />
          </CardContent>
        </Card>
      ) : verifications.length === 0 ? (
        <Card variant="bordered">
          <CardContent className="p-8">
            <EmptyState
              icon={<CheckCircle2 className="h-12 w-12 text-success" />}
              title="All caught up!"
              description={
                search || tradeFilter
                  ? "No verifications match your filters."
                  : "There are no pending verification requests at this time."
              }
              action={
                search || tradeFilter
                  ? {
                      label: "Clear Filters",
                      onClick: () => {
                        setSearch("");
                        setTradeFilter("");
                      },
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
                  <TableHead>Company</TableHead>
                  <TableHead>Trade</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {verifications.map((verification) => (
                  <TableRow key={verification.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{verification.name}</span>
                        {verification.profile_email && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {verification.profile_email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{verification.trade}</Badge>
                    </TableCell>
                    <TableCell>
                      {verification.location ? (
                        <span className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          {verification.location}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm" title={formatDate(verification.created_at)}>
                        {formatRelativeTime(verification.created_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {verification.insurance && (
                          <Badge variant="outline" size="sm" title="Insurance uploaded">
                            Ins
                          </Badge>
                        )}
                        {verification.license_info && (
                          <Badge variant="outline" size="sm" title="License uploaded">
                            Lic
                          </Badge>
                        )}
                        {verification.certifications && verification.certifications.length > 0 && (
                          <Badge variant="outline" size="sm" title="Certifications uploaded">
                            Cert
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/verifications/${verification.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-success hover:text-success hover:bg-success/10"
                          onClick={() => handleApprove(verification)}
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleReject(verification)}
                        >
                          <ShieldX className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Approve Modal */}
      <Modal
        isOpen={approveModalOpen}
        onClose={() => {
          setApproveModalOpen(false);
          setSelectedVerification(null);
          setApproveNotes("");
        }}
        title="Approve Verification"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-success/10 rounded-lg border border-success/20">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-success">
                  Approve {selectedVerification?.name}?
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  This will mark the subcontractor as verified on the platform. They will be able to display the verified badge.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Notes (optional)
            </label>
            <Textarea
              placeholder="Add any notes about this approval..."
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setApproveModalOpen(false);
                setSelectedVerification(null);
                setApproveNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={confirmApprove}
              isLoading={approveMutation.isPending}
              leftIcon={<ShieldCheck className="h-4 w-4" />}
            >
              Approve Verification
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => {
          setRejectModalOpen(false);
          setSelectedVerification(null);
          setRejectReason("");
        }}
        title="Reject Verification"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">
                  Reject {selectedVerification?.name}?
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  The subcontractor will be notified with your reason for rejection. They can resubmit after addressing the issues.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Rejection Reason <span className="text-destructive">*</span>
            </label>
            <Textarea
              placeholder="Explain why this verification is being rejected..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              This message will be sent to the subcontractor.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setRejectModalOpen(false);
                setSelectedVerification(null);
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              isLoading={rejectMutation.isPending}
              disabled={!rejectReason.trim()}
              leftIcon={<ShieldX className="h-4 w-4" />}
            >
              Reject Verification
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Modal,
  Textarea,
  Skeleton,
} from "@/components/ui";
import { adminApi } from "@/lib/api/admin";
import { queryKeys } from "@/types/api";
import { useShowToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils/format";
import {
  ArrowLeft,
  ShieldCheck,
  ShieldX,
  Building2,
  Mail,
  MapPin,
  Calendar,
  Users,
  FileText,
  Award,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Phone,
  Globe,
  Briefcase,
} from "lucide-react";

export default function VerificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const showToast = useShowToast();
  const id = params.id as string;

  // Modal states
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approveNotes, setApproveNotes] = useState("");

  // Fetch verification details
  const { data: verification, isLoading, error } = useQuery({
    queryKey: queryKeys.admin.verifications.detail(id),
    queryFn: () => adminApi.verifications.get(id),
    enabled: !!id,
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: ({ notes }: { notes?: string }) =>
      adminApi.verifications.approve(id, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "verifications"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
      showToast({
        title: "Verification Approved",
        description: "The subcontractor has been successfully verified.",
        type: "success",
      });
      router.push("/admin/verifications");
    },
    onError: (error: Error) => {
      showToast({
        title: "Approval Failed",
        description: error.message || "Failed to approve verification.",
        type: "error",
      });
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ reason }: { reason: string }) =>
      adminApi.verifications.reject(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "verifications"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
      showToast({
        title: "Verification Rejected",
        description: "The verification request has been rejected.",
        type: "success",
      });
      router.push("/admin/verifications");
    },
    onError: (error: Error) => {
      showToast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject verification.",
        type: "error",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
          <Skeleton className="h-80 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !verification) {
    return (
      <Card variant="bordered">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Verification Not Found</h2>
          <p className="text-muted-foreground mb-4">
            This verification request may have already been processed or doesn't exist.
          </p>
          <Link href="/admin/verifications">
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Verifications
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const insurance = verification.insurance as Record<string, string> | null;
  const licenseInfo = verification.license_info as Record<string, string> | null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/verifications">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-semibold">{verification.name}</h2>
            <p className="text-sm text-muted-foreground">
              Submitted {formatDate(verification.created_at)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => setRejectModalOpen(true)}
            leftIcon={<ShieldX className="h-4 w-4" />}
          >
            Reject
          </Button>
          <Button
            variant="primary"
            onClick={() => setApproveModalOpen(true)}
            leftIcon={<ShieldCheck className="h-4 w-4" />}
          >
            Approve
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Information */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Company Name
                  </label>
                  <p className="font-medium mt-1">{verification.name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Trade
                  </label>
                  <div className="mt-1">
                    <Badge variant="secondary">{verification.trade}</Badge>
                  </div>
                </div>
                {verification.location && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Location
                    </label>
                    <p className="mt-1 flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {verification.location}
                    </p>
                  </div>
                )}
                {verification.year_established && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Year Established
                    </label>
                    <p className="mt-1 flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {verification.year_established}
                    </p>
                  </div>
                )}
                {verification.employee_count && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Employee Count
                    </label>
                    <p className="mt-1 flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {verification.employee_count}
                    </p>
                  </div>
                )}
                {verification.contact_email && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Contact Email
                    </label>
                    <p className="mt-1 flex items-center gap-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${verification.contact_email}`} className="text-primary hover:underline">
                        {verification.contact_email}
                      </a>
                    </p>
                  </div>
                )}
              </div>

              {verification.headline && (
                <div className="pt-4 border-t border-border">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Headline
                  </label>
                  <p className="mt-1">{verification.headline}</p>
                </div>
              )}

              {verification.company_description && (
                <div className="pt-4 border-t border-border">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Company Description
                  </label>
                  <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                    {verification.company_description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Insurance Information */}
          {insurance && Object.keys(insurance).length > 0 && (
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Insurance Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {insurance.provider && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Insurance Provider
                      </label>
                      <p className="mt-1">{insurance.provider}</p>
                    </div>
                  )}
                  {insurance.policy_number && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Policy Number
                      </label>
                      <p className="mt-1 font-mono text-sm">{insurance.policy_number}</p>
                    </div>
                  )}
                  {insurance.coverage_amount && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Coverage Amount
                      </label>
                      <p className="mt-1">{insurance.coverage_amount}</p>
                    </div>
                  )}
                  {insurance.expiry_date && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Expiry Date
                      </label>
                      <p className="mt-1">{insurance.expiry_date}</p>
                    </div>
                  )}
                  {insurance.document_url && (
                    <div className="sm:col-span-2">
                      <a
                        href={insurance.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        View Insurance Document
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* License Information */}
          {licenseInfo && Object.keys(licenseInfo).length > 0 && (
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  License Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  {licenseInfo.license_number && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        License Number
                      </label>
                      <p className="mt-1 font-mono text-sm">{licenseInfo.license_number}</p>
                    </div>
                  )}
                  {licenseInfo.license_type && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        License Type
                      </label>
                      <p className="mt-1">{licenseInfo.license_type}</p>
                    </div>
                  )}
                  {licenseInfo.issuing_authority && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Issuing Authority
                      </label>
                      <p className="mt-1">{licenseInfo.issuing_authority}</p>
                    </div>
                  )}
                  {licenseInfo.expiry_date && (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Expiry Date
                      </label>
                      <p className="mt-1">{licenseInfo.expiry_date}</p>
                    </div>
                  )}
                  {licenseInfo.document_url && (
                    <div className="sm:col-span-2">
                      <a
                        href={licenseInfo.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        View License Document
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {verification.certifications && verification.certifications.length > 0 && (
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {verification.certifications.map((cert, index) => {
                    const certification = cert as Record<string, string>;
                    return (
                      <div key={index} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{certification.name || `Certification ${index + 1}`}</p>
                            {certification.issuer && (
                              <p className="text-sm text-muted-foreground">
                                Issued by: {certification.issuer}
                              </p>
                            )}
                            {certification.date && (
                              <p className="text-xs text-muted-foreground">
                                Date: {certification.date}
                              </p>
                            )}
                          </div>
                          {certification.document_url && (
                            <a
                              href={certification.document_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Account Info */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="text-base">Account Owner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {verification.profile_name && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{verification.profile_name}</span>
                </div>
              )}
              {verification.profile_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${verification.profile_email}`}
                    className="text-primary hover:underline text-sm"
                  >
                    {verification.profile_email}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setApproveModalOpen(true)}
                leftIcon={<ShieldCheck className="h-4 w-4" />}
              >
                Approve Verification
              </Button>
              <Button
                variant="outline"
                className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => setRejectModalOpen(true)}
                leftIcon={<ShieldX className="h-4 w-4" />}
              >
                Reject Verification
              </Button>
            </CardContent>
          </Card>

          {/* Checklist */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="text-base">Verification Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  {verification.name ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  Company name provided
                </li>
                <li className="flex items-center gap-2 text-sm">
                  {verification.trade ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  Trade specified
                </li>
                <li className="flex items-center gap-2 text-sm">
                  {verification.location ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  Location provided
                </li>
                <li className="flex items-center gap-2 text-sm">
                  {insurance && Object.keys(insurance).length > 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  Insurance documentation
                </li>
                <li className="flex items-center gap-2 text-sm">
                  {licenseInfo && Object.keys(licenseInfo).length > 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  License documentation
                </li>
                <li className="flex items-center gap-2 text-sm">
                  {verification.certifications && verification.certifications.length > 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  Certifications
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={approveModalOpen}
        onClose={() => {
          setApproveModalOpen(false);
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
                  Approve {verification.name}?
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  This will mark the subcontractor as verified on the platform. They will receive a notification and be able to display the verified badge.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Notes (optional)
            </label>
            <Textarea
              placeholder="Add any internal notes about this approval..."
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
                setApproveNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => approveMutation.mutate({ notes: approveNotes || undefined })}
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
                  Reject {verification.name}?
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
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => rejectMutation.mutate({ reason: rejectReason.trim() })}
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

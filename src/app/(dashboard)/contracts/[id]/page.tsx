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
  Avatar,
  Modal,
} from "@/components/ui";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { hiringApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils/format";
import type { ContractStatus, PaymentMilestone } from "@/types/models";
import {
  FileText,
  CheckCircle,
  Clock,
  DollarSign,
  User,
  Pen,
  AlertCircle,
  Download,
  Printer,
  Send,
  Shield,
} from "lucide-react";

const STATUS_CONFIG: Record<
  ContractStatus,
  { label: string; color: string; description: string }
> = {
  draft: {
    label: "Draft",
    color: "secondary",
    description: "Contract is being prepared",
  },
  pending_gc: {
    label: "Pending GC Signature",
    color: "warning",
    description: "Waiting for GC to sign",
  },
  pending_sub: {
    label: "Pending Sub Signature",
    color: "warning",
    description: "Waiting for subcontractor to sign",
  },
  gc_signed: {
    label: "GC Signed",
    color: "info",
    description: "GC has signed, awaiting subcontractor",
  },
  fully_signed: {
    label: "Fully Signed",
    color: "success",
    description: "Both parties have signed",
  },
  active: {
    label: "Active",
    color: "success",
    description: "Contract is in effect",
  },
  completed: {
    label: "Completed",
    color: "success",
    description: "Work has been completed",
  },
  terminated: {
    label: "Terminated",
    color: "error",
    description: "Contract has been terminated",
  },
  disputed: {
    label: "Disputed",
    color: "error",
    description: "Contract is under dispute",
  },
};

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [showSignModal, setShowSignModal] = useState(false);

  const { data: contract, isLoading } = useQuery({
    queryKey: queryKeys.hiring.contracts.detail(id),
    queryFn: () => hiringApi.contracts.get(id),
    enabled: !!id,
  });

  const signMutation = useMutation({
    mutationFn: (input: { signature: string; agreed_to_terms: boolean }) =>
      hiringApi.contracts.sign(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.hiring.contracts.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.hiring.contracts.all,
      });
      setShowSignModal(false);
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

  if (!contract) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Contract Not Found</h2>
        <p className="text-muted-foreground mb-4">
          This contract may have been deleted or you don't have access.
        </p>
        <Link href={ROUTES.HIRING}>
          <Button variant="outline">Back to Hiring</Button>
        </Link>
      </div>
    );
  }

  const status = STATUS_CONFIG[contract.status];
  const needsGCSignature = ["pending_gc", "draft"].includes(contract.status);
  const needsSubSignature = ["pending_sub", "gc_signed"].includes(contract.status);
  const isFullySigned = ["fully_signed", "active", "completed"].includes(contract.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={contract.title}
        description={`Contract #${contract.contract_number || "Draft"}`}
        breadcrumbs={[
          { label: "Dashboard", href: ROUTES.DASHBOARD },
          { label: "Hiring", href: ROUTES.HIRING },
          { label: contract.title },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {needsGCSignature && (
              <Button
                variant="primary"
                onClick={() => setShowSignModal(true)}
                leftIcon={<Pen className="h-4 w-4" />}
              >
                Sign Contract
              </Button>
            )}
            {isFullySigned && (
              <>
                <Button
                  variant="outline"
                  leftIcon={<Download className="h-4 w-4" />}
                >
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<Printer className="h-4 w-4" />}
                >
                  Print
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Banner */}
          <Card variant="bordered">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={status.color as any} size="lg">
                    {status.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {status.description}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Signature Status */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Signatures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                {/* GC Signature */}
                <div className={`p-4 rounded-lg ${contract.gc_signed ? 'bg-success/10 border border-success/20' : 'bg-secondary'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {contract.gc_signed ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className="font-medium">General Contractor</span>
                  </div>
                  {contract.gc_signed ? (
                    <p className="text-sm text-muted-foreground">
                      Signed on {formatDate(contract.gc_signed_at!)}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Awaiting signature
                    </p>
                  )}
                </div>

                {/* Sub Signature */}
                <div className={`p-4 rounded-lg ${contract.sub_signed ? 'bg-success/10 border border-success/20' : 'bg-secondary'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {contract.sub_signed ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className="font-medium">Subcontractor</span>
                  </div>
                  {contract.sub_signed ? (
                    <p className="text-sm text-muted-foreground">
                      Signed on {formatDate(contract.sub_signed_at!)}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {contract.gc_signed ? "Awaiting signature" : "Pending GC signature first"}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contract Content */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contract Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contract.terms_summary && (
                <div className="mb-6 p-4 bg-secondary rounded-lg">
                  <h4 className="font-medium mb-2">Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    {contract.terms_summary}
                  </p>
                </div>
              )}

              {/* Contract Sections */}
              {contract.sections && contract.sections.length > 0 ? (
                <div className="space-y-6">
                  {contract.sections.map((section, index) => (
                    <div key={index} className="border-b border-border pb-4 last:border-0">
                      <h4 className="font-medium mb-2">{section.title}</h4>
                      <div
                        className="text-sm text-muted-foreground prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                    </div>
                  ))}
                </div>
              ) : contract.content ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: contract.content }}
                />
              ) : (
                <p className="text-muted-foreground text-center py-6">
                  Contract content not available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Payment Schedule */}
          {contract.payment_schedule && contract.payment_schedule.length > 0 && (
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payment Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contract.payment_schedule.map((milestone, index) => (
                    <PaymentMilestoneRow key={index} milestone={milestone} />
                  ))}
                  <div className="flex items-center justify-between pt-4 border-t border-border font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(contract.amount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Subcontractor Info */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Subcontractor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar name={contract.subcontractor.company_name} size="lg" />
                <div>
                  <h4 className="font-semibold">{contract.subcontractor.company_name}</h4>
                  <Badge variant="secondary" size="sm">
                    {contract.subcontractor.trade}
                  </Badge>
                </div>
              </div>

              {contract.subcontractor.contact_name && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{contract.subcontractor.contact_name}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contract Details */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Project</span>
                <Link
                  href={ROUTES.PROJECT_DETAIL(contract.project_id)}
                  className="text-sm text-primary hover:underline"
                >
                  {contract.project_name}
                </Link>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Contract Value</span>
                <span className="font-semibold">
                  {formatCurrency(contract.amount)}
                </span>
              </div>

              {contract.template_name && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Template</span>
                  <Badge variant="outline" size="sm">
                    {contract.template_name}
                  </Badge>
                </div>
              )}

              {contract.start_date && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Start Date</span>
                  <span className="text-sm">{formatDate(contract.start_date)}</span>
                </div>
              )}

              {contract.end_date && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">End Date</span>
                  <span className="text-sm">{formatDate(contract.end_date)}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm">
                  {formatRelativeTime(contract.created_at)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Related Hire Request */}
          {contract.hire_request_id && (
            <Card variant="bordered">
              <CardContent className="p-4">
                <Link href={ROUTES.HIRING_DETAIL(contract.hire_request_id)}>
                  <Button
                    variant="outline"
                    className="w-full"
                    leftIcon={<Send className="h-4 w-4" />}
                  >
                    View Hire Request
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {contract.notes && (
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {contract.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Sign Modal */}
      <Modal
        isOpen={showSignModal}
        onClose={() => setShowSignModal(false)}
        title="Sign Contract"
        size="md"
      >
        <SignContractForm
          onSubmit={(data) => signMutation.mutate(data)}
          isPending={signMutation.isPending}
          onCancel={() => setShowSignModal(false)}
        />
      </Modal>
    </div>
  );
}

function PaymentMilestoneRow({ milestone }: { milestone: PaymentMilestone }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
      <div className="flex items-center gap-3">
        {milestone.is_paid ? (
          <CheckCircle className="h-5 w-5 text-success" />
        ) : (
          <Clock className="h-5 w-5 text-muted-foreground" />
        )}
        <div>
          <p className="font-medium">{milestone.name}</p>
          <p className="text-sm text-muted-foreground">{milestone.due_upon}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium">{formatCurrency(milestone.amount)}</p>
        {milestone.is_paid && milestone.paid_at && (
          <p className="text-xs text-success">
            Paid {formatDate(milestone.paid_at)}
          </p>
        )}
      </div>
    </div>
  );
}

function SignContractForm({
  onSubmit,
  isPending,
  onCancel,
}: {
  onSubmit: (data: { signature: string; agreed_to_terms: boolean }) => void;
  isPending: boolean;
  onCancel: () => void;
}) {
  const [signature, setSignature] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signature.trim() || !agreed) return;
    onSubmit({ signature: signature.trim(), agreed_to_terms: agreed });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          Type your full legal name to sign
        </label>
        <Input
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="Your Full Name"
          className="text-lg"
        />
        {signature && (
          <div className="mt-4 p-4 border border-border rounded-lg bg-secondary/50">
            <p className="text-xs text-muted-foreground mb-2">Signature Preview</p>
            <p className="text-2xl font-script italic text-primary">
              {signature}
            </p>
          </div>
        )}
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 rounded border-border text-primary focus:ring-primary"
        />
        <span className="text-sm text-muted-foreground">
          I have read and agree to all terms and conditions outlined in this contract.
          I understand that this constitutes a legally binding agreement.
        </span>
      </label>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={!signature.trim() || !agreed || isPending}
          leftIcon={<Pen className="h-4 w-4" />}
        >
          {isPending ? "Signing..." : "Sign Contract"}
        </Button>
      </div>
    </form>
  );
}

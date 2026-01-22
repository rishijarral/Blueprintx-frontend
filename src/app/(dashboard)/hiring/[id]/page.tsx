"use client";

import { useState, useRef, useEffect } from "react";
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
import type { HireRequest, HireMessage, HireRequestStatus } from "@/types/models";
import {
  Send,
  CheckCircle,
  FileText,
  MessageSquare,
  User,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Loader2,
} from "lucide-react";

const STATUS_CONFIG: Record<
  HireRequestStatus,
  { label: string; color: string; nextAction?: string }
> = {
  draft: { label: "Draft", color: "secondary", nextAction: "Send Request" },
  pending: { label: "Pending", color: "warning" },
  sent: { label: "Sent", color: "info" },
  viewed: { label: "Viewed", color: "info" },
  interested: { label: "Interested", color: "success", nextAction: "Send Contract" },
  negotiating: { label: "Negotiating", color: "warning" },
  contract_sent: { label: "Contract Sent", color: "info" },
  contract_signed: { label: "Contract Signed", color: "success", nextAction: "Mark as Hired" },
  hired: { label: "Hired", color: "success" },
  declined: { label: "Declined", color: "error" },
  cancelled: { label: "Cancelled", color: "secondary" },
  expired: { label: "Expired", color: "secondary" },
};

export default function HireRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [showContractModal, setShowContractModal] = useState(false);

  const { data: request, isLoading } = useQuery({
    queryKey: queryKeys.hiring.requests.detail(id),
    queryFn: () => hiringApi.requests.get(id),
    enabled: !!id,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: queryKeys.hiring.messages.list(id),
    queryFn: () => hiringApi.messages.list(id),
    enabled: !!id && !!request,
    refetchInterval: 10000, // Poll every 10 seconds
  });

  const updateStatusMutation = useMutation({
    mutationFn: (input: { status: HireRequestStatus; response?: string }) =>
      hiringApi.requests.updateStatus(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hiring.requests.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.hiring.requests.all });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Request Not Found</h2>
        <p className="text-muted-foreground mb-4">
          This hire request may have been deleted or you don't have access.
        </p>
        <Link href={ROUTES.HIRING}>
          <Button variant="outline">Back to Hiring</Button>
        </Link>
      </div>
    );
  }

  const status = STATUS_CONFIG[request.status];
  const isActive = !["hired", "declined", "cancelled", "expired"].includes(request.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={request.title}
        description={`Hire request for ${request.subcontractor.company_name}`}
        breadcrumbs={[
          { label: "Dashboard", href: ROUTES.DASHBOARD },
          { label: "Hiring", href: ROUTES.HIRING },
          { label: request.title },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {request.status === "draft" && (
              <Button
                variant="primary"
                onClick={() => updateStatusMutation.mutate({ status: "sent" })}
                disabled={updateStatusMutation.isPending}
                leftIcon={<Send className="h-4 w-4" />}
              >
                Send Request
              </Button>
            )}
            {request.status === "interested" && (
              <Button
                variant="primary"
                onClick={() => setShowContractModal(true)}
                leftIcon={<FileText className="h-4 w-4" />}
              >
                Create Contract
              </Button>
            )}
            {request.status === "contract_signed" && (
              <Button
                variant="primary"
                onClick={() => updateStatusMutation.mutate({ status: "hired" })}
                disabled={updateStatusMutation.isPending}
                leftIcon={<CheckCircle className="h-4 w-4" />}
              >
                Mark as Hired
              </Button>
            )}
            {isActive && request.status !== "draft" && (
              <Button
                variant="outline"
                onClick={() => updateStatusMutation.mutate({ status: "cancelled" })}
                disabled={updateStatusMutation.isPending}
              >
                Cancel Request
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Messages */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Banner */}
          <Card variant="bordered">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={status.color as any} size="lg">
                    {status.label}
                  </Badge>
                  {request.response_deadline && (
                    <span className="text-sm text-muted-foreground">
                      Response due: {formatDate(request.response_deadline)}
                    </span>
                  )}
                </div>
                {request.viewed_at && (
                  <span className="text-sm text-muted-foreground">
                    Viewed {formatRelativeTime(request.viewed_at)}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Messages/Chat Section */}
          <Card variant="bordered" className="h-[500px] flex flex-col">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Negotiation
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
              <MessageList
                messages={messages}
                request={request}
                loading={messagesLoading}
              />
              {isActive && <MessageInput requestId={id} />}
            </CardContent>
          </Card>

          {/* Scope Description */}
          {request.scope_description && (
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Scope of Work</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {request.scope_description}
                </p>
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
                <Avatar name={request.subcontractor.company_name} size="lg" />
                <div>
                  <h4 className="font-semibold">{request.subcontractor.company_name}</h4>
                  <Badge variant="secondary" size="sm">
                    {request.subcontractor.trade}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                {request.subcontractor.contact_name && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{request.subcontractor.contact_name}</span>
                  </div>
                )}
                {request.subcontractor.contact_email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${request.subcontractor.contact_email}`}
                      className="text-primary hover:underline"
                    >
                      {request.subcontractor.contact_email}
                    </a>
                  </div>
                )}
                {request.subcontractor.contact_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${request.subcontractor.contact_phone}`}
                      className="text-primary hover:underline"
                    >
                      {request.subcontractor.contact_phone}
                    </a>
                  </div>
                )}
                {request.subcontractor.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{request.subcontractor.location}</span>
                  </div>
                )}
              </div>

              {request.subcontractor.verified && (
                <div className="flex items-center gap-2 text-sm text-success pt-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Platform Verified</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Request Details */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Project</span>
                <Link
                  href={ROUTES.PROJECT_DETAIL(request.project_id)}
                  className="text-sm text-primary hover:underline"
                >
                  {request.project_name}
                </Link>
              </div>

              {request.proposed_amount && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Proposed Amount</span>
                  <span className="font-medium">
                    {formatCurrency(request.proposed_amount)}
                  </span>
                </div>
              )}

              {request.sub_counter_amount && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Counter Offer</span>
                  <span className="font-medium text-warning">
                    {formatCurrency(request.sub_counter_amount)}
                  </span>
                </div>
              )}

              {request.rate_type && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rate Type</span>
                  <Badge variant="outline" size="sm">
                    {request.rate_type}
                  </Badge>
                </div>
              )}

              {request.estimated_start_date && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Start Date</span>
                  <span className="text-sm">
                    {formatDate(request.estimated_start_date)}
                  </span>
                </div>
              )}

              {request.estimated_end_date && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">End Date</span>
                  <span className="text-sm">
                    {formatDate(request.estimated_end_date)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-sm">
                  {formatRelativeTime(request.created_at)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Contract Link */}
          {request.contract_id && (
            <Card variant="bordered">
              <CardContent className="p-4">
                <Link href={ROUTES.CONTRACT_DETAIL(request.contract_id)}>
                  <Button
                    variant="outline"
                    className="w-full"
                    leftIcon={<FileText className="h-4 w-4" />}
                  >
                    View Contract
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Contract Modal - placeholder */}
      <Modal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
        title="Create Contract"
        size="lg"
      >
        <div className="p-6 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Contract builder coming soon. You'll be able to select templates and customize terms.
          </p>
          <Button variant="outline" onClick={() => setShowContractModal(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function MessageList({
  messages,
  request,
  loading,
}: {
  messages: HireMessage[];
  request: HireRequest;
  loading: boolean;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">
          No messages yet. Start the negotiation by sending a message.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isGC = message.sender_type === "gc";
        return (
          <div
            key={message.id}
            className={`flex ${isGC ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-lg p-3 ${
                isGC
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium opacity-80">
                  {message.sender_name}
                </span>
                <span className="text-xs opacity-60">
                  {formatRelativeTime(message.created_at)}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{message.message}</p>
              {message.message_type === "counter_offer" && typeof message.metadata?.amount === "number" && (
                <div className="mt-2 p-2 bg-black/10 rounded text-sm font-medium">
                  Counter offer: {formatCurrency(message.metadata.amount)}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

function MessageInput({ requestId }: { requestId: string }) {
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  const sendMutation = useMutation({
    mutationFn: (input: { message: string }) =>
      hiringApi.messages.send(requestId, input),
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({
        queryKey: queryKeys.hiring.messages.list(requestId),
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMutation.mutate({ message: message.trim() });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border-t border-border flex items-center gap-2"
    >
      <Input
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1"
        disabled={sendMutation.isPending}
      />
      <Button
        type="submit"
        variant="primary"
        disabled={!message.trim() || sendMutation.isPending}
        leftIcon={
          sendMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )
        }
      >
        Send
      </Button>
    </form>
  );
}

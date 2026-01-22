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
  Select,
  Textarea,
  Avatar,
  Modal,
} from "@/components/ui";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { subcontractorsApi, hiringApi, projectsApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import type { CreateHireRequestInput, RateType } from "@/types/models";
import {
  Star,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  DollarSign,
  CheckCircle,
  Send,
  AlertCircle,
  Clock,
  Shield,
  Award,
} from "lucide-react";

const RATE_TYPE_OPTIONS = [
  { value: "fixed", label: "Fixed Price" },
  { value: "hourly", label: "Hourly Rate" },
  { value: "daily", label: "Daily Rate" },
  { value: "weekly", label: "Weekly Rate" },
  { value: "per_unit", label: "Per Unit" },
  { value: "negotiable", label: "Negotiable" },
];

export default function MarketplaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [showHireModal, setShowHireModal] = useState(false);

  const { data: subcontractor, isLoading } = useQuery({
    queryKey: queryKeys.subcontractors.detail(id),
    queryFn: () => subcontractorsApi.get(id),
    enabled: !!id,
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

  if (!subcontractor) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Subcontractor Not Found</h2>
        <p className="text-muted-foreground mb-4">
          This subcontractor may not exist or is no longer available.
        </p>
        <Link href={ROUTES.MARKETPLACE}>
          <Button variant="outline">Back to Marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={subcontractor.name}
        description={`${subcontractor.trade} Subcontractor`}
        breadcrumbs={[
          { label: "Dashboard", href: ROUTES.DASHBOARD },
          { label: "Marketplace", href: ROUTES.MARKETPLACE },
          { label: subcontractor.name },
        ]}
        actions={
          <Button
            variant="primary"
            onClick={() => setShowHireModal(true)}
            leftIcon={<Send className="h-4 w-4" />}
          >
            Send Hire Request
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Header */}
          <Card variant="bordered">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <Avatar name={subcontractor.name} size="xl" />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{subcontractor.name}</h2>
                    {subcontractor.verified && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  <Badge variant="secondary" size="lg" className="mb-4">
                    {subcontractor.trade}
                  </Badge>

                  {subcontractor.description && (
                    <p className="text-muted-foreground">
                      {subcontractor.description}
                    </p>
                  )}

                  {/* Stats Row */}
                  <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-border">
                    {subcontractor.rating && (
                      <div className="text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <Star className="h-5 w-5 text-warning fill-warning" />
                          <span className="text-2xl font-bold">
                            {subcontractor.rating.toFixed(1)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {subcontractor.review_count} reviews
                        </p>
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-2xl font-bold">
                        {subcontractor.projects_completed}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Projects Completed
                      </p>
                    </div>
                    {subcontractor.average_bid_value && (
                      <div className="text-center">
                        <p className="text-2xl font-bold">
                          {formatCurrency(subcontractor.average_bid_value)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Avg. Project Value
                        </p>
                      </div>
                    )}
                    {subcontractor.response_time && (
                      <div className="text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <span className="text-2xl font-bold">
                            {subcontractor.response_time}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Response Time
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specialties */}
          {subcontractor.specialties && subcontractor.specialties.length > 0 && (
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Specialties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {subcontractor.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline" size="lg">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Projects */}
          {subcontractor.recent_projects && subcontractor.recent_projects.length > 0 && (
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Recent Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {subcontractor.recent_projects.map((project, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/50"
                    >
                      <div>
                        <h4 className="font-medium">{project.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Completed {formatDate(project.completed)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(project.value)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subcontractor.contact_email && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <a
                      href={`mailto:${subcontractor.contact_email}`}
                      className="text-primary hover:underline"
                    >
                      {subcontractor.contact_email}
                    </a>
                  </div>
                </div>
              )}

              {subcontractor.contact_phone && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <a
                      href={`tel:${subcontractor.contact_phone}`}
                      className="text-primary hover:underline"
                    >
                      {subcontractor.contact_phone}
                    </a>
                  </div>
                </div>
              )}

              {subcontractor.location && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p>{subcontractor.location}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verification Badge */}
          {subcontractor.verified && (
            <Card variant="bordered" className="bg-success/5 border-success/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-success">Platform Verified</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      This subcontractor has been verified for license, insurance, and work history.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Action */}
          <Card variant="bordered">
            <CardContent className="p-4">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setShowHireModal(true)}
                leftIcon={<Send className="h-4 w-4" />}
              >
                Send Hire Request
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Start a conversation about your project
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hire Modal */}
      <HireRequestModal
        isOpen={showHireModal}
        onClose={() => setShowHireModal(false)}
        subcontractorId={id}
        subcontractorName={subcontractor.name}
        trade={subcontractor.trade}
      />
    </div>
  );
}

function HireRequestModal({
  isOpen,
  onClose,
  subcontractorId,
  subcontractorName,
  trade,
}: {
  isOpen: boolean;
  onClose: () => void;
  subcontractorId: string;
  subcontractorName: string;
  trade: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<CreateHireRequestInput>>({
    subcontractor_id: subcontractorId,
    trade,
    title: "",
    message: "",
    scope_description: "",
    proposed_amount: undefined,
    rate_type: "fixed" as RateType,
    estimated_start_date: "",
    estimated_end_date: "",
    send_immediately: true,
  });

  // Get user's projects
  const { data: projectsData } = useQuery({
    queryKey: queryKeys.projects.list({ limit: 50 }),
    queryFn: () => projectsApi.list({ limit: 50 }),
  });

  const projects = projectsData?.data || [];

  const createMutation = useMutation({
    mutationFn: (input: CreateHireRequestInput) =>
      hiringApi.requests.create(input),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hiring.requests.list() });
      onClose();
      router.push(ROUTES.HIRING_DETAIL(result.id));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project_id || !formData.title) return;

    createMutation.mutate(formData as CreateHireRequestInput);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Hire ${subcontractorName}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project Selection */}
        <Select
          label="Project *"
          options={[
            { value: "", label: "Select a project" },
            ...projects.map((p) => ({ value: p.id, label: p.name })),
          ]}
          value={formData.project_id || ""}
          onChange={(e) =>
            setFormData({ ...formData, project_id: e.target.value })
          }
          required
        />

        {/* Request Title */}
        <Input
          label="Request Title *"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          placeholder={`${trade} work for [Project Name]`}
          required
        />

        {/* Initial Message */}
        <Textarea
          label="Message"
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
          rows={3}
          placeholder="Introduce your project and what you're looking for..."
        />

        {/* Scope Description */}
        <Textarea
          label="Scope of Work"
          value={formData.scope_description}
          onChange={(e) =>
            setFormData({ ...formData, scope_description: e.target.value })
          }
          rows={4}
          placeholder="Describe the work you need done..."
        />

        {/* Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Proposed Amount"
            type="number"
            value={formData.proposed_amount || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                proposed_amount: e.target.value
                  ? parseFloat(e.target.value)
                  : undefined,
              })
            }
            placeholder="$0.00"
            leftIcon={<DollarSign className="h-4 w-4" />}
          />
          <Select
            label="Rate Type"
            options={RATE_TYPE_OPTIONS}
            value={formData.rate_type || "fixed"}
            onChange={(e) =>
              setFormData({ ...formData, rate_type: e.target.value as RateType })
            }
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Estimated Start Date"
            type="date"
            value={formData.estimated_start_date}
            onChange={(e) =>
              setFormData({ ...formData, estimated_start_date: e.target.value })
            }
          />
          <Input
            label="Estimated End Date"
            type="date"
            value={formData.estimated_end_date}
            onChange={(e) =>
              setFormData({ ...formData, estimated_end_date: e.target.value })
            }
          />
        </div>

        {/* Send immediately toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.send_immediately}
            onChange={(e) =>
              setFormData({ ...formData, send_immediately: e.target.checked })
            }
            className="rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm">
            Send request immediately (otherwise save as draft)
          </span>
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={
              !formData.project_id ||
              !formData.title ||
              createMutation.isPending
            }
            leftIcon={<Send className="h-4 w-4" />}
          >
            {createMutation.isPending
              ? "Sending..."
              : formData.send_immediately
              ? "Send Request"
              : "Save as Draft"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

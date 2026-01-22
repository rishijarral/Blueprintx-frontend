"use client";

import { useState } from "react";
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
  Select,
  Avatar,
  Modal,
} from "@/components/ui";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common";
import {
  marketplaceApi,
  type UpdateMarketplaceProfileInput,
  type PortfolioProjectInput,
  type PortfolioProject,
} from "@/lib/api/marketplace";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import {
  User,
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  Star,
  Briefcase,
  CheckCircle,
  Clock,
  Edit,
  Plus,
  Trash2,
  Shield,
  Award,
  AlertCircle,
  Save,
  Image,
} from "lucide-react";

const TRADE_OPTIONS = [
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

const AVAILABILITY_OPTIONS = [
  { value: "available", label: "Available for Work" },
  { value: "busy", label: "Busy (Limited Availability)" },
  { value: "not_taking_work", label: "Not Taking New Work" },
];

export default function MarketplaceProfilePage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<PortfolioProject | null>(null);

  const { data: profile, isLoading, error } = useQuery({
    queryKey: queryKeys.marketplace.profile,
    queryFn: () => marketplaceApi.profile.get(),
  });

  const { data: portfolio, isLoading: portfolioLoading } = useQuery({
    queryKey: queryKeys.marketplace.portfolio,
    queryFn: () => marketplaceApi.portfolio.list(),
    enabled: !!profile,
  });

  const requestVerificationMutation = useMutation({
    mutationFn: () => marketplaceApi.profile.requestVerification(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.marketplace.profile });
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

  if (error || !profile) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Marketplace Profile"
          description="Manage your subcontractor profile"
          breadcrumbs={[
            { label: "Dashboard", href: ROUTES.DASHBOARD },
            { label: "Marketplace", href: "/marketplace" },
            { label: "My Profile" },
          ]}
        />
        <Card variant="bordered">
          <CardContent className="p-6">
            <EmptyState
              icon={<User className="h-8 w-8 text-muted-foreground" />}
              title="No Subcontractor Profile"
              description="You don't have a subcontractor profile yet. Create one to appear in the marketplace and bid on tenders."
              action={{
                label: "Create Profile",
                onClick: () => setIsEditing(true),
              }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const verificationStatus = profile.verification_status;
  const isVerified = verificationStatus === "verified";
  const isPending = verificationStatus === "pending";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketplace Profile"
        description="Manage how you appear to potential clients"
        breadcrumbs={[
          { label: "Dashboard", href: ROUTES.DASHBOARD },
          { label: "Marketplace", href: "/marketplace" },
          { label: "My Profile" },
        ]}
        actions={
          <div className="flex gap-2">
            {!isVerified && !isPending && (
              <Button
                variant="outline"
                onClick={() => requestVerificationMutation.mutate()}
                disabled={requestVerificationMutation.isPending}
                leftIcon={<Shield className="h-4 w-4" />}
              >
                Request Verification
              </Button>
            )}
            <Button
              variant="primary"
              onClick={() => setIsEditing(true)}
              leftIcon={<Edit className="h-4 w-4" />}
            >
              Edit Profile
            </Button>
          </div>
        }
      />

      {/* Verification Status Banner */}
      {verificationStatus === "pending" && (
        <Card variant="bordered" className="bg-warning/10 border-warning/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-warning" />
            <div>
              <p className="font-medium text-warning">Verification Pending</p>
              <p className="text-sm text-muted-foreground">
                Your profile is under review. This usually takes 1-2 business days.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {verificationStatus === "rejected" && (
        <Card variant="bordered" className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div className="flex-1">
              <p className="font-medium text-destructive">Verification Rejected</p>
              <p className="text-sm text-muted-foreground">
                Please update your profile and request verification again.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => requestVerificationMutation.mutate()}
            >
              Request Again
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Header */}
          <Card variant="bordered">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <Avatar name={profile.name} size="xl" />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{profile.name}</h2>
                    {isVerified && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  {profile.headline && (
                    <p className="text-muted-foreground mb-3">{profile.headline}</p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary" size="lg">{profile.trade}</Badge>
                    {profile.secondary_trades?.map((trade, i) => (
                      <Badge key={i} variant="outline">{trade}</Badge>
                    ))}
                    <Badge
                      variant={
                        profile.availability_status === "available"
                          ? "success"
                          : profile.availability_status === "busy"
                          ? "warning"
                          : "outline"
                      }
                    >
                      {profile.availability_status?.replace(/_/g, " ")}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-6 pt-4 border-t border-border">
                    <div className="text-center">
                      <div className="flex items-center gap-1 justify-center">
                        <Star className="h-5 w-5 text-warning fill-warning" />
                        <span className="text-2xl font-bold">
                          {profile.rating?.toFixed(1) || "N/A"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {profile.review_count || 0} reviews
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{profile.projects_completed || 0}</p>
                      <p className="text-sm text-muted-foreground">Projects</p>
                    </div>
                    {profile.response_time && (
                      <div className="text-center">
                        <p className="text-2xl font-bold">{profile.response_time}</p>
                        <p className="text-sm text-muted-foreground">Response</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {profile.company_description && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="font-medium mb-2">About</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {profile.company_description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Specialties & Service Areas */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Specialties & Service Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.specialties && profile.specialties.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.specialties.map((s, i) => (
                      <Badge key={i} variant="outline">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {profile.service_areas && profile.service_areas.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Service Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.service_areas.map((area, i) => (
                      <Badge key={i} variant="secondary">{area}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {(!profile.specialties?.length && !profile.service_areas?.length) && (
                <p className="text-muted-foreground text-sm">
                  No specialties or service areas added yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Portfolio */}
          <Card variant="bordered">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Portfolio ({portfolio?.length || 0})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingPortfolio(null);
                  setShowPortfolioModal(true);
                }}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Project
              </Button>
            </CardHeader>
            <CardContent>
              {portfolioLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <SkeletonCard />
                  <SkeletonCard />
                </div>
              ) : !portfolio?.length ? (
                <EmptyState
                  icon={<Image className="h-8 w-8 text-muted-foreground" />}
                  title="No portfolio projects"
                  description="Showcase your best work to attract more clients"
                  action={{
                    label: "Add First Project",
                    onClick: () => setShowPortfolioModal(true),
                  }}
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {portfolio.map((project) => (
                    <PortfolioCard
                      key={project.id}
                      project={project}
                      onEdit={() => {
                        setEditingPortfolio(project);
                        setShowPortfolioModal(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.contact_email && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="truncate">{profile.contact_email}</p>
                  </div>
                </div>
              )}
              {profile.contact_phone && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p>{profile.contact_phone}</p>
                  </div>
                </div>
              )}
              {profile.location && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p>{profile.location}</p>
                  </div>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-muted-foreground">Website</p>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate block"
                    >
                      {profile.website}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Business Info */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.year_established && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Established</span>
                  <span className="font-medium">{profile.year_established}</span>
                </div>
              )}
              {profile.employee_count && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employees</span>
                  <span className="font-medium">{profile.employee_count}</span>
                </div>
              )}
              {(profile.min_project_value || profile.max_project_value) && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Project Range</span>
                  <span className="font-medium">
                    {profile.min_project_value
                      ? formatCurrency(profile.min_project_value / 100)
                      : "$0"}{" "}
                    -{" "}
                    {profile.max_project_value
                      ? formatCurrency(profile.max_project_value / 100)
                      : "No limit"}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verification */}
          {isVerified && (
            <Card variant="bordered" className="bg-success/5 border-success/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-success">Verified</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your profile has been verified for authenticity.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        profile={profile}
      />

      {/* Portfolio Modal */}
      <PortfolioModal
        isOpen={showPortfolioModal}
        onClose={() => {
          setShowPortfolioModal(false);
          setEditingPortfolio(null);
        }}
        project={editingPortfolio}
      />
    </div>
  );
}

// ============================================
// Portfolio Card Component
// ============================================

function PortfolioCard({
  project,
  onEdit,
}: {
  project: PortfolioProject;
  onEdit: () => void;
}) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => marketplaceApi.portfolio.delete(project.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.marketplace.portfolio });
    },
  });

  return (
    <div className="border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-medium">{project.title}</h4>
          {project.trade_category && (
            <Badge variant="outline" size="sm" className="mt-1">
              {project.trade_category}
            </Badge>
          )}
        </div>
        {project.is_featured && (
          <Badge variant="success" size="sm">Featured</Badge>
        )}
      </div>
      
      {project.description && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {project.description}
        </p>
      )}
      
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-3">
        {project.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {project.location}
          </span>
        )}
        {project.project_value && (
          <span>{formatCurrency(project.project_value / 100)}</span>
        )}
        {project.completion_date && (
          <span>{formatDate(project.completion_date)}</span>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

// ============================================
// Edit Profile Modal
// ============================================

function EditProfileModal({
  isOpen,
  onClose,
  profile,
}: {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
}) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<UpdateMarketplaceProfileInput>({
    name: profile?.name || "",
    headline: profile?.headline || "",
    company_description: profile?.company_description || "",
    trade: profile?.trade || "",
    location: profile?.location || "",
    contact_email: profile?.contact_email || "",
    contact_phone: profile?.contact_phone || "",
    website: profile?.website || "",
    year_established: profile?.year_established,
    employee_count: profile?.employee_count || "",
    availability_status: profile?.availability_status || "available",
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateMarketplaceProfileInput) =>
      marketplaceApi.profile.update(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.marketplace.profile });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Company Name *"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Input
          label="Headline"
          value={formData.headline}
          onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
          placeholder="e.g., Licensed Electrical Contractor with 15+ years experience"
        />

        <Textarea
          label="About"
          value={formData.company_description}
          onChange={(e) =>
            setFormData({ ...formData, company_description: e.target.value })
          }
          rows={4}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Primary Trade *"
            options={TRADE_OPTIONS}
            value={formData.trade}
            onChange={(e) => setFormData({ ...formData, trade: e.target.value })}
            required
          />
          <Select
            label="Availability"
            options={AVAILABILITY_OPTIONS}
            value={formData.availability_status}
            onChange={(e) =>
              setFormData({ ...formData, availability_status: e.target.value })
            }
          />
        </div>

        <Input
          label="Location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="City, State"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Contact Email"
            type="email"
            value={formData.contact_email}
            onChange={(e) =>
              setFormData({ ...formData, contact_email: e.target.value })
            }
          />
          <Input
            label="Contact Phone"
            value={formData.contact_phone}
            onChange={(e) =>
              setFormData({ ...formData, contact_phone: e.target.value })
            }
          />
        </div>

        <Input
          label="Website"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          placeholder="https://"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Year Established"
            type="number"
            value={formData.year_established || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                year_established: parseInt(e.target.value) || undefined,
              })
            }
          />
          <Input
            label="Employee Count"
            value={formData.employee_count}
            onChange={(e) =>
              setFormData({ ...formData, employee_count: e.target.value })
            }
            placeholder="e.g., 10-25"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={updateMutation.isPending}
            leftIcon={<Save className="h-4 w-4" />}
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ============================================
// Portfolio Modal
// ============================================

function PortfolioModal({
  isOpen,
  onClose,
  project,
}: {
  isOpen: boolean;
  onClose: () => void;
  project: PortfolioProject | null;
}) {
  const queryClient = useQueryClient();
  const isEdit = !!project;

  const [formData, setFormData] = useState<PortfolioProjectInput>({
    title: project?.title || "",
    description: project?.description || "",
    project_type: project?.project_type || "",
    trade_category: project?.trade_category || "",
    location: project?.location || "",
    completion_date: project?.completion_date || "",
    project_value: project?.project_value,
    client_name: project?.client_name || "",
    client_testimonial: project?.client_testimonial || "",
    is_featured: project?.is_featured || false,
  });

  const createMutation = useMutation({
    mutationFn: (input: PortfolioProjectInput) =>
      marketplaceApi.portfolio.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.marketplace.portfolio });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: PortfolioProjectInput) =>
      marketplaceApi.portfolio.update(project!.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.marketplace.portfolio });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Portfolio Project" : "Add Portfolio Project"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Title *"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={3}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Project Type"
            value={formData.project_type}
            onChange={(e) =>
              setFormData({ ...formData, project_type: e.target.value })
            }
            placeholder="e.g., Commercial, Residential"
          />
          <Input
            label="Trade Category"
            value={formData.trade_category}
            onChange={(e) =>
              setFormData({ ...formData, trade_category: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
          <Input
            label="Completion Date"
            type="date"
            value={formData.completion_date}
            onChange={(e) =>
              setFormData({ ...formData, completion_date: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Project Value (cents)"
            type="number"
            value={formData.project_value || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                project_value: parseInt(e.target.value) || undefined,
              })
            }
          />
          <Input
            label="Client Name"
            value={formData.client_name}
            onChange={(e) =>
              setFormData({ ...formData, client_name: e.target.value })
            }
          />
        </div>

        <Textarea
          label="Client Testimonial"
          value={formData.client_testimonial}
          onChange={(e) =>
            setFormData({ ...formData, client_testimonial: e.target.value })
          }
          rows={2}
        />

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.is_featured}
            onChange={(e) =>
              setFormData({ ...formData, is_featured: e.target.checked })
            }
            className="rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm">Feature this project</span>
        </label>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!formData.title || isPending}
            leftIcon={<Save className="h-4 w-4" />}
          >
            {isPending ? "Saving..." : isEdit ? "Update Project" : "Add Project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

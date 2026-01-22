"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  Button,
  Badge,
  Input,
  Select,
  Avatar,
  Modal,
  Textarea,
} from "@/components/ui";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common";
import { hiringApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import type { ExternalSubcontractor, CreateExternalSubInput } from "@/types/models";
import {
  Search,
  Plus,
  Star,
  Phone,
  Mail,
  MapPin,
  Building2,
  Briefcase,
  Edit,
  Trash2,
  Heart,
  Users,
  ArrowRight,
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
  { value: "other", label: "Other" },
];

export default function MySubcontractorsPage() {
  const [search, setSearch] = useState("");
  const [tradeFilter, setTradeFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.hiring.externalSubs.list({
      search: search || undefined,
      trade: tradeFilter || undefined,
    }),
    queryFn: () =>
      hiringApi.externalSubs.list({
        search: search || undefined,
        trade: tradeFilter || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => hiringApi.externalSubs.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.hiring.externalSubs.all,
      });
    },
  });

  const subcontractors = data?.data || [];

  // Separate preferred and regular
  const preferredSubs = subcontractors.filter((s) => s.is_preferred);
  const regularSubs = subcontractors.filter((s) => !s.is_preferred);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Subcontractors"
        description="Manage your personal subcontractor directory"
        breadcrumbs={[
          { label: "Dashboard", href: ROUTES.DASHBOARD },
          { label: "My Subcontractors" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href={ROUTES.MARKETPLACE}>
              <Button variant="outline" leftIcon={<Users className="h-4 w-4" />}>
                Browse Marketplace
              </Button>
            </Link>
            <Button
              variant="primary"
              onClick={() => setShowAddModal(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add Subcontractor
            </Button>
          </div>
        }
      />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Input
            placeholder="Search by company name, contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            className="bg-card"
          />
        </div>
        <div className="w-full sm:w-52">
          <Select
            options={TRADE_OPTIONS}
            value={tradeFilter}
            onChange={(e) => setTradeFilter(e.target.value)}
            className="bg-card"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : subcontractors.length === 0 ? (
        <Card variant="bordered">
          <CardContent className="p-6">
            <EmptyState
              icon={<Building2 className="h-8 w-8 text-muted-foreground" />}
              title="No subcontractors yet"
              description={
                search || tradeFilter
                  ? "Try adjusting your filters"
                  : "Add subcontractors you've worked with or want to work with"
              }
              action={
                !search && !tradeFilter
                  ? {
                      label: "Add Subcontractor",
                      onClick: () => setShowAddModal(true),
                      icon: <Plus className="h-4 w-4" />,
                    }
                  : {
                      label: "Clear Filters",
                      onClick: () => {
                        setSearch("");
                        setTradeFilter("");
                      },
                    }
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Preferred Subcontractors */}
          {preferredSubs.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold mb-4">
                <Heart className="h-5 w-5 text-error fill-error" />
                Preferred Subcontractors
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {preferredSubs.map((sub) => (
                  <SubcontractorCard
                    key={sub.id}
                    subcontractor={sub}
                    onEdit={() => setEditingId(sub.id)}
                    onDelete={() => deleteMutation.mutate(sub.id)}
                    deleting={deleteMutation.isPending}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Subcontractors */}
          {regularSubs.length > 0 && (
            <div>
              {preferredSubs.length > 0 && (
                <h3 className="text-lg font-semibold mb-4">All Subcontractors</h3>
              )}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {regularSubs.map((sub) => (
                  <SubcontractorCard
                    key={sub.id}
                    subcontractor={sub}
                    onEdit={() => setEditingId(sub.id)}
                    onDelete={() => deleteMutation.mutate(sub.id)}
                    deleting={deleteMutation.isPending}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <SubcontractorModal
        isOpen={showAddModal || !!editingId}
        onClose={() => {
          setShowAddModal(false);
          setEditingId(null);
        }}
        editingId={editingId}
      />
    </div>
  );
}

function SubcontractorCard({
  subcontractor,
  onEdit,
  onDelete,
  deleting,
}: {
  subcontractor: ExternalSubcontractor;
  onEdit: () => void;
  onDelete: () => void;
  deleting: boolean;
}) {
  return (
    <Card variant="bordered" className="hover:shadow-md transition-shadow group">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3">
            <Avatar name={subcontractor.company_name} size="md" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">
                  {subcontractor.company_name}
                </h3>
                {subcontractor.is_preferred && (
                  <Heart className="h-4 w-4 text-error fill-error flex-shrink-0" />
                )}
              </div>
              <Badge variant="secondary" size="sm" className="mt-1">
                {subcontractor.trade}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              disabled={deleting}
              className="text-error hover:text-error"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 text-sm mb-4">
          {subcontractor.contact_name && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{subcontractor.contact_name}</span>
            </div>
          )}
          {subcontractor.contact_email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a
                href={`mailto:${subcontractor.contact_email}`}
                className="text-primary hover:underline truncate"
              >
                {subcontractor.contact_email}
              </a>
            </div>
          )}
          {subcontractor.contact_phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <a
                href={`tel:${subcontractor.contact_phone}`}
                className="text-primary hover:underline"
              >
                {subcontractor.contact_phone}
              </a>
            </div>
          )}
          {subcontractor.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{subcontractor.location}</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm mb-4">
          {subcontractor.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-warning fill-warning" />
              <span className="font-medium">{subcontractor.rating.toFixed(1)}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-muted-foreground">
            <Briefcase className="h-4 w-4" />
            <span>{subcontractor.projects_together} projects together</span>
          </div>
        </div>

        {/* Secondary Trades */}
        {subcontractor.secondary_trades && subcontractor.secondary_trades.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {subcontractor.secondary_trades.slice(0, 3).map((trade, i) => (
              <Badge key={i} variant="outline" size="sm">
                {trade}
              </Badge>
            ))}
            {subcontractor.secondary_trades.length > 3 && (
              <Badge variant="outline" size="sm">
                +{subcontractor.secondary_trades.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-border">
          <Link href={`${ROUTES.HIRING}?external_sub=${subcontractor.id}`}>
            <Button
              variant="outline"
              className="w-full"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Send Hire Request
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function SubcontractorModal({
  isOpen,
  onClose,
  editingId,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingId: string | null;
}) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateExternalSubInput>({
    company_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    trade: "",
    secondary_trades: [],
    location: "",
    address: "",
    license_number: "",
    insurance_info: "",
    notes: "",
    is_preferred: false,
  });

  // Load existing data if editing
  const { data: existingSub } = useQuery({
    queryKey: queryKeys.hiring.externalSubs.detail(editingId || ""),
    queryFn: () => hiringApi.externalSubs.get(editingId!),
    enabled: !!editingId,
  });

  // Update form when editing data loads
  if (existingSub && formData.company_name !== existingSub.company_name) {
    setFormData({
      company_name: existingSub.company_name,
      contact_name: existingSub.contact_name || "",
      contact_email: existingSub.contact_email || "",
      contact_phone: existingSub.contact_phone || "",
      trade: existingSub.trade,
      secondary_trades: existingSub.secondary_trades || [],
      location: existingSub.location || "",
      address: existingSub.address || "",
      license_number: existingSub.license_number || "",
      insurance_info: existingSub.insurance_info || "",
      notes: existingSub.notes || "",
      is_preferred: existingSub.is_preferred,
    });
  }

  const createMutation = useMutation({
    mutationFn: (input: CreateExternalSubInput) =>
      hiringApi.externalSubs.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.hiring.externalSubs.all,
      });
      onClose();
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: CreateExternalSubInput) =>
      hiringApi.externalSubs.update(editingId!, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.hiring.externalSubs.all,
      });
      onClose();
      resetForm();
    },
  });

  const resetForm = () => {
    setFormData({
      company_name: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      trade: "",
      secondary_trades: [],
      location: "",
      address: "",
      license_number: "",
      insurance_info: "",
      notes: "",
      is_preferred: false,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
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
      title={editingId ? "Edit Subcontractor" : "Add Subcontractor"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Company Name *"
            value={formData.company_name}
            onChange={(e) =>
              setFormData({ ...formData, company_name: e.target.value })
            }
            required
          />
          <Select
            label="Primary Trade *"
            options={TRADE_OPTIONS.filter((t) => t.value !== "")}
            value={formData.trade}
            onChange={(e) =>
              setFormData({ ...formData, trade: e.target.value })
            }
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Contact Name"
            value={formData.contact_name}
            onChange={(e) =>
              setFormData({ ...formData, contact_name: e.target.value })
            }
          />
          <Input
            label="Contact Email"
            type="email"
            value={formData.contact_email}
            onChange={(e) =>
              setFormData({ ...formData, contact_email: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Contact Phone"
            type="tel"
            value={formData.contact_phone}
            onChange={(e) =>
              setFormData({ ...formData, contact_phone: e.target.value })
            }
          />
          <Input
            label="Location"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            placeholder="City, State"
          />
        </div>

        <Input
          label="Address"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="License Number"
            value={formData.license_number}
            onChange={(e) =>
              setFormData({ ...formData, license_number: e.target.value })
            }
          />
          <Input
            label="Insurance Info"
            value={formData.insurance_info}
            onChange={(e) =>
              setFormData({ ...formData, insurance_info: e.target.value })
            }
          />
        </div>

        <Textarea
          label="Notes"
          value={formData.notes}
          onChange={(e) =>
            setFormData({ ...formData, notes: e.target.value })
          }
          rows={3}
          placeholder="Any additional notes about this subcontractor..."
        />

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.is_preferred}
            onChange={(e) =>
              setFormData({ ...formData, is_preferred: e.target.checked })
            }
            className="rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm">Mark as preferred subcontractor</span>
        </label>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!formData.company_name || !formData.trade || isPending}
          >
            {isPending
              ? "Saving..."
              : editingId
              ? "Update Subcontractor"
              : "Add Subcontractor"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

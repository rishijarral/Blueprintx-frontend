"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Avatar,
} from "@/components/ui";
import { LoadingPage, EmptyState } from "@/components/common";
import { subcontractorsApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import {
  Users,
  Star,
  MapPin,
  Briefcase,
  CheckCircle,
  Mail,
  Phone,
  Clock,
} from "lucide-react";

interface SubcontractorDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function SubcontractorDetailPage({
  params,
}: SubcontractorDetailPageProps) {
  const resolvedParams = use(params);

  const {
    data: subcontractor,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.subcontractors.detail(resolvedParams.id),
    queryFn: () => subcontractorsApi.get(resolvedParams.id),
  });

  if (isLoading) {
    return <LoadingPage message="Loading profile..." />;
  }

  if (error || !subcontractor) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <EmptyState
          icon={<Users className="h-8 w-8 text-muted-foreground" />}
          title="Subcontractor not found"
          description="The profile you're looking for doesn't exist."
          action={{
            label: "Back to Directory",
            onClick: () => (window.location.href = ROUTES.SUBCONTRACTORS),
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={subcontractor.name}
        breadcrumbs={[
          { label: "Dashboard", href: ROUTES.DASHBOARD },
          { label: "Subcontractors", href: ROUTES.SUBCONTRACTORS },
          { label: subcontractor.name },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Header */}
          <Card variant="bordered">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <Avatar name={subcontractor.name} size="xl" />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold">{subcontractor.name}</h1>
                    {subcontractor.verified && (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <Badge variant="secondary" size="md">
                    {subcontractor.trade}
                  </Badge>
                  {subcontractor.description && (
                    <p className="mt-4 text-muted-foreground">
                      {subcontractor.description}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card variant="bordered">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="h-5 w-5 text-warning fill-warning" />
                  <span className="text-2xl font-bold">
                    {subcontractor.rating?.toFixed(1) || "N/A"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {subcontractor.review_count} reviews
                </p>
              </CardContent>
            </Card>

            <Card variant="bordered">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold mb-1">
                  {subcontractor.projects_completed}
                </div>
                <p className="text-sm text-muted-foreground">
                  Projects Completed
                </p>
              </CardContent>
            </Card>

            <Card variant="bordered">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold mb-1">
                  {subcontractor.average_bid_value
                    ? formatCurrency(subcontractor.average_bid_value)
                    : "N/A"}
                </div>
                <p className="text-sm text-muted-foreground">
                  Avg Project Value
                </p>
              </CardContent>
            </Card>

            <Card variant="bordered">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold mb-1">
                  {subcontractor.response_time || "N/A"}
                </div>
                <p className="text-sm text-muted-foreground">Response Time</p>
              </CardContent>
            </Card>
          </div>

          {/* Specialties */}
          {subcontractor.specialties &&
            subcontractor.specialties.length > 0 && (
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle>Specialties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {subcontractor.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Recent Projects */}
          {subcontractor.recent_projects &&
            subcontractor.recent_projects.length > 0 && (
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle>Recent Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {subcontractor.recent_projects.map((project, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg border border-border"
                      >
                        <div>
                          <p className="font-medium">{project.name}</p>
                          {project.completed && (
                            <p className="text-sm text-muted-foreground">
                              Completed {formatDate(project.completed)}
                            </p>
                          )}
                        </div>
                        {project.value && (
                          <span className="font-semibold">
                            {formatCurrency(project.value)}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {subcontractor.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {subcontractor.location}
                    </p>
                  </div>
                </div>
              )}

              {subcontractor.contact_email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <a
                      href={`mailto:${subcontractor.contact_email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {subcontractor.contact_email}
                    </a>
                  </div>
                </div>
              )}

              {subcontractor.contact_phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <a
                      href={`tel:${subcontractor.contact_phone}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {subcontractor.contact_phone}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card variant="bordered" className="bg-primary/5 border-primary/20">
            <CardContent className="p-6 text-center">
              <Briefcase className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Invite to Tender</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Send this subcontractor an invitation to bid on your project
              </p>
              <Button className="w-full">Send Invitation</Button>
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Member since {formatDate(subcontractor.created_at)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

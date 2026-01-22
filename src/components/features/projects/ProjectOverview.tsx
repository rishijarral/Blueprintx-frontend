"use client";

import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import type { Project } from "@/types/models";
import { MapPin, Calendar, DollarSign, Clock, User } from "lucide-react";

interface ProjectOverviewProps {
  project: Project;
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Info */}
      <div className="lg:col-span-2 space-y-6">
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.description ? (
              <p className="text-muted-foreground">{project.description}</p>
            ) : (
              <p className="text-muted-foreground italic">No description provided</p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  {project.address || project.city ? (
                    <p className="text-sm text-muted-foreground">
                      {project.address && <span>{project.address}<br /></span>}
                      {project.city && project.state && (
                        <span>{project.city}, {project.state} {project.zip_code}</span>
                      )}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not specified</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Estimated Value</p>
                  <p className="text-sm text-muted-foreground">
                    {project.estimated_value ? formatCurrency(project.estimated_value) : "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Card */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Bid Due Date</p>
                  <p className="text-sm text-muted-foreground">
                    {project.bid_due_date ? formatDate(project.bid_due_date) : "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Start Date</p>
                  <p className="text-sm text-muted-foreground">
                    {project.start_date ? formatDate(project.start_date) : "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">End Date</p>
                  <p className="text-sm text-muted-foreground">
                    {project.end_date ? formatDate(project.end_date) : "Not set"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Documents</span>
              <Badge variant="secondary">0</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tenders</span>
              <Badge variant="secondary">0</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Tasks</span>
              <Badge variant="secondary">0</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">RFIs</span>
              <Badge variant="secondary">0</Badge>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm">Project created</p>
                  <p className="text-xs text-muted-foreground">{formatDate(project.created_at)}</p>
                </div>
              </div>
              {project.updated_at !== project.created_at && (
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm">Last updated</p>
                    <p className="text-xs text-muted-foreground">{formatDate(project.updated_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

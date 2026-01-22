"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button, Badge, Input, Select, Card, CardContent } from "@/components/ui";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common";
import { projectsApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_COLORS,
  PROJECT_STATUS_LABELS,
} from "@/lib/constants/statuses";
import { Plus, Search, FolderKanban, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react";

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.projects.list({ search: search || undefined, status: statusFilter || undefined }),
    queryFn: () => projectsApi.list({ search: search || undefined, status: statusFilter || undefined }),
  });

  const projects = data?.data || [];

  const statusOptions = [
    { value: "", label: "All Statuses" },
    ...Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage your construction projects"
        breadcrumbs={[
          { label: "Dashboard", href: ROUTES.DASHBOARD },
          { label: "Projects" },
        ]}
        actions={
          <Link href={ROUTES.PROJECT_NEW}>
            <Button leftIcon={<Plus className="h-4 w-4" />}>New Project</Button>
          </Link>
        }
      />

      {/* Filters */}
      <Card variant="bordered">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                placeholder="All Statuses"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card variant="bordered">
        {isLoading ? (
          <CardContent className="p-6">
            <SkeletonTable rows={5} cols={5} />
          </CardContent>
        ) : projects.length === 0 ? (
          <CardContent className="p-6">
            <EmptyState
              icon={<FolderKanban className="h-8 w-8 text-muted-foreground" />}
              title="No projects found"
              description={search || statusFilter ? "Try adjusting your filters" : "Create your first project to get started"}
              action={
                !search && !statusFilter
                  ? {
                      label: "Create Project",
                      onClick: () => (window.location.href = ROUTES.PROJECT_NEW),
                    }
                  : undefined
              }
            />
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Est. Value</TableHead>
                <TableHead>Bid Due Date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Link
                      href={ROUTES.PROJECT_DETAIL(project.id)}
                      className="font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {project.name}
                    </Link>
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                        {project.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    {project.city && project.state ? (
                      <span className="text-muted-foreground">
                        {project.city}, {project.state}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={PROJECT_STATUS_COLORS[project.status]}>
                      {PROJECT_STATUS_LABELS[project.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {project.estimated_value ? (
                      formatCurrency(project.estimated_value)
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {project.bid_due_date ? (
                      formatDate(project.bid_due_date)
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Link href={ROUTES.PROJECT_DETAIL(project.id)}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`${ROUTES.PROJECT_DETAIL(project.id)}?edit=true`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

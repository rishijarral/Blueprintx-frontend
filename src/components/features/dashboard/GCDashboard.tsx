"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common";
import { projectsApi, tendersApi, tasksApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS } from "@/lib/constants/statuses";
import {
  FolderKanban,
  FileText,
  CheckSquare,
  Users,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  DollarSign,
} from "lucide-react";

export function GCDashboard() {
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: queryKeys.projects.list({ per_page: 5 }),
    queryFn: () => projectsApi.list({ per_page: 5 }),
  });

  const { data: tendersData, isLoading: tendersLoading } = useQuery({
    queryKey: queryKeys.tenders.list({ per_page: 5 }),
    queryFn: () => tendersApi.list({ per_page: 5 }),
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: queryKeys.tasks.list({ per_page: 5, status: "todo" }),
    queryFn: () => tasksApi.list({ per_page: 5, status: "todo" }),
  });

  const projects = projectsData?.data || [];
  const tenders = tendersData?.data || [];
  const tasks = tasksData?.data || [];

  // Calculate stats
  const activeProjects = projects.filter((p) => p.status === "in_progress" || p.status === "active").length;
  const openTenders = tenders.filter((t) => t.status === "open").length;
  const pendingTasks = tasks.length;
  const totalValue = projects.reduce((sum, p) => sum + (p.estimated_value || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your construction projects."
        actions={
          <Link href={ROUTES.PROJECT_NEW}>
            <Button leftIcon={<Plus className="h-4 w-4" />}>New Project</Button>
          </Link>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card variant="bordered">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">{activeProjects}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FolderKanban className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Tenders</p>
                <p className="text-2xl font-bold">{openTenders}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
                <p className="text-2xl font-bold">{pendingTasks}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-warning/10 flex items-center justify-center">
                <CheckSquare className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-info" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Projects */}
        <Card variant="bordered">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Projects</CardTitle>
            <Link href={ROUTES.PROJECTS}>
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {projectsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <SkeletonCard key={i} className="border-0 p-0" />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <EmptyState
                icon={<FolderKanban className="h-8 w-8 text-muted-foreground" />}
                title="No projects yet"
                description="Create your first project to get started"
                action={{
                  label: "Create Project",
                  onClick: () => (window.location.href = ROUTES.PROJECT_NEW),
                }}
              />
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={ROUTES.PROJECT_DETAIL(project.id)}
                    className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{project.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(project.created_at)}</span>
                        {project.estimated_value && (
                          <>
                            <span>•</span>
                            <span>{formatCurrency(project.estimated_value)}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge className={PROJECT_STATUS_COLORS[project.status]}>
                      {PROJECT_STATUS_LABELS[project.status]}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card variant="bordered">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Pending Tasks</CardTitle>
            <Link href={ROUTES.TASKS}>
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-4 w-4" />}>
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <SkeletonCard key={i} className="border-0 p-0" />
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <EmptyState
                icon={<CheckSquare className="h-8 w-8 text-muted-foreground" />}
                title="No pending tasks"
                description="All caught up! Create a task to track your work."
              />
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{task.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {task.due_date && (
                          <>
                            <Clock className="h-3 w-3" />
                            <span>Due {formatDate(task.due_date)}</span>
                          </>
                        )}
                        {task.assignee && (
                          <>
                            <span>•</span>
                            <span>{task.assignee}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Badge variant={task.priority === "urgent" ? "error" : task.priority === "high" ? "warning" : "secondary"}>
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href={ROUTES.PROJECT_NEW}>
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <FolderKanban className="h-5 w-5" />
                <span>New Project</span>
              </Button>
            </Link>
            <Link href={ROUTES.TENDERS}>
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <FileText className="h-5 w-5" />
                <span>Create Tender</span>
              </Button>
            </Link>
            <Link href={ROUTES.SUBCONTRACTORS}>
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <Users className="h-5 w-5" />
                <span>Find Subcontractors</span>
              </Button>
            </Link>
            <Link href={ROUTES.TASKS}>
              <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                <CheckSquare className="h-5 w-5" />
                <span>Add Task</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

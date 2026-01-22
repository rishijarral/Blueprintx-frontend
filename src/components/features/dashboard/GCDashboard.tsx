"use client";

import { memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
} from "@/components/ui";
import { SkeletonCard, SkeletonStat } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common";
import { projectsApi, tendersApi, tasksApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import {
  PROJECT_STATUS_COLORS,
  PROJECT_STATUS_LABELS,
} from "@/lib/constants/statuses";
import type { Project, Task } from "@/types/models";
import {
  FolderKanban,
  FileText,
  CheckSquare,
  Users,
  Plus,
  ArrowRight,
  Clock,
  DollarSign,
  TrendingUp,
} from "lucide-react";

// Color classes - defined outside component to prevent recreation
const COLOR_CLASSES = {
  primary: {
    bg: "bg-primary/10 dark:bg-primary/20",
    icon: "text-primary",
    gradient: "from-primary/5 to-transparent",
    hoverBg: "group-hover:bg-primary/15 dark:group-hover:bg-primary/25",
    border: "group-hover:border-primary/30",
  },
  success: {
    bg: "bg-success/10 dark:bg-success/20",
    icon: "text-success",
    gradient: "from-success/5 to-transparent",
    hoverBg: "group-hover:bg-success/15 dark:group-hover:bg-success/25",
    border: "group-hover:border-success/30",
  },
  warning: {
    bg: "bg-warning/10 dark:bg-warning/20",
    icon: "text-warning",
    gradient: "from-warning/5 to-transparent",
    hoverBg: "group-hover:bg-warning/15 dark:group-hover:bg-warning/25",
    border: "group-hover:border-warning/30",
  },
  info: {
    bg: "bg-info/10 dark:bg-info/20",
    icon: "text-info",
    gradient: "from-info/5 to-transparent",
    hoverBg: "group-hover:bg-info/15 dark:group-hover:bg-info/25",
    border: "group-hover:border-info/30",
  },
} as const;

// Stat Card Component - Memoized to prevent unnecessary re-renders
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  color: keyof typeof COLOR_CLASSES;
  isLoading?: boolean;
  index?: number;
}

const StatCard = memo(function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color,
  isLoading,
  index = 0,
}: StatCardProps) {
  const colorClass = COLOR_CLASSES[color];

  if (isLoading) {
    return <SkeletonStat />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="h-full"
    >
      <Card
        variant="default"
        className={cn(
          "relative overflow-hidden h-full",
          "hover:shadow-md hover:border-border",
          "transition-all duration-300",
        )}
      >
        {/* Subtle gradient background */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-50",
            colorClass.gradient,
          )}
        />
        <CardContent className="relative p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 min-w-0 flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
                {value}
              </p>
              {trend !== undefined && trendLabel && (
                <div className="flex items-center gap-1.5 pt-1">
                  <TrendingUp
                    className={cn(
                      "h-3.5 w-3.5 flex-shrink-0",
                      trend >= 0 ? "text-success" : "text-error rotate-180",
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-semibold",
                      trend >= 0 ? "text-success" : "text-error",
                    )}
                  >
                    {trend >= 0 ? "+" : ""}
                    {trend}%
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {trendLabel}
                  </span>
                </div>
              )}
            </div>
            <div
              className={cn(
                "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl",
                colorClass.bg,
              )}
            >
              <Icon className={cn("h-6 w-6", colorClass.icon)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

// Quick Action Button Component - Memoized to prevent unnecessary re-renders
interface QuickActionButtonProps {
  href: string;
  icon: React.ElementType;
  label: string;
  description: string;
  color: keyof typeof COLOR_CLASSES;
  index: number;
}

const QuickActionButton = memo(function QuickActionButton({
  href,
  icon: Icon,
  label,
  description,
  color,
  index,
}: QuickActionButtonProps) {
  const colorClass = COLOR_CLASSES[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.08, duration: 0.3 }}
    >
      <Link href={href} className="block h-full">
        <div
          className={cn(
            "group flex items-center gap-4 p-4 rounded-xl h-full",
            "bg-muted/30 dark:bg-muted/50",
            "border border-border/50",
            "hover:bg-muted/60 dark:hover:bg-muted/80",
            "transition-all duration-200",
            colorClass.border,
          )}
        >
          <div
            className={cn(
              "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl",
              "transition-colors duration-200",
              colorClass.bg,
              colorClass.hoverBg,
            )}
          >
            <Icon className={cn("h-6 w-6", colorClass.icon)} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground group-hover:text-foreground transition-colors">
              {label}
            </p>
            <p className="text-sm text-muted-foreground truncate">
              {description}
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all flex-shrink-0" />
        </div>
      </Link>
    </motion.div>
  );
});

// Memoized Project List Item
interface ProjectListItemProps {
  project: Project;
  index: number;
}

const ProjectListItem = memo(function ProjectListItem({ project, index }: ProjectListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.08, duration: 0.3 }}
    >
      <Link
        href={ROUTES.PROJECT_DETAIL(project.id)}
        className={cn(
          "flex items-center justify-between gap-3 rounded-xl p-3",
          "bg-muted/30 hover:bg-muted/60",
          "border border-transparent hover:border-border/50",
          "transition-all duration-200",
          "group",
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
            {project.name}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{formatDate(project.created_at)}</span>
            {project.estimated_value && (
              <>
                <span>-</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(project.estimated_value)}
                </span>
              </>
            )}
          </div>
        </div>
        <Badge
          className={cn(
            PROJECT_STATUS_COLORS[project.status],
            "flex-shrink-0",
          )}
          size="sm"
        >
          {PROJECT_STATUS_LABELS[project.status]}
        </Badge>
      </Link>
    </motion.div>
  );
});

// Memoized Task List Item
interface TaskListItemProps {
  task: Task;
  index: number;
}

const TaskListItem = memo(function TaskListItem({ task, index }: TaskListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.35 + index * 0.08, duration: 0.3 }}
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl p-3",
        "bg-muted/30 hover:bg-muted/60",
        "border border-transparent hover:border-border/50",
        "transition-all duration-200",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground truncate">
          {task.title}
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {task.due_date && (
            <>
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Due {formatDate(task.due_date)}</span>
            </>
          )}
          {task.assignee && (
            <>
              <span>-</span>
              <span className="truncate">{task.assignee}</span>
            </>
          )}
        </div>
      </div>
      <Badge
        variant={
          task.priority === "urgent"
            ? "error"
            : task.priority === "high"
              ? "warning"
              : "secondary"
        }
        size="sm"
        className="flex-shrink-0"
      >
        {task.priority}
      </Badge>
    </motion.div>
  );
});

export function GCDashboard() {
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: queryKeys.projects.list({ per_page: 5 }),
    queryFn: () => projectsApi.list({ per_page: 5 }),
    staleTime: 2 * 60 * 1000, // 2 minutes - reduce refetches
  });

  const { data: tendersData, isLoading: tendersLoading } = useQuery({
    queryKey: queryKeys.tenders.list({ per_page: 5 }),
    queryFn: () => tendersApi.list({ per_page: 5 }),
    staleTime: 2 * 60 * 1000,
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: queryKeys.tasks.list({ per_page: 5, status: "todo" }),
    queryFn: () => tasksApi.list({ per_page: 5, status: "todo" }),
    staleTime: 2 * 60 * 1000,
  });

  const projects = projectsData?.data || [];
  const tenders = tendersData?.data || [];
  const tasks = tasksData?.data || [];

  // Memoize stats calculations to prevent recalculation on every render
  const stats = useMemo(() => {
    const activeProjects = projects.filter(
      (p) => p.status === "in_progress" || p.status === "active",
    ).length;
    const openTenders = tenders.filter((t) => t.status === "open").length;
    const pendingTasks = tasks.length;
    const totalValue = projects.reduce(
      (sum, p) => sum + (p.estimated_value || 0),
      0,
    );
    return { activeProjects, openTenders, pendingTasks, totalValue };
  }, [projects, tenders, tasks]);

  const isStatsLoading = projectsLoading || tendersLoading || tasksLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your construction projects.
            </p>
          </div>
          <Link href={ROUTES.PROJECT_NEW} className="flex-shrink-0">
            <Button size="lg" leftIcon={<Plus className="h-5 w-5" />}>
              New Project
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          icon={FolderKanban}
          trend={12}
          trendLabel="this month"
          color="primary"
          isLoading={isStatsLoading}
          index={0}
        />
        <StatCard
          title="Open Tenders"
          value={stats.openTenders}
          icon={FileText}
          trend={5}
          trendLabel="this week"
          color="success"
          isLoading={isStatsLoading}
          index={1}
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon={CheckSquare}
          color="warning"
          isLoading={isStatsLoading}
          index={2}
        />
        <StatCard
          title="Total Value"
          value={formatCurrency(stats.totalValue)}
          icon={DollarSign}
          trend={8}
          trendLabel="vs last month"
          color="info"
          isLoading={isStatsLoading}
          index={3}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Card variant="default" className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20">
                  <FolderKanban className="h-5 w-5 text-primary" />
                </div>
                <CardTitle>Recent Projects</CardTitle>
              </div>
              <Link href={ROUTES.PROJECTS}>
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-20 rounded-xl bg-muted/50 animate-pulse"
                    />
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <EmptyState
                  illustration="blueprint"
                  title="No projects yet"
                  description="Create your first project to get started"
                  action={{
                    label: "Create Project",
                    onClick: () => (window.location.href = ROUTES.PROJECT_NEW),
                  }}
                />
              ) : (
                <div className="space-y-2">
                  {projects.slice(0, 4).map((project, index) => (
                    <ProjectListItem key={project.id} project={project} index={index} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pending Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <Card variant="default" className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 dark:bg-warning/20">
                  <CheckSquare className="h-5 w-5 text-warning" />
                </div>
                <CardTitle>Pending Tasks</CardTitle>
              </div>
              <Link href={ROUTES.TASKS}>
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-20 rounded-xl bg-muted/50 animate-pulse"
                    />
                  ))}
                </div>
              ) : tasks.length === 0 ? (
                <EmptyState
                  illustration="toolbox"
                  title="No pending tasks"
                  description="All caught up! Create a task to track your work."
                />
              ) : (
                <div className="space-y-2">
                  {tasks.slice(0, 4).map((task, index) => (
                    <TaskListItem key={task.id} task={task} index={index} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <QuickActionButton
          href={ROUTES.PROJECT_NEW}
          icon={FolderKanban}
          label="New Project"
          description="Start a new construction project"
          color="primary"
          index={0}
        />
        <QuickActionButton
          href={ROUTES.TENDERS}
          icon={FileText}
          label="Create Tender"
          description="Post a tender for bidding"
          color="success"
          index={1}
        />
        <QuickActionButton
          href={ROUTES.SUBCONTRACTORS}
          icon={Users}
          label="Find Subcontractors"
          description="Browse available subs"
          color="info"
          index={2}
        />
        <QuickActionButton
          href={ROUTES.TASKS}
          icon={CheckSquare}
          label="Add Task"
          description="Create a new task"
          color="warning"
          index={3}
        />
      </div>
    </div>
  );
}

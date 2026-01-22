"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, Badge } from "@/components/ui";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common";
import { tasksApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import { formatDate } from "@/lib/utils/format";
import { TASK_STATUS_COLORS, TASK_STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS } from "@/lib/constants/statuses";
import { CheckSquare } from "lucide-react";

export default function TasksPage() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.tasks.list(),
    queryFn: () => tasksApi.list(),
  });

  const tasks = data?.data || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="All Tasks"
        description="View and manage tasks across all your projects"
        breadcrumbs={[
          { label: "Dashboard", href: ROUTES.DASHBOARD },
          { label: "Tasks" },
        ]}
      />

      <Card variant="bordered">
        {isLoading ? (
          <CardContent className="p-6">
            <SkeletonTable rows={5} cols={5} />
          </CardContent>
        ) : tasks.length === 0 ? (
          <CardContent className="p-6">
            <EmptyState
              icon={<CheckSquare className="h-8 w-8 text-muted-foreground" />}
              title="No tasks yet"
              description="Create tasks from your project pages to track work items"
            />
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <p className="font-medium">{task.title}</p>
                    {task.category && (
                      <p className="text-sm text-muted-foreground">{task.category}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={TASK_STATUS_COLORS[task.status]}>
                      {TASK_STATUS_LABELS[task.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={PRIORITY_COLORS[task.priority]}>
                      {PRIORITY_LABELS[task.priority]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {task.assignee || <span className="text-muted-foreground">Unassigned</span>}
                  </TableCell>
                  <TableCell>
                    {task.due_date ? formatDate(task.due_date) : "—"}
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

"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Modal,
  Input,
  Textarea,
  Select,
  Progress,
} from "@/components/ui";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common";
import { useShowToast } from "@/components/ui/Toast";
import { tasksApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { formatDate } from "@/lib/utils/format";
import {
  TASK_STATUS_COLORS,
  TASK_STATUS_LABELS,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
} from "@/lib/constants/statuses";
import {
  Plus,
  CheckSquare,
  Clock,
  User,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import type { CreateTaskInput, Task } from "@/types/models";

interface ProjectTasksProps {
  projectId: string;
}

export function ProjectTasks({ projectId }: ProjectTasksProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateTaskInput>({
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assignee: "",
    due_date: "",
    category: "",
    progress: 0,
  });

  const queryClient = useQueryClient();
  const toast = useShowToast();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.tasks.byProject(projectId),
    queryFn: () => tasksApi.listByProject(projectId),
  });

  const tasks = data?.data || [];

  const { mutate: createTask, isPending } = useMutation({
    mutationFn: (data: CreateTaskInput) => tasksApi.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.byProject(projectId),
      });
      toast.success("Task created", "Your task has been created successfully.");
      setIsCreateModalOpen(false);
      setFormData({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        assignee: "",
        due_date: "",
        category: "",
        progress: 0,
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to create task", error.message);
    },
  });

  const { mutate: updateTask } = useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: Partial<CreateTaskInput>;
    }) => tasksApi.update(projectId, taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.byProject(projectId),
      });
    },
  });

  const { mutate: deleteTask } = useMutation({
    mutationFn: (taskId: string) => tasksApi.delete(projectId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.tasks.byProject(projectId),
      });
      toast.success("Task deleted", "The task has been removed.");
    },
    onError: (error: Error) => {
      toast.error("Delete failed", error.message);
    },
  });

  // Group tasks by status
  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    completed: tasks.filter((t) => t.status === "completed"),
  };

  const priorityOptions = Object.entries(PRIORITY_LABELS).map(
    ([value, label]) => ({
      value,
      label,
    }),
  );

  const statusOptions = Object.entries(TASK_STATUS_LABELS).map(
    ([value, label]) => ({
      value,
      label,
    }),
  );

  const TaskCard = ({ task }: { task: Task }) => (
    <div className="rounded-lg border border-border p-4 bg-card hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <p className="font-medium text-sm">{task.title}</p>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => deleteTask(task.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {task.priority && (
            <Badge className={PRIORITY_COLORS[task.priority]} size="sm">
              {task.priority}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          {task.due_date && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDate(task.due_date, "MMM d")}</span>
            </div>
          )}
          {task.assignee && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{task.assignee}</span>
            </div>
          )}
        </div>
      </div>

      {task.progress != null && task.progress > 0 && (
        <div className="mt-3">
          <Progress value={task.progress ?? 0} size="sm" />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Tasks</h3>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Add Task
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} variant="bordered">
              <CardContent className="p-4">
                <SkeletonCard />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <Card variant="bordered">
          <CardContent className="p-6">
            <EmptyState
              icon={<CheckSquare className="h-8 w-8 text-muted-foreground" />}
              title="No tasks yet"
              description="Create tasks to track work items for this project"
              action={{
                label: "Add Task",
                onClick: () => setIsCreateModalOpen(true),
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* To Do Column */}
          <Card variant="bordered">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">To Do</CardTitle>
                <Badge variant="secondary">{tasksByStatus.todo.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasksByStatus.todo.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {tasksByStatus.todo.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tasks
                </p>
              )}
            </CardContent>
          </Card>

          {/* In Progress Column */}
          <Card variant="bordered">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  In Progress
                </CardTitle>
                <Badge variant="secondary">
                  {tasksByStatus.in_progress.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasksByStatus.in_progress.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {tasksByStatus.in_progress.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tasks
                </p>
              )}
            </CardContent>
          </Card>

          {/* Completed Column */}
          <Card variant="bordered">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <Badge variant="secondary">
                  {tasksByStatus.completed.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasksByStatus.completed.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
              {tasksByStatus.completed.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No tasks
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Task"
        description="Create a new task for this project"
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => createTask(formData)}
              isLoading={isPending}
              disabled={!formData.title}
            >
              Add Task
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Task Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="e.g., Review electrical plans"
            required
          />

          <Textarea
            label="Description"
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Task details..."
            rows={3}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Status"
              options={statusOptions}
              value={formData.status || "todo"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as typeof formData.status,
                })
              }
            />

            <Select
              label="Priority"
              options={priorityOptions}
              value={formData.priority || "medium"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: e.target.value as typeof formData.priority,
                })
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Assignee"
              value={formData.assignee || ""}
              onChange={(e) =>
                setFormData({ ...formData, assignee: e.target.value })
              }
              placeholder="Person responsible"
            />

            <Input
              label="Due Date"
              type="date"
              value={formData.due_date || ""}
              onChange={(e) =>
                setFormData({ ...formData, due_date: e.target.value })
              }
            />
          </div>

          <Input
            label="Category"
            value={formData.category || ""}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            placeholder="e.g., Design, Permits, Construction"
          />
        </div>
      </Modal>
    </div>
  );
}

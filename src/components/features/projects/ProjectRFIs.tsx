"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Modal, Input, Textarea, Select } from "@/components/ui";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common";
import { useShowToast } from "@/components/ui/Toast";
import { rfisApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { formatDate } from "@/lib/utils/format";
import { RFI_STATUS_COLORS, RFI_STATUS_LABELS, PRIORITY_LABELS } from "@/lib/constants/statuses";
import { Plus, MessageSquare, Eye, Edit, Trash2 } from "lucide-react";
import type { CreateRFIInput } from "@/types/models";

interface ProjectRFIsProps {
  projectId: string;
}

export function ProjectRFIs({ projectId }: ProjectRFIsProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateRFIInput>({
    title: "",
    description: "",
    priority: "medium",
    requester: "",
    assignee: "",
    category: "",
    due_date: "",
  });

  const queryClient = useQueryClient();
  const toast = useShowToast();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.rfis.byProject(projectId),
    queryFn: () => rfisApi.listByProject(projectId),
  });

  const rfis = data?.data || [];

  const { mutate: createRFI, isPending } = useMutation({
    mutationFn: (data: CreateRFIInput) => rfisApi.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rfis.byProject(projectId) });
      toast.success("RFI created", "Your RFI has been created successfully.");
      setIsCreateModalOpen(false);
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        requester: "",
        assignee: "",
        category: "",
        due_date: "",
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to create RFI", error.message);
    },
  });

  const { mutate: deleteRFI } = useMutation({
    mutationFn: (rfiId: string) => rfisApi.delete(projectId, rfiId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.rfis.byProject(projectId) });
      toast.success("RFI deleted", "The RFI has been removed.");
    },
    onError: (error: Error) => {
      toast.error("Delete failed", error.message);
    },
  });

  const priorityOptions = Object.entries(PRIORITY_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <div className="space-y-6">
      <Card variant="bordered">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>RFIs (Request for Information)</CardTitle>
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create RFI
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SkeletonTable rows={3} cols={6} />
          ) : rfis.length === 0 ? (
            <EmptyState
              icon={<MessageSquare className="h-8 w-8 text-muted-foreground" />}
              title="No RFIs yet"
              description="Create RFIs to track questions and requests for information"
              action={{
                label: "Create RFI",
                onClick: () => setIsCreateModalOpen(true),
              }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>RFI #</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfis.map((rfi) => (
                  <TableRow key={rfi.id}>
                    <TableCell>
                      <span className="font-mono text-sm">RFI-{String(rfi.number).padStart(3, "0")}</span>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{rfi.title}</p>
                      {rfi.category && (
                        <p className="text-sm text-muted-foreground">{rfi.category}</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={RFI_STATUS_COLORS[rfi.status]}>
                        {RFI_STATUS_LABELS[rfi.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {rfi.priority ? (
                        <Badge variant="outline">{PRIORITY_LABELS[rfi.priority]}</Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {rfi.due_date ? formatDate(rfi.due_date) : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => deleteRFI(rfi.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create RFI Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create RFI"
        description="Create a new request for information"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createRFI(formData)}
              isLoading={isPending}
              disabled={!formData.title}
            >
              Create RFI
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="RFI Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Brief summary of the question or request"
            required
          />

          <Textarea
            label="Description"
            value={formData.description || ""}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed description of the information needed..."
            rows={4}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Category"
              value={formData.category || ""}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Structural, Electrical"
            />

            <Select
              label="Priority"
              options={priorityOptions}
              value={formData.priority || "medium"}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value as typeof formData.priority })
              }
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Requester"
              value={formData.requester || ""}
              onChange={(e) => setFormData({ ...formData, requester: e.target.value })}
              placeholder="Person requesting info"
            />

            <Input
              label="Assignee"
              value={formData.assignee || ""}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              placeholder="Person to respond"
            />
          </div>

          <Input
            label="Response Due Date"
            type="date"
            value={formData.due_date || ""}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          />
        </div>
      </Modal>
    </div>
  );
}

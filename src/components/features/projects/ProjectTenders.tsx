"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Modal, Input, Textarea, Select } from "@/components/ui";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/common";
import { useShowToast } from "@/components/ui/Toast";
import { tendersApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { TENDER_STATUS_COLORS, TENDER_STATUS_LABELS, PRIORITY_LABELS } from "@/lib/constants/statuses";
import { Plus, FileText, Eye, Edit, Trash2 } from "lucide-react";
import type { CreateTenderInput } from "@/types/models";

interface ProjectTendersProps {
  projectId: string;
}

export function ProjectTenders({ projectId }: ProjectTendersProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateTenderInput>({
    name: "",
    description: "",
    trade_category: "",
    scope_of_work: "",
    bid_due_date: "",
    estimated_value: undefined,
    priority: "medium",
  });

  const queryClient = useQueryClient();
  const toast = useShowToast();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.tenders.byProject(projectId),
    queryFn: () => tendersApi.listByProject(projectId),
  });

  const tenders = data?.data || [];

  const { mutate: createTender, isPending } = useMutation({
    mutationFn: (data: CreateTenderInput) => tendersApi.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenders.byProject(projectId) });
      toast.success("Tender created", "Your tender has been created successfully.");
      setIsCreateModalOpen(false);
      setFormData({
        name: "",
        description: "",
        trade_category: "",
        scope_of_work: "",
        bid_due_date: "",
        estimated_value: undefined,
        priority: "medium",
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to create tender", error.message);
    },
  });

  const { mutate: deleteTender } = useMutation({
    mutationFn: (tenderId: string) => tendersApi.delete(projectId, tenderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tenders.byProject(projectId) });
      toast.success("Tender deleted", "The tender has been removed.");
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
          <CardTitle>Tenders</CardTitle>
          <Button
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Tender
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <SkeletonTable rows={3} cols={5} />
          ) : tenders.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-8 w-8 text-muted-foreground" />}
              title="No tenders yet"
              description="Create tenders to invite subcontractors to bid on specific work packages"
              action={{
                label: "Create Tender",
                onClick: () => setIsCreateModalOpen(true),
              }}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Trade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Est. Value</TableHead>
                  <TableHead>Bid Due</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenders.map((tender) => (
                  <TableRow key={tender.id}>
                    <TableCell>
                      <p className="font-medium">{tender.name}</p>
                      {tender.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {tender.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {tender.trade_category || <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>
                      <Badge className={TENDER_STATUS_COLORS[tender.status]}>
                        {TENDER_STATUS_LABELS[tender.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {tender.estimated_value ? formatCurrency(tender.estimated_value) : "—"}
                    </TableCell>
                    <TableCell>
                      {tender.bid_due_date ? formatDate(tender.bid_due_date) : "—"}
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
                          onClick={() => deleteTender(tender.id)}
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

      {/* Create Tender Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Tender"
        description="Create a new tender package for this project"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createTender(formData)}
              isLoading={isPending}
              disabled={!formData.name}
            >
              Create Tender
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Tender Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Electrical Work Package"
            required
          />

          <Input
            label="Trade Category"
            value={formData.trade_category || ""}
            onChange={(e) => setFormData({ ...formData, trade_category: e.target.value })}
            placeholder="e.g., Electrical, Plumbing, HVAC"
          />

          <Textarea
            label="Description"
            value={formData.description || ""}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of the tender..."
            rows={2}
          />

          <Textarea
            label="Scope of Work"
            value={formData.scope_of_work || ""}
            onChange={(e) => setFormData({ ...formData, scope_of_work: e.target.value })}
            placeholder="Detailed scope of work requirements..."
            rows={4}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Estimated Value ($)"
              type="number"
              value={formData.estimated_value || ""}
              onChange={(e) =>
                setFormData({ ...formData, estimated_value: e.target.value ? Number(e.target.value) : undefined })
              }
              placeholder="0"
            />

            <Input
              label="Bid Due Date"
              type="date"
              value={formData.bid_due_date || ""}
              onChange={(e) => setFormData({ ...formData, bid_due_date: e.target.value })}
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
        </div>
      </Modal>
    </div>
  );
}

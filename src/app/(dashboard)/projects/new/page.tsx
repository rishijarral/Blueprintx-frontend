"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, Select } from "@/components/ui";
import { useShowToast } from "@/components/ui/Toast";
import { projectsApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import { projectSchema, type ProjectFormData } from "@/types/forms";
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS } from "@/lib/constants/statuses";
import { Save, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useShowToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      status: PROJECT_STATUSES.DRAFT,
      estimated_value: undefined,
      bid_due_date: "",
      start_date: "",
      end_date: "",
    },
  });

  const { mutate: createProject, isPending } = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      toast.success("Project created", "Your project has been created successfully.");
      router.push(ROUTES.PROJECT_DETAIL(project.id));
    },
    onError: (error: Error) => {
      toast.error("Failed to create project", error.message);
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    // Clean up NaN values from empty number inputs
    const cleanData = {
      ...data,
      estimated_value:
        typeof data.estimated_value === "number" && !isNaN(data.estimated_value)
          ? data.estimated_value
          : undefined,
    };
    createProject(cleanData);
  };

  const statusOptions = Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Project"
        description="Set up a new construction project"
        breadcrumbs={[
          { label: "Dashboard", href: ROUTES.DASHBOARD },
          { label: "Projects", href: ROUTES.PROJECTS },
          { label: "New Project" },
        ]}
        actions={
          <Link href={ROUTES.PROJECTS}>
            <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Cancel
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  {...register("name")}
                  label="Project Name"
                  placeholder="e.g., Downtown Office Building"
                  error={errors.name?.message}
                  required
                />

                <Textarea
                  {...register("description")}
                  label="Description"
                  placeholder="Describe the project scope, requirements, and key details..."
                  rows={4}
                  error={errors.description?.message}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    {...register("status")}
                    label="Status"
                    options={statusOptions}
                    error={errors.status?.message}
                  />

                  <Input
                    {...register("estimated_value", { valueAsNumber: true })}
                    type="number"
                    label="Estimated Value ($)"
                    placeholder="0"
                    error={errors.estimated_value?.message}
                  />
                </div>
              </CardContent>
            </Card>

            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  {...register("address")}
                  label="Street Address"
                  placeholder="123 Main Street"
                  error={errors.address?.message}
                />

                <div className="grid gap-4 sm:grid-cols-3">
                  <Input
                    {...register("city")}
                    label="City"
                    placeholder="New York"
                    error={errors.city?.message}
                  />

                  <Input
                    {...register("state")}
                    label="State"
                    placeholder="NY"
                    error={errors.state?.message}
                  />

                  <Input
                    {...register("zip_code")}
                    label="ZIP Code"
                    placeholder="10001"
                    error={errors.zip_code?.message}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  {...register("bid_due_date")}
                  type="date"
                  label="Bid Due Date"
                  error={errors.bid_due_date?.message}
                />

                <Input
                  {...register("start_date")}
                  type="date"
                  label="Planned Start Date"
                  error={errors.start_date?.message}
                />

                <Input
                  {...register("end_date")}
                  type="date"
                  label="Planned End Date"
                  error={errors.end_date?.message}
                />
              </CardContent>
            </Card>

            <Card variant="bordered">
              <CardContent className="p-6">
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isPending || isSubmitting}
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  Create Project
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}

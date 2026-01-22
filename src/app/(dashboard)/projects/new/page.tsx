"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Textarea,
  Select,
  Progress,
  Badge,
} from "@/components/ui";
import { useShowToast } from "@/components/ui/Toast";
import { projectsApi, documentsApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import { projectSchema, type ProjectFormData } from "@/types/forms";
import { PROJECT_STATUSES, PROJECT_STATUS_LABELS, DOCUMENT_TYPES } from "@/lib/constants/statuses";
import { formatFileSize } from "@/lib/utils/format";
import {
  Save,
  ArrowLeft,
  ArrowRight,
  Upload,
  FileText,
  X,
  CheckCircle,
  Building2,
  MapPin,
  Calendar,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

type WizardStep = "details" | "location" | "timeline" | "documents" | "review";

const STEPS: { key: WizardStep; label: string; icon: React.ReactNode }[] = [
  { key: "details", label: "Project Details", icon: <Building2 className="h-4 w-4" /> },
  { key: "location", label: "Location", icon: <MapPin className="h-4 w-4" /> },
  { key: "timeline", label: "Timeline", icon: <Calendar className="h-4 w-4" /> },
  { key: "documents", label: "Blueprints", icon: <FileText className="h-4 w-4" /> },
  { key: "review", label: "Review", icon: <CheckCircle className="h-4 w-4" /> },
];

interface UploadedFile {
  file: File;
  id?: string;
  status: "pending" | "uploading" | "processing" | "complete" | "error";
  progress: number;
  error?: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useShowToast();
  const [currentStep, setCurrentStep] = useState<WizardStep>("details");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
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

  const formData = watch();

  const { mutateAsync: createProject, isPending: isCreating } = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      setCreatedProjectId(project.id);
    },
  });

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);
  const progressPercent = ((currentStepIndex + 1) / STEPS.length) * 100;

  const canProceed = useCallback(async (): Promise<boolean> => {
    switch (currentStep) {
      case "details":
        return await trigger(["name", "description", "status", "estimated_value"]);
      case "location":
        return await trigger(["address", "city", "state", "zip_code"]);
      case "timeline":
        return await trigger(["bid_due_date", "start_date", "end_date"]);
      case "documents":
        return true;
      case "review":
        return true;
      default:
        return true;
    }
  }, [currentStep, trigger]);

  const goToStep = async (step: WizardStep) => {
    const targetIndex = STEPS.findIndex((s) => s.key === step);
    if (targetIndex <= currentStepIndex || (await canProceed())) {
      setCurrentStep(step);
    }
  };

  const nextStep = async () => {
    if (!(await canProceed())) return;

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].key);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].key);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles: UploadedFile[] = files
      .filter((file) => file.type === "application/pdf")
      .map((file) => ({
        file,
        status: "pending" as const,
        progress: 0,
      }));

    if (newFiles.length !== files.length) {
      toast.warning("Some files skipped", "Only PDF files are supported for blueprints.");
    }

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (projectId: string) => {
    for (let i = 0; i < uploadedFiles.length; i++) {
      const fileEntry = uploadedFiles[i];
      if (fileEntry.status !== "pending") continue;

      try {
        // Update status to uploading
        setUploadedFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "uploading" as const, progress: 0 } : f
          )
        );

        // Upload the file
        const result = await documentsApi.upload(projectId, fileEntry.file, {
          name: fileEntry.file.name.replace(".pdf", ""),
          document_type: DOCUMENT_TYPES.PLAN,
        });

        // Update to complete
        setUploadedFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? { ...f, id: result.id, status: "complete" as const, progress: 100 }
              : f
          )
        );
      } catch (error) {
        setUploadedFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? {
                  ...f,
                  status: "error" as const,
                  error: error instanceof Error ? error.message : "Upload failed",
                }
              : f
          )
        );
      }
    }
  };

  const onSubmit = async (data: ProjectFormData) => {
    try {
      // Clean up NaN values
      const cleanData = {
        ...data,
        estimated_value:
          typeof data.estimated_value === "number" && !isNaN(data.estimated_value)
            ? data.estimated_value
            : undefined,
      };

      // Create the project
      const project = await createProject(cleanData);

      // Upload files if any
      if (uploadedFiles.length > 0) {
        await uploadFiles(project.id);
      }

      toast.success("Project created", "Your project has been created successfully.");
      router.push(ROUTES.PROJECT_DETAIL(project.id));
    } catch (error) {
      toast.error("Failed to create project", error instanceof Error ? error.message : "Unknown error");
    }
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

      {/* Progress Steps */}
      <Card variant="bordered">
        <CardContent className="p-4">
          <div className="mb-4">
            <Progress value={progressPercent} size="sm" />
          </div>
          <div className="flex justify-between">
            {STEPS.map((step, index) => {
              const isActive = step.key === currentStep;
              const isCompleted = index < currentStepIndex;
              const isClickable = index <= currentStepIndex;

              return (
                <button
                  key={step.key}
                  onClick={() => isClickable && goToStep(step.key)}
                  disabled={!isClickable}
                  className={`flex flex-col items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : isCompleted
                      ? "text-success cursor-pointer hover:bg-success/10"
                      : isClickable
                      ? "text-muted-foreground hover:bg-secondary cursor-pointer"
                      : "text-muted-foreground/50 cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isCompleted
                        ? "bg-success text-success-foreground"
                        : "bg-secondary"
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="h-4 w-4" /> : step.icon}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">{step.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step Content */}
        {currentStep === "details" && (
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                {...register("name")}
                label="Project Name *"
                placeholder="e.g., Downtown Office Building"
                error={errors.name?.message}
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
        )}

        {currentStep === "location" && (
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
        )}

        {currentStep === "timeline" && (
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

              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === "documents" && (
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Upload Blueprints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload your construction drawings and blueprints. AI will automatically
                extract materials, rooms, milestones, and trade scopes.
              </p>

              {/* Drop Zone */}
              <label className="block">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">
                    Drop PDF files here or click to browse
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports PDF files up to 100MB each
                  </p>
                </div>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>

              {/* File List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {file.file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.file.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {file.status === "pending" && (
                          <Badge variant="secondary">Ready</Badge>
                        )}
                        {file.status === "uploading" && (
                          <Badge variant="info" className="flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Uploading
                          </Badge>
                        )}
                        {file.status === "processing" && (
                          <Badge variant="warning">Processing</Badge>
                        )}
                        {file.status === "complete" && (
                          <Badge variant="success">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Done
                          </Badge>
                        )}
                        {file.status === "error" && (
                          <Badge variant="error">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Error
                          </Badge>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          disabled={file.status === "uploading"}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                You can also upload documents after the project is created.
              </p>
            </CardContent>
          </Card>
        )}

        {currentStep === "review" && (
          <div className="space-y-6">
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>Review Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Project Details */}
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">
                    Project Details
                  </h4>
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span className="font-medium">{formData.name || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="secondary">
                        {PROJECT_STATUS_LABELS[formData.status as keyof typeof PROJECT_STATUS_LABELS] || "—"}
                      </Badge>
                    </div>
                    {formData.estimated_value && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estimated Value</span>
                        <span className="font-medium">
                          ${formData.estimated_value.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                {(formData.address || formData.city) && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                      Location
                    </h4>
                    <p>
                      {[formData.address, formData.city, formData.state, formData.zip_code]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </p>
                  </div>
                )}

                {/* Timeline */}
                {(formData.bid_due_date || formData.start_date || formData.end_date) && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                      Timeline
                    </h4>
                    <div className="grid gap-2">
                      {formData.bid_due_date && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bid Due</span>
                          <span>{formData.bid_due_date}</span>
                        </div>
                      )}
                      {formData.start_date && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Start</span>
                          <span>{formData.start_date}</span>
                        </div>
                      )}
                      {formData.end_date && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">End</span>
                          <span>{formData.end_date}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Documents */}
                {uploadedFiles.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-medium text-sm text-muted-foreground mb-2">
                      Blueprints to Upload
                    </h4>
                    <p className="text-sm">
                      {uploadedFiles.length} file{uploadedFiles.length > 1 ? "s" : ""} ready
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Previous
          </Button>

          {currentStep !== "review" ? (
            <Button
              type="button"
              variant="primary"
              onClick={nextStep}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              isLoading={isCreating}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Create Project
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

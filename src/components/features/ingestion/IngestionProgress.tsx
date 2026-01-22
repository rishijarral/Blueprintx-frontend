"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Pause,
  Play,
  RotateCcw,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertTriangle,
  Loader2,
  FileText,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, Button, Progress, Badge } from "@/components/ui";
import type { ProcessingJob, ProcessingStep } from "@/types/models";
import { cn } from "@/lib/utils/cn";

interface IngestionProgressProps {
  job: ProcessingJob;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onRetryStep?: (stepKey: string) => void;
  onRetryJob?: () => void;
  onDismiss?: () => void;
  compact?: boolean;
}

const STATUS_CONFIG = {
  queued: {
    label: "Queued",
    color: "text-steel-500",
    bgColor: "bg-steel-500/10",
    icon: Clock,
  },
  running: {
    label: "Processing",
    color: "text-accent",
    bgColor: "bg-accent/10",
    icon: Loader2,
  },
  paused: {
    label: "Paused",
    color: "text-warning",
    bgColor: "bg-warning/10",
    icon: Pause,
  },
  completed: {
    label: "Completed",
    color: "text-success",
    bgColor: "bg-success/10",
    icon: CheckCircle,
  },
  failed: {
    label: "Failed",
    color: "text-error",
    bgColor: "bg-error/10",
    icon: XCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-steel-400",
    bgColor: "bg-steel-400/10",
    icon: X,
  },
};

const STEP_ICONS: Record<string, typeof FileText> = {
  upload: FileText,
  validate: CheckCircle,
  extract_pages: FileText,
  ocr_pages: Zap,
  chunk_text: FileText,
  generate_embeddings: Zap,
  store_vectors: FileText,
  extract_trade_scopes: Zap,
  extract_materials: Zap,
  extract_rooms: Zap,
  generate_milestones: Zap,
  finalize: CheckCircle,
};

export function IngestionProgress({
  job,
  onPause,
  onResume,
  onCancel,
  onRetryStep,
  onRetryJob,
  onDismiss,
  compact = false,
}: IngestionProgressProps) {
  const [expanded, setExpanded] = useState(!compact);
  const statusConfig = STATUS_CONFIG[job.status];
  const StatusIcon = statusConfig.icon;

  const isActive = job.status === "running" || job.status === "queued";
  const isPaused = job.status === "paused";
  const isFailed = job.status === "failed";
  const isCompleted = job.status === "completed";

  // Calculate time elapsed
  const startTime = job.started_at ? new Date(job.started_at).getTime() : null;
  const endTime = job.completed_at
    ? new Date(job.completed_at).getTime()
    : Date.now();
  const elapsedMs = startTime ? endTime - startTime : 0;
  const elapsedMinutes = Math.floor(elapsedMs / 60000);
  const elapsedSeconds = Math.floor((elapsedMs % 60000) / 1000);

  return (
    <Card
      variant="bordered"
      className={cn(
        "overflow-hidden transition-all duration-300",
        isActive && "ring-2 ring-accent/50",
        isFailed && "ring-2 ring-error/50"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                statusConfig.bgColor
              )}
            >
              <StatusIcon
                className={cn(
                  "h-5 w-5",
                  statusConfig.color,
                  job.status === "running" && "animate-spin"
                )}
              />
            </div>
            <div>
              <CardTitle className="text-base">Blueprint Processing</CardTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="secondary" size="sm" className={statusConfig.bgColor}>
                  <span className={statusConfig.color}>{statusConfig.label}</span>
                </Badge>
                {startTime && (
                  <span className="text-xs text-muted-foreground">
                    {elapsedMinutes}m {elapsedSeconds}s
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Control buttons */}
            {isActive && onPause && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onPause}
                title="Pause processing"
              >
                <Pause className="h-4 w-4" />
              </Button>
            )}
            {isPaused && onResume && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResume}
                title="Resume processing"
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
            {isFailed && job.can_retry && onRetryJob && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetryJob}
                title="Retry job"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
            {(isActive || isPaused) && onCancel && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                title="Cancel processing"
                className="text-error hover:text-error"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {(isCompleted || isFailed || job.status === "cancelled") && onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {/* Expand/collapse button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>
              Step {job.completed_steps + (isActive ? 1 : 0)} of {job.total_steps}
            </span>
            <span>{Math.round(job.progress)}%</span>
          </div>
          <Progress
            value={job.progress}
            variant={isFailed ? "error" : isCompleted ? "success" : "gradient"}
            size="md"
            animated={isActive}
            glow={isActive}
          />
        </div>
      </CardHeader>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-2">
              {/* Error message */}
              {job.error_message && (
                <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-error mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-error">
                        {job.error_step
                          ? `Error in ${job.error_step.replace(/_/g, " ")}`
                          : "Processing Error"}
                      </p>
                      <p className="text-xs text-error/80 mt-1">{job.error_message}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Steps list */}
              <div className="space-y-1">
                {job.steps.map((step, index) => (
                  <IngestionStep
                    key={step.id}
                    step={step}
                    isLast={index === job.steps.length - 1}
                    onRetry={
                      step.status === "failed" && onRetryStep
                        ? () => onRetryStep(step.step_key)
                        : undefined
                    }
                  />
                ))}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ============================================
// Step Component
// ============================================

interface IngestionStepProps {
  step: ProcessingStep;
  isLast: boolean;
  onRetry?: () => void;
}

function IngestionStep({ step, isLast, onRetry }: IngestionStepProps) {
  const Icon = STEP_ICONS[step.step_key] || FileText;

  const getStepStyles = () => {
    switch (step.status) {
      case "completed":
        return {
          iconBg: "bg-success/10",
          iconColor: "text-success",
          lineColor: "bg-success",
        };
      case "running":
        return {
          iconBg: "bg-accent/10",
          iconColor: "text-accent",
          lineColor: "bg-accent",
        };
      case "failed":
        return {
          iconBg: "bg-error/10",
          iconColor: "text-error",
          lineColor: "bg-error",
        };
      case "skipped":
        return {
          iconBg: "bg-steel-500/10",
          iconColor: "text-steel-400",
          lineColor: "bg-steel-300",
        };
      default:
        return {
          iconBg: "bg-steel-100 dark:bg-steel-800",
          iconColor: "text-steel-400",
          lineColor: "bg-steel-200 dark:bg-steel-700",
        };
    }
  };

  const styles = getStepStyles();

  return (
    <div className="flex gap-3">
      {/* Icon and line */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full",
            styles.iconBg
          )}
        >
          {step.status === "running" ? (
            <Loader2 className={cn("h-4 w-4 animate-spin", styles.iconColor)} />
          ) : step.status === "completed" ? (
            <CheckCircle className={cn("h-4 w-4", styles.iconColor)} />
          ) : step.status === "failed" ? (
            <XCircle className={cn("h-4 w-4", styles.iconColor)} />
          ) : (
            <Icon className={cn("h-4 w-4", styles.iconColor)} />
          )}
        </div>
        {!isLast && (
          <div className={cn("w-0.5 flex-1 min-h-[16px]", styles.lineColor)} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-3">
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "text-sm font-medium",
              step.status === "pending" && "text-muted-foreground"
            )}
          >
            {step.step_name}
          </span>
          <div className="flex items-center gap-2">
            {step.status === "running" && step.items_total > 0 && (
              <span className="text-xs text-muted-foreground">
                {step.items_processed} / {step.items_total}
              </span>
            )}
            {step.status === "failed" && onRetry && (
              <Button variant="ghost" size="sm" onClick={onRetry}>
                <RotateCcw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </div>
        </div>

        {/* Step progress */}
        {step.status === "running" && (
          <div className="mt-2">
            <Progress
              value={step.progress}
              size="sm"
              variant="default"
              animated
            />
            {step.message && (
              <p className="text-xs text-muted-foreground mt-1">{step.message}</p>
            )}
          </div>
        )}

        {/* Error message */}
        {step.status === "failed" && step.error_message && (
          <p className="text-xs text-error mt-1">{step.error_message}</p>
        )}
      </div>
    </div>
  );
}

// ============================================
// Compact Progress Indicator
// ============================================

interface CompactIngestionIndicatorProps {
  job: ProcessingJob;
  onClick?: () => void;
}

export function CompactIngestionIndicator({
  job,
  onClick,
}: CompactIngestionIndicatorProps) {
  const statusConfig = STATUS_CONFIG[job.status];
  const StatusIcon = statusConfig.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
        "hover:bg-steel-100 dark:hover:bg-steel-800",
        statusConfig.bgColor
      )}
    >
      <StatusIcon
        className={cn(
          "h-4 w-4",
          statusConfig.color,
          job.status === "running" && "animate-spin"
        )}
      />
      <div className="flex flex-col items-start">
        <span className="text-xs font-medium">{statusConfig.label}</span>
        <span className="text-xs text-muted-foreground">
          {Math.round(job.progress)}%
        </span>
      </div>
    </button>
  );
}

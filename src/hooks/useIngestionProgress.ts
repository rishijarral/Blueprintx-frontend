"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { jobsApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import type { ProcessingJob, JobProgressEvent, JobStatus, StepStatus } from "@/types/models";
import { useAccessToken } from "./useAuth";

interface UseIngestionProgressOptions {
  projectId: string;
  enabled?: boolean;
  onJobCompleted?: (jobId: string) => void;
  onJobFailed?: (jobId: string, error: string) => void;
}

interface IngestionProgressState {
  jobs: Map<string, ProcessingJob>;
  activeJobId: string | null;
  isConnected: boolean;
  error: string | null;
}

export function useIngestionProgress({
  projectId,
  enabled = true,
  onJobCompleted,
  onJobFailed,
}: UseIngestionProgressOptions) {
  const queryClient = useQueryClient();
  const { accessToken: token } = useAccessToken();
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const [state, setState] = useState<IngestionProgressState>({
    jobs: new Map(),
    activeJobId: null,
    isConnected: false,
    error: null,
  });

  // Process incoming SSE events
  const handleEvent = useCallback((event: MessageEvent) => {
    try {
      const data: JobProgressEvent = JSON.parse(event.data);

      setState((prev) => {
        const jobs = new Map(prev.jobs);

        switch (data.type) {
          case "job_status_changed": {
            const existing = jobs.get(data.job_id);
            if (existing) {
              jobs.set(data.job_id, {
                ...existing,
                status: data.status as JobStatus,
                progress: data.progress,
                current_step: data.current_step,
              });
            }
            break;
          }

          case "step_started": {
            const existing = jobs.get(data.job_id);
            if (existing) {
              const steps = existing.steps.map((step) =>
                step.step_key === data.step_key
                  ? { ...step, status: "running" as StepStatus }
                  : step
              );
              jobs.set(data.job_id, {
                ...existing,
                steps,
                current_step: data.step_key,
              });
            }
            break;
          }

          case "step_progress": {
            const existing = jobs.get(data.job_id);
            if (existing) {
              const steps = existing.steps.map((step) =>
                step.step_key === data.step_key
                  ? {
                      ...step,
                      progress: data.progress,
                      items_processed: data.items_processed,
                      items_total: data.items_total,
                      message: data.message,
                    }
                  : step
              );
              jobs.set(data.job_id, { ...existing, steps });
            }
            break;
          }

          case "step_completed": {
            const existing = jobs.get(data.job_id);
            if (existing) {
              const steps = existing.steps.map((step) =>
                step.step_key === data.step_key
                  ? { ...step, status: "completed" as StepStatus, progress: 100 }
                  : step
              );
              const completedSteps = steps.filter((s) => s.status === "completed").length;
              jobs.set(data.job_id, {
                ...existing,
                steps,
                completed_steps: completedSteps,
              });
            }
            break;
          }

          case "step_failed": {
            const existing = jobs.get(data.job_id);
            if (existing) {
              const steps = existing.steps.map((step) =>
                step.step_key === data.step_key
                  ? { ...step, status: "failed" as StepStatus, error_message: data.error }
                  : step
              );
              jobs.set(data.job_id, {
                ...existing,
                steps,
                error_step: data.step_key,
                can_retry: data.can_retry,
              });
            }
            break;
          }

          case "job_completed": {
            const existing = jobs.get(data.job_id);
            if (existing) {
              jobs.set(data.job_id, {
                ...existing,
                status: "completed",
                progress: 100,
                completed_at: new Date().toISOString(),
              });
            }
            // Invalidate extraction queries
            queryClient.invalidateQueries({
              queryKey: queryKeys.extraction.summary(projectId),
            });
            onJobCompleted?.(data.job_id);
            break;
          }

          case "job_failed": {
            const existing = jobs.get(data.job_id);
            if (existing) {
              jobs.set(data.job_id, {
                ...existing,
                status: "failed",
                error_message: data.error,
                error_step: data.failed_step,
                can_retry: data.can_retry,
              });
            }
            onJobFailed?.(data.job_id, data.error);
            break;
          }

          case "job_paused": {
            const existing = jobs.get(data.job_id);
            if (existing) {
              jobs.set(data.job_id, {
                ...existing,
                status: "paused",
                paused_at: new Date().toISOString(),
              });
            }
            break;
          }

          case "job_resumed": {
            const existing = jobs.get(data.job_id);
            if (existing) {
              jobs.set(data.job_id, {
                ...existing,
                status: "running",
                paused_at: null,
              });
            }
            break;
          }

          case "job_cancelled": {
            const existing = jobs.get(data.job_id);
            if (existing) {
              jobs.set(data.job_id, {
                ...existing,
                status: "cancelled",
              });
            }
            break;
          }

          case "heartbeat":
            // Just keep the connection alive
            break;
        }

        return { ...prev, jobs };
      });
    } catch (error) {
      console.error("Failed to parse SSE event:", error);
    }
  }, [projectId, queryClient, onJobCompleted, onJobFailed]);

  // Connect to SSE stream
  const connect = useCallback(() => {
    if (!token || !enabled) return;

    const url = new URL(jobsApi.getStreamUrl(projectId));
    // Note: SSE doesn't support Authorization header directly
    // The backend should accept token as query param for SSE
    url.searchParams.set("token", token);

    const eventSource = new EventSource(url.toString());

    eventSource.onopen = () => {
      reconnectAttempts.current = 0;
      setState((prev) => ({ ...prev, isConnected: true, error: null }));
    };

    eventSource.onmessage = handleEvent;

    eventSource.addEventListener("job_update", handleEvent);
    eventSource.addEventListener("heartbeat", handleEvent);

    eventSource.onerror = () => {
      eventSource.close();
      setState((prev) => ({ ...prev, isConnected: false }));

      // Attempt to reconnect with exponential backoff
      if (reconnectAttempts.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectAttempts.current++;
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      } else {
        setState((prev) => ({
          ...prev,
          error: "Connection lost. Please refresh the page.",
        }));
      }
    };

    eventSourceRef.current = eventSource;
  }, [token, enabled, projectId, handleEvent]);

  // Disconnect from SSE stream
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setState((prev) => ({ ...prev, isConnected: false }));
  }, []);

  // Connect/disconnect based on enabled state
  useEffect(() => {
    if (enabled && token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, token, connect, disconnect]);

  // Add a job to track
  const addJob = useCallback((job: ProcessingJob) => {
    setState((prev) => {
      const jobs = new Map(prev.jobs);
      jobs.set(job.id, job);
      return {
        ...prev,
        jobs,
        activeJobId: job.id,
      };
    });
  }, []);

  // Remove a job from tracking
  const removeJob = useCallback((jobId: string) => {
    setState((prev) => {
      const jobs = new Map(prev.jobs);
      jobs.delete(jobId);
      return {
        ...prev,
        jobs,
        activeJobId: prev.activeJobId === jobId ? null : prev.activeJobId,
      };
    });
  }, []);

  // Set active job
  const setActiveJob = useCallback((jobId: string | null) => {
    setState((prev) => ({ ...prev, activeJobId: jobId }));
  }, []);

  // Get the active job
  const activeJob = state.activeJobId ? state.jobs.get(state.activeJobId) : null;

  // Get all jobs as array
  const allJobs = Array.from(state.jobs.values());

  // Control actions
  const pauseJob = useCallback(
    async (jobId: string) => {
      const updated = await jobsApi.pause(projectId, jobId);
      addJob(updated);
    },
    [projectId, addJob]
  );

  const resumeJob = useCallback(
    async (jobId: string) => {
      const updated = await jobsApi.resume(projectId, jobId);
      addJob(updated);
    },
    [projectId, addJob]
  );

  const cancelJob = useCallback(
    async (jobId: string) => {
      const updated = await jobsApi.cancel(projectId, jobId);
      addJob(updated);
    },
    [projectId, addJob]
  );

  const retryStep = useCallback(
    async (jobId: string, stepKey: string) => {
      const updated = await jobsApi.retryStep(projectId, jobId, stepKey);
      addJob(updated);
    },
    [projectId, addJob]
  );

  const retryJob = useCallback(
    async (jobId: string) => {
      const updated = await jobsApi.retry(projectId, jobId);
      addJob(updated);
    },
    [projectId, addJob]
  );

  return {
    // State
    jobs: allJobs,
    activeJob,
    isConnected: state.isConnected,
    error: state.error,

    // Actions
    addJob,
    removeJob,
    setActiveJob,
    pauseJob,
    resumeJob,
    cancelJob,
    retryStep,
    retryJob,

    // Connection
    connect,
    disconnect,
  };
}

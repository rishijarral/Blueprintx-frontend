/**
 * Processing Jobs API client
 * Handles document processing jobs with real-time progress
 */

import { apiGet, apiGetPaginated, apiPost } from "./client";
import type { ProcessingJob, JobControlAction } from "@/types/models";
import type { PaginationParams, FilterParams } from "@/types/api";

// ============================================
// Processing Jobs
// ============================================

export interface JobQueryParams extends PaginationParams, FilterParams {
  document_id?: string;
}

export async function startProcessing(
  projectId: string,
  documentId: string,
  autoStart = true
): Promise<ProcessingJob> {
  return apiPost<ProcessingJob>(
    `/projects/${projectId}/documents/${documentId}/process`,
    { auto_start: autoStart }
  );
}

export async function listProjectJobs(
  projectId: string,
  params?: JobQueryParams
) {
  return apiGetPaginated<ProcessingJob>(`/projects/${projectId}/jobs`, params);
}

export async function getJob(
  projectId: string,
  jobId: string
): Promise<ProcessingJob> {
  return apiGet<ProcessingJob>(`/projects/${projectId}/jobs/${jobId}`);
}

export async function controlJob(
  projectId: string,
  jobId: string,
  action: JobControlAction
): Promise<ProcessingJob> {
  // Convert action to the format expected by the backend
  let actionPayload: unknown;
  
  if (action.type === "retry_step") {
    actionPayload = { retry_step: { step_key: action.step_key } };
  } else {
    actionPayload = action.type;
  }

  return apiPost<ProcessingJob>(
    `/projects/${projectId}/jobs/${jobId}/control`,
    { action: actionPayload }
  );
}

export async function pauseJob(
  projectId: string,
  jobId: string
): Promise<ProcessingJob> {
  return controlJob(projectId, jobId, { type: "pause" });
}

export async function resumeJob(
  projectId: string,
  jobId: string
): Promise<ProcessingJob> {
  return controlJob(projectId, jobId, { type: "resume" });
}

export async function cancelJob(
  projectId: string,
  jobId: string
): Promise<ProcessingJob> {
  return controlJob(projectId, jobId, { type: "cancel" });
}

export async function retryJobStep(
  projectId: string,
  jobId: string,
  stepKey: string
): Promise<ProcessingJob> {
  return controlJob(projectId, jobId, { type: "retry_step", step_key: stepKey });
}

export async function retryJob(
  projectId: string,
  jobId: string
): Promise<ProcessingJob> {
  return controlJob(projectId, jobId, { type: "retry_job" });
}

// ============================================
// SSE Stream URL
// ============================================

/**
 * Get the URL for the SSE stream endpoint
 * Used by useIngestionProgress hook
 */
export function getJobStreamUrl(projectId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  return `${baseUrl}/api/projects/${projectId}/jobs/stream`;
}

// ============================================
// Export as namespace
// ============================================

export const jobsApi = {
  startProcessing,
  list: listProjectJobs,
  get: getJob,
  control: controlJob,
  pause: pauseJob,
  resume: resumeJob,
  cancel: cancelJob,
  retryStep: retryJobStep,
  retry: retryJob,
  getStreamUrl: getJobStreamUrl,
};

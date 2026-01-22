import { apiGet, apiGetPaginated, apiPost, apiPut, apiDelete } from "./client";
import type { Task, CreateTaskInput, UpdateTaskInput } from "@/types/models";
import type {
  PaginatedResponse,
  PaginationParams,
  FilterParams,
} from "@/types/api";

export const tasksApi = {
  /**
   * List all tasks for the current user (across all projects)
   */
  list: (params?: PaginationParams & FilterParams) =>
    apiGetPaginated<Task>("/api/tasks", params),

  /**
   * List tasks for a specific project
   */
  listByProject: (
    projectId: string,
    params?: PaginationParams & FilterParams,
  ) => apiGetPaginated<Task>(`/api/projects/${projectId}/tasks`, params),

  /**
   * Get a single task
   */
  get: (projectId: string, taskId: string) =>
    apiGet<Task>(`/api/projects/${projectId}/tasks/${taskId}`),

  /**
   * Create a new task
   */
  create: (projectId: string, data: CreateTaskInput) =>
    apiPost<Task>(`/api/projects/${projectId}/tasks`, data),

  /**
   * Update a task
   */
  update: (projectId: string, taskId: string, data: UpdateTaskInput) =>
    apiPut<Task>(`/api/projects/${projectId}/tasks/${taskId}`, data),

  /**
   * Delete a task
   */
  delete: (projectId: string, taskId: string) =>
    apiDelete<void>(`/api/projects/${projectId}/tasks/${taskId}`),
};

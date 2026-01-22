import { apiGet, apiPost, apiPut, apiDelete } from "./client";
import type { Project, CreateProjectInput, UpdateProjectInput } from "@/types/models";
import type { PaginatedResponse, PaginationParams, FilterParams } from "@/types/api";

export const projectsApi = {
  /**
   * List all projects for the current user
   */
  list: (params?: PaginationParams & FilterParams) =>
    apiGet<PaginatedResponse<Project>>("/api/projects", params),

  /**
   * Get a single project by ID
   */
  get: (id: string) => apiGet<Project>(`/api/projects/${id}`),

  /**
   * Create a new project
   */
  create: (data: CreateProjectInput) => apiPost<Project>("/api/projects", data),

  /**
   * Update a project
   */
  update: (id: string, data: UpdateProjectInput) =>
    apiPut<Project>(`/api/projects/${id}`, data),

  /**
   * Delete a project
   */
  delete: (id: string) => apiDelete<void>(`/api/projects/${id}`),
};

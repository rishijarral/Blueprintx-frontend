import { apiGet, apiGetPaginated, apiPost, apiPut, apiDelete } from "./client";
import type {
  RFI,
  RFIResponse,
  CreateRFIInput,
  UpdateRFIInput,
  CreateRFIResponseInput,
} from "@/types/models";
import type {
  PaginatedResponse,
  PaginationParams,
  FilterParams,
  ApiResponse,
} from "@/types/api";

export const rfisApi = {
  /**
   * List all RFIs for the current user (across all projects)
   */
  list: (params?: PaginationParams & FilterParams) =>
    apiGetPaginated<RFI>("/api/rfis", params),

  /**
   * List RFIs for a specific project
   */
  listByProject: (
    projectId: string,
    params?: PaginationParams & FilterParams,
  ) => apiGetPaginated<RFI>(`/api/projects/${projectId}/rfis`, params),

  /**
   * Get a single RFI
   */
  get: (projectId: string, rfiId: string) =>
    apiGet<RFI>(`/api/projects/${projectId}/rfis/${rfiId}`),

  /**
   * Create a new RFI
   */
  create: (projectId: string, data: CreateRFIInput) =>
    apiPost<RFI>(`/api/projects/${projectId}/rfis`, data),

  /**
   * Update an RFI
   */
  update: (projectId: string, rfiId: string, data: UpdateRFIInput) =>
    apiPut<RFI>(`/api/projects/${projectId}/rfis/${rfiId}`, data),

  /**
   * Delete an RFI
   */
  delete: (projectId: string, rfiId: string) =>
    apiDelete<void>(`/api/projects/${projectId}/rfis/${rfiId}`),

  /**
   * Get responses for an RFI
   */
  getResponses: (projectId: string, rfiId: string) =>
    apiGet<RFIResponse[]>(`/api/projects/${projectId}/rfis/${rfiId}/responses`),

  /**
   * Add a response to an RFI
   */
  addResponse: (
    projectId: string,
    rfiId: string,
    data: CreateRFIResponseInput,
  ) =>
    apiPost<RFIResponse>(
      `/api/projects/${projectId}/rfis/${rfiId}/responses`,
      data,
    ),
};

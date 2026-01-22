import { apiGet, apiPost, apiPut, apiDelete } from "./client";
import type { Tender, CreateTenderInput, UpdateTenderInput } from "@/types/models";
import type { PaginatedResponse, PaginationParams, FilterParams } from "@/types/api";

export const tendersApi = {
  /**
   * List all tenders for the current user
   */
  list: (params?: PaginationParams & FilterParams) =>
    apiGet<PaginatedResponse<Tender>>("/api/tenders", params),

  /**
   * List tenders for a specific project
   */
  listByProject: (projectId: string, params?: PaginationParams) =>
    apiGet<PaginatedResponse<Tender>>(`/api/projects/${projectId}/tenders`, params),

  /**
   * Get a single tender
   */
  get: (projectId: string, tenderId: string) =>
    apiGet<Tender>(`/api/projects/${projectId}/tenders/${tenderId}`),

  /**
   * Create a new tender
   */
  create: (projectId: string, data: CreateTenderInput) =>
    apiPost<Tender>(`/api/projects/${projectId}/tenders`, data),

  /**
   * Update a tender
   */
  update: (projectId: string, tenderId: string, data: UpdateTenderInput) =>
    apiPut<Tender>(`/api/projects/${projectId}/tenders/${tenderId}`, data),

  /**
   * Delete a tender
   */
  delete: (projectId: string, tenderId: string) =>
    apiDelete<void>(`/api/projects/${projectId}/tenders/${tenderId}`),

  /**
   * Get tender marketplace (open tenders for subcontractors)
   */
  marketplace: (params?: PaginationParams & FilterParams & { trade?: string }) =>
    apiGet<PaginatedResponse<Tender>>("/api/tenders", {
      ...params,
      status: "open",
    }),
};

import { apiGet, apiGetPaginated } from "./client";
import type { Subcontractor } from "@/types/models";
import type {
  PaginatedResponse,
  PaginationParams,
  FilterParams,
} from "@/types/api";

export const subcontractorsApi = {
  /**
   * List subcontractors (marketplace/directory)
   */
  list: (
    params?: PaginationParams &
      FilterParams & {
        trade?: string;
        location?: string;
        verified_only?: boolean;
        min_rating?: number;
      },
  ) => apiGetPaginated<Subcontractor>("/api/subcontractors", params),

  /**
   * Get a single subcontractor profile
   */
  get: (id: string) => apiGet<Subcontractor>(`/api/subcontractors/${id}`),

  /**
   * Search subcontractors
   */
  search: (query: string, params?: PaginationParams) =>
    apiGetPaginated<Subcontractor>("/api/subcontractors", {
      ...params,
      search: query,
    }),
};

import { apiGet, apiGetPaginated, apiPost, apiPut } from "./client";
import type { Bid, CreateBidInput, UpdateBidInput } from "@/types/models";
import type {
  PaginatedResponse,
  PaginationParams,
  FilterParams,
} from "@/types/api";

export const bidsApi = {
  /**
   * List bids for a tender (only project owner can view)
   */
  listByTender: (tenderId: string, params?: PaginationParams) =>
    apiGetPaginated<Bid>(`/api/tenders/${tenderId}/bids`, params),

  /**
   * Create a new bid (for subcontractors)
   */
  create: (tenderId: string, data: CreateBidInput) =>
    apiPost<Bid>(`/api/tenders/${tenderId}/bids`, data),

  /**
   * Update a bid
   */
  update: (tenderId: string, bidId: string, data: UpdateBidInput) =>
    apiPut<Bid>(`/api/tenders/${tenderId}/bids/${bidId}`, data),

  /**
   * Get my bids (for subcontractors)
   * Note: Backend currently doesn't have this endpoint.
   * Returns empty data until backend implements /api/bids
   */
  myBids: async (
    params?: PaginationParams & FilterParams,
  ): Promise<PaginatedResponse<Bid>> => {
    try {
      return await apiGetPaginated<Bid>("/api/bids", params);
    } catch (error) {
      // If endpoint doesn't exist (404), return empty response
      if (error && typeof error === "object" && "status" in error) {
        const apiError = error as { status: number };
        if (apiError.status === 404) {
          return {
            data: [],
            pagination: {
              page: params?.page || 1,
              per_page: params?.per_page || 20,
              total_items: 0,
              total_pages: 0,
              has_next: false,
              has_prev: false,
            },
          };
        }
      }
      throw error;
    }
  },
};

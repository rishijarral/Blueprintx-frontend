import { apiGet, apiPost, apiPut } from "./client";
import type { Bid, CreateBidInput, UpdateBidInput } from "@/types/models";
import type { PaginatedResponse, PaginationParams, FilterParams } from "@/types/api";

export const bidsApi = {
  /**
   * List bids for a tender
   */
  listByTender: (tenderId: string, params?: PaginationParams) =>
    apiGet<PaginatedResponse<Bid>>(`/api/tenders/${tenderId}/bids`, params),

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
   * Note: This endpoint might need to be added to the backend
   */
  myBids: (params?: PaginationParams & FilterParams) =>
    apiGet<PaginatedResponse<Bid>>("/api/bids", params),
};

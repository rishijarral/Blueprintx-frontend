import { apiPost, apiGet, apiDelete } from "./client";
import type {
  PlanSummary,
  TradeScopesResponse,
  TenderScopeDocument,
  QnAResponse,
  StandardTrade,
} from "@/types/models";
import type {
  PlanSummaryRequest,
  TradeScopesRequest,
  TenderScopeDocRequest,
  QnARequest,
  ApiResponse,
} from "@/types/api";

/**
 * AI API response wrappers
 */
interface PlanSummaryResponse {
  project_id: string;
  summary: PlanSummary;
  cached: boolean;
}

interface TradeScopesApiResponse {
  project_id: string;
  scopes: TradeScopesResponse;
  cached: boolean;
}

interface TenderScopeDocResponse {
  project_id: string;
  trade: string;
  document: TenderScopeDocument;
}

interface StandardTradesResponse {
  trades: string[];
}

export const aiApi = {
  /**
   * Generate plan summary for a project
   */
  getPlanSummary: async (
    projectId: string,
    data: PlanSummaryRequest,
  ): Promise<PlanSummary> => {
    const response = await apiPost<PlanSummaryResponse>(
      `/api/projects/${projectId}/ai/summary`,
      data,
    );
    return response.summary;
  },

  /**
   * Extract trade scopes from project documents
   */
  getTradeScopes: async (
    projectId: string,
    data: TradeScopesRequest,
  ): Promise<TradeScopesResponse> => {
    const response = await apiPost<TradeScopesApiResponse>(
      `/api/projects/${projectId}/ai/trade-scopes`,
      data,
    );
    return response.scopes;
  },

  /**
   * Generate tender scope document
   */
  generateTenderScopeDoc: async (
    projectId: string,
    data: TenderScopeDocRequest,
  ): Promise<TenderScopeDocument> => {
    const response = await apiPost<TenderScopeDocResponse>(
      `/api/projects/${projectId}/ai/tender-scope-doc`,
      data,
    );
    return response.document;
  },

  /**
   * Ask a question about project documents (RAG Q&A)
   */
  askQuestion: (projectId: string, data: QnARequest) =>
    apiPost<QnAResponse>(`/api/projects/${projectId}/ai/qna`, data),

  /**
   * Get standard trades list
   */
  getStandardTrades: async (): Promise<string[]> => {
    const response = await apiGet<StandardTradesResponse>("/api/ai/trades");
    return response.trades;
  },

  /**
   * Invalidate AI cache for a project
   */
  invalidateCache: (projectId: string) =>
    apiDelete<{ project_id: string; deleted_keys: number }>(
      `/api/projects/${projectId}/ai/cache`,
    ),
};

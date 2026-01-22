import { apiPost, apiGet, apiDelete } from "./client";
import type {
  PlanSummary,
  TradeScope,
  QnAResponse,
  StandardTrade,
} from "@/types/models";
import type {
  PlanSummaryRequest,
  TradeScopesRequest,
  TenderScopeDocRequest,
  QnARequest,
} from "@/types/api";

export const aiApi = {
  /**
   * Generate plan summary for a project
   */
  getPlanSummary: (projectId: string, data?: PlanSummaryRequest) =>
    apiPost<PlanSummary>(`/api/projects/${projectId}/ai/summary`, data || {}),

  /**
   * Extract trade scopes from project documents
   */
  getTradeScopes: (projectId: string, data?: TradeScopesRequest) =>
    apiPost<TradeScope[]>(`/api/projects/${projectId}/ai/trade-scopes`, data || {}),

  /**
   * Generate tender scope document
   */
  generateTenderScopeDoc: (projectId: string, data: TenderScopeDocRequest) =>
    apiPost<{ scope_document: string }>(`/api/projects/${projectId}/ai/tender-scope-doc`, data),

  /**
   * Ask a question about project documents (RAG Q&A)
   */
  askQuestion: (projectId: string, data: QnARequest) =>
    apiPost<QnAResponse>(`/api/projects/${projectId}/ai/qna`, data),

  /**
   * Get standard trades list
   */
  getStandardTrades: () => apiGet<StandardTrade[]>("/api/ai/trades"),

  /**
   * Invalidate AI cache for a project
   */
  invalidateCache: (projectId: string) =>
    apiDelete<void>(`/api/projects/${projectId}/ai/cache`),
};

/**
 * API response types and utilities
 */

// ============================================
// Generic API Types
// ============================================

/**
 * Standard API error response
 */
export interface APIError {
  error: string;
  message: string;
  status_code: number;
  details?: Record<string, unknown>;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

/**
 * Base type for query params that can be passed to API
 */
export type QueryParams = Record<string, string | number | boolean | undefined>;

/**
 * Query parameters for paginated requests
 */
export interface PaginationParams extends QueryParams {
  page?: number;
  per_page?: number;
}

/**
 * Sort parameters
 */
export interface SortParams extends QueryParams {
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

/**
 * Common filter parameters
 */
export interface FilterParams extends QueryParams {
  status?: string;
  search?: string;
  from_date?: string;
  to_date?: string;
}

// ============================================
// Auth Types
// ============================================

export interface SignUpRequest {
  email: string;
  password: string;
  user_type: "gc" | "sub";
  company_name?: string;
  first_name?: string;
  last_name?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number;
  user: AuthUser;
}

export interface AuthUser {
  id: string;
  email: string;
  email_confirmed_at?: string;
  created_at: string;
  updated_at: string;
  app_metadata: {
    provider?: string;
    providers?: string[];
  };
  user_metadata: {
    user_type?: string;
    company_name?: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface SessionResponse {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

// ============================================
// AI Types
// ============================================

export interface PlanSummaryRequest {
  document_ids?: string[];
}

export interface TradeScopesRequest {
  document_ids?: string[];
  trades?: string[];
}

export interface TenderScopeDocRequest {
  trade: string;
  tender_name: string;
  additional_requirements?: string;
}

export interface QnARequest {
  question: string;
  document_ids?: string[];
}

// ============================================
// Upload Types
// ============================================

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface DocumentUploadResponse {
  id: string;
  name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  status: string;
  processing_job_id?: string;
}

// ============================================
// Query Key Factory
// ============================================

/**
 * Centralized query keys for React Query
 * Ensures consistent cache invalidation
 */
export const queryKeys = {
  // Auth
  session: ["session"] as const,
  profile: ["profile"] as const,
  settings: ["settings"] as const,

  // Projects
  projects: {
    all: ["projects"] as const,
    list: (params?: PaginationParams & FilterParams) =>
      ["projects", "list", params] as const,
    detail: (id: string) => ["projects", "detail", id] as const,
  },

  // Documents
  documents: {
    all: (projectId: string) => ["projects", projectId, "documents"] as const,
    list: (projectId: string, params?: PaginationParams) =>
      ["projects", projectId, "documents", "list", params] as const,
    detail: (projectId: string, docId: string) =>
      ["projects", projectId, "documents", "detail", docId] as const,
  },

  // Tenders
  tenders: {
    all: ["tenders"] as const,
    list: (params?: PaginationParams & FilterParams) =>
      ["tenders", "list", params] as const,
    byProject: (projectId: string) =>
      ["projects", projectId, "tenders"] as const,
    detail: (id: string) => ["tenders", "detail", id] as const,
    marketplace: (params?: PaginationParams & FilterParams) =>
      ["tenders", "marketplace", params] as const,
  },

  // Bids
  bids: {
    all: ["bids"] as const,
    list: (params?: PaginationParams & FilterParams) =>
      ["bids", "list", params] as const,
    byTender: (tenderId: string) => ["tenders", tenderId, "bids"] as const,
    detail: (id: string) => ["bids", "detail", id] as const,
  },

  // Tasks
  tasks: {
    all: ["tasks"] as const,
    list: (params?: PaginationParams & FilterParams) =>
      ["tasks", "list", params] as const,
    byProject: (projectId: string) => ["projects", projectId, "tasks"] as const,
    detail: (projectId: string, taskId: string) =>
      ["projects", projectId, "tasks", "detail", taskId] as const,
  },

  // RFIs
  rfis: {
    all: ["rfis"] as const,
    list: (params?: PaginationParams & FilterParams) =>
      ["rfis", "list", params] as const,
    byProject: (projectId: string) => ["projects", projectId, "rfis"] as const,
    detail: (projectId: string, rfiId: string) =>
      ["projects", projectId, "rfis", "detail", rfiId] as const,
    responses: (projectId: string, rfiId: string) =>
      ["projects", projectId, "rfis", rfiId, "responses"] as const,
  },

  // Subcontractors
  subcontractors: {
    all: ["subcontractors"] as const,
    list: (params?: PaginationParams & FilterParams) =>
      ["subcontractors", "list", params] as const,
    detail: (id: string) => ["subcontractors", "detail", id] as const,
  },

  // AI
  ai: {
    summary: (projectId: string) =>
      ["projects", projectId, "ai", "summary"] as const,
    tradeScopes: (projectId: string) =>
      ["projects", projectId, "ai", "trade-scopes"] as const,
    trades: ["ai", "trades"] as const,
  },
} as const;

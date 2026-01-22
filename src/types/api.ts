/**
 * API response types and utilities
 * These types match the Rust backend API responses exactly
 */

// ============================================
// Generic API Types
// ============================================

/**
 * Standard API error response from backend
 */
export interface APIError {
  error: string;
  message: string;
  status_code: number;
  details?: Record<string, unknown>;
  request_id?: string;
}

/**
 * Backend wraps all responses in { data: ... }
 */
export interface ApiResponse<T> {
  data: T;
}

/**
 * Paginated response wrapper - matches backend exactly
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

/**
 * Pagination info - matches backend field names exactly
 */
export interface PaginationInfo {
  page: number;
  per_page: number;
  total_items: number; // Backend uses total_items, not total
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

/**
 * Base type for query params that can be passed to API
 */
export type QueryParams = Record<string, string | number | boolean | string[] | undefined>;

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
}

export interface SignInRequest {
  email: string;
  password: string;
}

/**
 * Auth response when login/signup succeeds
 */
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: AuthUser;
}

/**
 * Auth response when email confirmation is required
 */
export interface AuthConfirmationResponse {
  user_id: string;
  email: string;
  confirmation_required: true;
  message: string;
}

export interface AuthUser {
  id: string;
  email: string;
  user_type: "gc" | "sub";
  created_at: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface SessionResponse {
  user: AuthUser;
  access_token: string;
  expires_at: number;
}

// ============================================
// AI Types
// ============================================

export interface PlanSummaryRequest {
  document_text: string;
  instructions?: string;
}

export interface TradeScopesRequest {
  document_text: string;
  trades?: string[];
}

export interface TenderScopeDocRequest {
  trade: string;
  scope_data: Record<string, unknown>;
  project_context?: string;
  bid_due_date?: string;
}

export interface QnARequest {
  question: string;
  document_id?: string;
  document_text?: string;
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
    detail: (projectId: string, tenderId: string) =>
      ["projects", projectId, "tenders", "detail", tenderId] as const,
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

  // Processing Jobs
  jobs: {
    byProject: (projectId: string) =>
      ["projects", projectId, "jobs"] as const,
    list: (projectId: string, params?: PaginationParams & FilterParams) =>
      ["projects", projectId, "jobs", "list", params] as const,
    detail: (projectId: string, jobId: string) =>
      ["projects", projectId, "jobs", "detail", jobId] as const,
  },

  // Extraction
  extraction: {
    summary: (projectId: string) =>
      ["projects", projectId, "extraction"] as const,
    materials: (projectId: string, params?: PaginationParams & FilterParams) =>
      ["projects", projectId, "extraction", "materials", params] as const,
    rooms: (projectId: string, params?: PaginationParams & FilterParams) =>
      ["projects", projectId, "extraction", "rooms", params] as const,
    milestones: (projectId: string, params?: PaginationParams & FilterParams) =>
      ["projects", projectId, "extraction", "milestones", params] as const,
    tradeScopes: (projectId: string, params?: PaginationParams & FilterParams) =>
      ["projects", projectId, "extraction", "trade-scopes", params] as const,
  },

  // Hiring namespace (includes external subs, requests, messages, contracts)
  hiring: {
    // External Subcontractors (My Subs)
    externalSubs: {
      all: ["my-subcontractors"] as const,
      list: (params?: PaginationParams & FilterParams) =>
        ["my-subcontractors", "list", params] as const,
      detail: (id: string) => ["my-subcontractors", "detail", id] as const,
    },
    
    // Hire Requests
    requests: {
      all: ["hiring"] as const,
      list: (params?: PaginationParams & FilterParams) =>
        ["hiring", "list", params] as const,
      detail: (id: string) => ["hiring", "detail", id] as const,
    },
    
    // Messages
    messages: {
      list: (requestId: string) =>
        ["hiring", requestId, "messages"] as const,
    },
    
    // Contracts
    contracts: {
      all: ["contracts"] as const,
      list: (params?: PaginationParams & FilterParams) =>
        ["contracts", "list", params] as const,
      detail: (id: string) => ["contracts", "detail", id] as const,
      templates: ["contract-templates"] as const,
    },
  },

  // Project Team
  team: {
    byProject: (projectId: string) =>
      ["projects", projectId, "team"] as const,
    detail: (projectId: string, memberId: string) =>
      ["projects", projectId, "team", "detail", memberId] as const,
  },

  // Marketplace (enhanced subcontractors)
  marketplace: {
    all: ["marketplace"] as const,
    subcontractors: {
      list: (params?: PaginationParams & FilterParams) =>
        ["marketplace", "subcontractors", "list", params] as const,
      detail: (id: string) => ["marketplace", "subcontractors", "detail", id] as const,
      portfolio: (id: string) => ["marketplace", "subcontractors", id, "portfolio"] as const,
    },
    profile: ["marketplace", "profile"] as const,
    portfolio: ["marketplace", "profile", "portfolio"] as const,
    savedSearches: ["marketplace", "saved-searches"] as const,
    tenders: {
      list: (params?: PaginationParams & FilterParams) =>
        ["marketplace", "tenders", "list", params] as const,
      detail: (id: string) => ["marketplace", "tenders", "detail", id] as const,
    },
    myBids: (params?: PaginationParams & FilterParams) =>
      ["marketplace", "my-bids", params] as const,
  },

  // Notifications
  notifications: {
    all: ["notifications"] as const,
    list: (params?: PaginationParams & FilterParams) =>
      ["notifications", "list", params] as const,
    unreadCount: ["notifications", "unread-count"] as const,
    detail: (id: string) => ["notifications", "detail", id] as const,
  },

  // Admin
  admin: {
    check: ["admin", "check"] as const,
    stats: ["admin", "stats"] as const,
    verifications: {
      list: (params?: PaginationParams & FilterParams) =>
        ["admin", "verifications", "list", params] as const,
      detail: (id: string) => ["admin", "verifications", "detail", id] as const,
    },
    auditLog: (params?: PaginationParams & FilterParams) =>
      ["admin", "audit-log", params] as const,
  },
} as const;

// ============================================
// New Request Types
// ============================================

export interface StartProcessingRequest {
  auto_start?: boolean;
}

export interface JobControlRequest {
  action: "pause" | "resume" | "cancel" | { retry_step: { step_key: string } } | "retry_job";
}

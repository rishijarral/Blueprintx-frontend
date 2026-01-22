/**
 * Application route constants
 * Centralized route definitions for type-safe navigation
 */

export const ROUTES = {
  // Auth routes
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  
  // Dashboard routes
  DASHBOARD: "/",
  
  // Project routes
  PROJECTS: "/projects",
  PROJECT_NEW: "/projects/new",
  PROJECT_DETAIL: (id: string) => `/projects/${id}`,
  PROJECT_DOCUMENTS: (id: string) => `/projects/${id}?tab=documents`,
  PROJECT_TENDERS: (id: string) => `/projects/${id}?tab=tenders`,
  PROJECT_TASKS: (id: string) => `/projects/${id}?tab=tasks`,
  PROJECT_RFIS: (id: string) => `/projects/${id}?tab=rfis`,
  PROJECT_EXTRACTION: (id: string) => `/projects/${id}?tab=extraction`,
  PROJECT_TEAM: (id: string) => `/projects/${id}?tab=team`,
  PROJECT_ASSISTANT: (id: string) => `/projects/${id}/assistant`,
  
  // Tender routes
  TENDERS: "/tenders",
  TENDER_DETAIL: (id: string) => `/tenders/${id}`,
  
  // Bid routes
  BIDS: "/bids",
  
  // Subcontractor/Marketplace routes
  SUBCONTRACTORS: "/subcontractors",
  SUBCONTRACTOR_DETAIL: (id: string) => `/subcontractors/${id}`,
  MARKETPLACE: "/marketplace",
  MARKETPLACE_DETAIL: (id: string) => `/marketplace/${id}`,
  
  // My Subcontractors (external)
  MY_SUBCONTRACTORS: "/my-subcontractors",
  
  // Hiring routes
  HIRING: "/hiring",
  HIRING_DETAIL: (id: string) => `/hiring/${id}`,
  
  // Contract routes
  CONTRACT_DETAIL: (id: string) => `/contracts/${id}`,
  
  // Task routes
  TASKS: "/tasks",
  
  // RFI routes
  RFIS: "/rfis",
  
  // Settings routes
  SETTINGS: "/settings",
  PROFILE: "/profile",

  // Admin routes
  ADMIN: "/admin",
  ADMIN_VERIFICATIONS: "/admin/verifications",
  ADMIN_VERIFICATION_DETAIL: (id: string) => `/admin/verifications/${id}`,
  ADMIN_AUDIT_LOG: "/admin/audit-log",
} as const;

/**
 * Public routes that don't require authentication
 */
export const PUBLIC_ROUTES = [
  ROUTES.LOGIN,
  ROUTES.SIGNUP,
  ROUTES.FORGOT_PASSWORD,
] as const;

/**
 * Routes only accessible by General Contractors
 */
export const GC_ONLY_ROUTES = [
  ROUTES.PROJECT_NEW,
  ROUTES.SUBCONTRACTORS,
  ROUTES.MARKETPLACE,
  ROUTES.MY_SUBCONTRACTORS,
  ROUTES.HIRING,
] as const;

/**
 * Routes only accessible by Subcontractors
 */
export const SUB_ONLY_ROUTES = [
  ROUTES.BIDS,
] as const;

/**
 * Routes only accessible by Admins
 */
export const ADMIN_ONLY_ROUTES = [
  ROUTES.ADMIN,
  ROUTES.ADMIN_VERIFICATIONS,
  ROUTES.ADMIN_AUDIT_LOG,
] as const;

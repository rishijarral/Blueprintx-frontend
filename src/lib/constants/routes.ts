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
  
  // Tender routes
  TENDERS: "/tenders",
  TENDER_DETAIL: (id: string) => `/tenders/${id}`,
  
  // Bid routes
  BIDS: "/bids",
  
  // Subcontractor routes
  SUBCONTRACTORS: "/subcontractors",
  SUBCONTRACTOR_DETAIL: (id: string) => `/subcontractors/${id}`,
  
  // Task routes
  TASKS: "/tasks",
  
  // RFI routes
  RFIS: "/rfis",
  
  // Settings routes
  SETTINGS: "/settings",
  PROFILE: "/profile",
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
] as const;

/**
 * Routes only accessible by Subcontractors
 */
export const SUB_ONLY_ROUTES = [
  ROUTES.BIDS,
] as const;

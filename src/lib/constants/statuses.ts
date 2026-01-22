/**
 * Status constants matching backend enums
 */

// Project statuses
export const PROJECT_STATUSES = {
  DRAFT: "draft",
  ACTIVE: "active",
  BIDDING: "bidding",
  AWARDED: "awarded",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[keyof typeof PROJECT_STATUSES];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Draft",
  active: "Active",
  bidding: "Bidding",
  awarded: "Awarded",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  active: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  bidding: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  awarded: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  in_progress: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

// Tender statuses
export const TENDER_STATUSES = {
  DRAFT: "draft",
  OPEN: "open",
  CLOSED: "closed",
  AWARDED: "awarded",
  CANCELLED: "cancelled",
} as const;

export type TenderStatus = (typeof TENDER_STATUSES)[keyof typeof TENDER_STATUSES];

export const TENDER_STATUS_LABELS: Record<TenderStatus, string> = {
  draft: "Draft",
  open: "Open for Bids",
  closed: "Closed",
  awarded: "Awarded",
  cancelled: "Cancelled",
};

export const TENDER_STATUS_COLORS: Record<TenderStatus, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  open: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  closed: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  awarded: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

// Bid statuses
export const BID_STATUSES = {
  DRAFT: "draft",
  SUBMITTED: "submitted",
  UNDER_REVIEW: "under_review",
  SHORTLISTED: "shortlisted",
  AWARDED: "awarded",
  REJECTED: "rejected",
  WITHDRAWN: "withdrawn",
} as const;

export type BidStatus = (typeof BID_STATUSES)[keyof typeof BID_STATUSES];

export const BID_STATUS_LABELS: Record<BidStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under Review",
  shortlisted: "Shortlisted",
  awarded: "Awarded",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export const BID_STATUS_COLORS: Record<BidStatus, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  submitted: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  under_review: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  shortlisted: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  awarded: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  withdrawn: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

// Task statuses
export const TASK_STATUSES = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
} as const;

export type TaskStatus = (typeof TASK_STATUSES)[keyof typeof TASK_STATUSES];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  completed: "Completed",
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  completed: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

// RFI statuses
export const RFI_STATUSES = {
  OPEN: "open",
  ANSWERED: "answered",
  CLOSED: "closed",
} as const;

export type RFIStatus = (typeof RFI_STATUSES)[keyof typeof RFI_STATUSES];

export const RFI_STATUS_LABELS: Record<RFIStatus, string> = {
  open: "Open",
  answered: "Answered",
  closed: "Closed",
};

export const RFI_STATUS_COLORS: Record<RFIStatus, string> = {
  open: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  answered: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  closed: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

// Document statuses
export const DOCUMENT_STATUSES = {
  DRAFT: "draft",
  ACTIVE: "active",
  SUPERSEDED: "superseded",
  ARCHIVED: "archived",
} as const;

export type DocumentStatus = (typeof DOCUMENT_STATUSES)[keyof typeof DOCUMENT_STATUSES];

// Document types
export const DOCUMENT_TYPES = {
  PLAN: "plan",
  SPECIFICATION: "specification",
  ADDENDUM: "addendum",
  CONTRACT: "contract",
  CHANGE_ORDER: "change_order",
  SUBMITTAL: "submittal",
  RFI: "rfi",
  OTHER: "other",
} as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[keyof typeof DOCUMENT_TYPES];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  plan: "Plan",
  specification: "Specification",
  addendum: "Addendum",
  contract: "Contract",
  change_order: "Change Order",
  submittal: "Submittal",
  rfi: "RFI",
  other: "Other",
};

// Priority levels
export const PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export type Priority = (typeof PRIORITIES)[keyof typeof PRIORITIES];

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  medium: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  urgent: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

// User types
export const USER_TYPES = {
  GC: "gc",
  SUB: "sub",
} as const;

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];

export const USER_TYPE_LABELS: Record<UserType, string> = {
  gc: "General Contractor",
  sub: "Subcontractor",
};

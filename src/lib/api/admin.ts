/**
 * Admin API client
 * Handles admin panel operations: stats, verifications, audit log
 * All endpoints require admin privileges
 */

import { apiGet, apiGetPaginated, apiPost } from "./client";
import type { PaginationParams, FilterParams } from "@/types/api";

// ============================================
// Types - Dashboard
// ============================================

export interface AdminDashboardStats {
  pending_verifications: number;
  total_subcontractors: number;
  verified_subcontractors: number;
  total_tenders: number;
  open_tenders: number;
  total_bids: number;
  total_contracts: number;
  active_contracts: number;
  total_users: number;
  gc_users: number;
  sub_users: number;
  recent_signups_7d: number;
  recent_verifications_7d: number;
}

// ============================================
// Types - Verification
// ============================================

export interface PendingVerification {
  id: string;
  profile_id?: string;
  name: string;
  trade: string;
  location?: string;
  contact_email?: string;
  headline?: string;
  company_description?: string;
  year_established?: number;
  employee_count?: string;
  certifications: Record<string, unknown>[];
  insurance?: Record<string, unknown>;
  license_info?: Record<string, unknown>;
  created_at: string;
  profile_email?: string;
  profile_name?: string;
}

export interface ApproveVerificationInput {
  notes?: string;
}

export interface RejectVerificationInput {
  reason: string;
  notes?: string;
}

// ============================================
// Types - Audit Log
// ============================================

export type AdminAction =
  | "verify_subcontractor"
  | "reject_subcontractor"
  | "grant_admin"
  | "revoke_admin"
  | "suspend_user"
  | "unsuspend_user"
  | "delete_content"
  | "update_system_setting"
  | "view_sensitive_data";

export type AuditTargetType =
  | "subcontractor"
  | "profile"
  | "tender"
  | "bid"
  | "contract"
  | "review"
  | "project"
  | "system_setting";

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  admin_name?: string;
  action: AdminAction;
  target_type: AuditTargetType;
  target_id?: string;
  details: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

// ============================================
// Query Params
// ============================================

export interface VerificationQueryParams extends PaginationParams, FilterParams {
  trade?: string;
  sort_by?: "created_at" | "name";
  sort_order?: "asc" | "desc";
}

export interface AuditLogQueryParams extends PaginationParams, FilterParams {
  admin_id?: string;
  action?: AdminAction;
  target_type?: AuditTargetType;
  target_id?: string;
  from_date?: string;
  to_date?: string;
}

// ============================================
// API Functions
// ============================================

/**
 * Check if the current user is an admin
 */
export async function checkAdmin(): Promise<{ is_admin: boolean }> {
  return apiGet<{ is_admin: boolean }>("/admin/check");
}

/**
 * Get admin dashboard statistics
 */
export async function getAdminStats(): Promise<AdminDashboardStats> {
  return apiGet<AdminDashboardStats>("/admin/stats");
}

/**
 * List pending verifications
 */
export async function listPendingVerifications(
  params?: VerificationQueryParams
) {
  return apiGetPaginated<PendingVerification>("/admin/verifications", params);
}

/**
 * Get a specific verification request
 */
export async function getVerification(id: string): Promise<PendingVerification> {
  return apiGet<PendingVerification>(`/admin/verifications/${id}`);
}

/**
 * Approve a verification request
 */
export async function approveVerification(
  id: string,
  input?: ApproveVerificationInput
): Promise<{ success: boolean; message: string }> {
  return apiPost(`/admin/verifications/${id}/approve`, input || {});
}

/**
 * Reject a verification request
 */
export async function rejectVerification(
  id: string,
  input: RejectVerificationInput
): Promise<{ success: boolean; message: string }> {
  return apiPost(`/admin/verifications/${id}/reject`, input);
}

/**
 * List admin audit log
 */
export async function listAuditLog(params?: AuditLogQueryParams) {
  return apiGetPaginated<AdminAuditLog>("/admin/audit-log", params);
}

// ============================================
// Export as namespace
// ============================================

export const adminApi = {
  checkAdmin,
  getStats: getAdminStats,

  verifications: {
    list: listPendingVerifications,
    get: getVerification,
    approve: approveVerification,
    reject: rejectVerification,
  },

  auditLog: {
    list: listAuditLog,
  },
};

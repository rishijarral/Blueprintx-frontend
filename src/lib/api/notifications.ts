/**
 * Notifications API client
 * Handles in-app notification management
 */

import { apiGet, apiGetPaginated, apiPost, apiPut, apiDelete } from "./client";
import type { PaginationParams, FilterParams } from "@/types/api";

// ============================================
// Types
// ============================================

export type NotificationType =
  | "bid_received"
  | "bid_awarded"
  | "bid_rejected"
  | "bid_shortlisted"
  | "bid_withdrawn"
  | "hire_request_received"
  | "hire_request_accepted"
  | "hire_request_declined"
  | "hire_request_expired"
  | "contract_sent"
  | "contract_signed"
  | "contract_fully_signed"
  | "review_received"
  | "review_response_received"
  | "profile_verified"
  | "profile_rejected"
  | "profile_viewed"
  | "new_message"
  | "tender_published"
  | "tender_closing_soon"
  | "tender_closed"
  | "system";

export interface Notification {
  id: string;
  notification_type: NotificationType;
  title: string;
  message: string | null;
  data: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface UnreadCountResponse {
  count: number;
}

export interface MarkReadRequest {
  notification_ids: string[];
}

// ============================================
// Query Params
// ============================================

export interface NotificationQueryParams extends PaginationParams, FilterParams {
  unread_only?: boolean;
  notification_type?: NotificationType;
}

// ============================================
// API Functions
// ============================================

/**
 * List notifications for the current user
 */
export async function listNotifications(params?: NotificationQueryParams) {
  return apiGetPaginated<Notification>("/notifications", params);
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<UnreadCountResponse> {
  return apiGet<UnreadCountResponse>("/notifications/unread-count");
}

/**
 * Get a single notification by ID
 */
export async function getNotification(id: string): Promise<Notification> {
  return apiGet<Notification>(`/notifications/${id}`);
}

/**
 * Mark a single notification as read
 */
export async function markNotificationRead(
  id: string
): Promise<{ success: boolean }> {
  return apiPut(`/notifications/${id}/read`, {});
}

/**
 * Mark all notifications as read
 */
export async function markAllRead(): Promise<{
  success: boolean;
  marked_count: number;
}> {
  return apiPut("/notifications/read-all", {});
}

/**
 * Mark specific notifications as read (batch)
 */
export async function markBatchRead(
  notificationIds: string[]
): Promise<{ success: boolean; marked_count: number }> {
  return apiPost<{ success: boolean; marked_count: number }>(
    "/notifications/mark-read",
    { notification_ids: notificationIds }
  );
}

/**
 * Delete a single notification
 */
export async function deleteNotification(id: string): Promise<void> {
  await apiDelete(`/notifications/${id}`);
}

/**
 * Delete all read notifications
 */
export async function deleteAllRead(): Promise<{
  success: boolean;
  deleted_count: number;
}> {
  return apiDelete("/notifications");
}

// ============================================
// Export as namespace
// ============================================

export const notificationsApi = {
  list: listNotifications,
  getUnreadCount,
  get: getNotification,
  markRead: markNotificationRead,
  markAllRead,
  markBatchRead,
  delete: deleteNotification,
  deleteAllRead,
};

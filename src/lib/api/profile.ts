import { apiGet, apiPut, apiPost, apiDelete, apiUpload } from "./client";
import type {
  Profile,
  UserSettings,
  NotificationSettings,
  ThemePreference,
  ChangeEmailRequest,
  ChangeEmailResponse,
  DeleteAccountRequest,
  DeleteAccountResponse,
  AvatarUploadResponse,
} from "@/types/models";

// ============================================
// Types for API requests
// ============================================

export interface UpdateProfileInput {
  first_name?: string;
  last_name?: string;
  phone?: string;
  company_name?: string;
  title?: string;
  bio?: string;
  location?: string;
}

export interface UpdateSettingsInput {
  notification_settings?: NotificationSettings;
  theme_preference?: ThemePreference;
}

// ============================================
// Profile API
// ============================================

export const profileApi = {
  // ==========================================
  // Profile Management
  // ==========================================

  /**
   * Get current user's profile
   */
  getMe: () => apiGet<Profile>("/api/profiles/me"),

  /**
   * Update current user's profile
   */
  updateMe: (data: UpdateProfileInput) => 
    apiPut<Profile>("/api/profiles/me", data),

  /**
   * Upload avatar image
   * @param file - Image file (JPEG, PNG, WebP, max 5MB)
   * @param onProgress - Optional progress callback
   */
  uploadAvatar: (file: File, onProgress?: (progress: number) => void) => {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return Promise.reject(new Error("Invalid file type. Please upload a JPEG, PNG, or WebP image."));
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return Promise.reject(new Error("File size must be less than 5MB."));
    }

    const formData = new FormData();
    formData.append("avatar", file);
    
    return apiUpload<AvatarUploadResponse>(
      "/api/profiles/me/avatar",
      formData,
      onProgress
    );
  },

  /**
   * Delete current user's avatar
   */
  deleteAvatar: () => apiDelete<{ success: boolean }>("/api/profiles/me/avatar"),

  // ==========================================
  // Settings Management
  // ==========================================

  /**
   * Get current user's settings
   */
  getSettings: () => apiGet<UserSettings>("/api/settings"),

  /**
   * Update current user's settings
   * Supports partial updates for notification settings and theme
   */
  updateSettings: (data: UpdateSettingsInput) =>
    apiPut<UserSettings>("/api/settings", data),

  // ==========================================
  // Account Security
  // ==========================================

  /**
   * Request email change
   * Sends verification to new email address
   * Requires password verification for security
   */
  changeEmail: (data: ChangeEmailRequest) =>
    apiPost<ChangeEmailResponse>("/api/settings/email", data),

  /**
   * Request account deletion
   * This may be a soft delete with a grace period depending on backend implementation
   * Requires email confirmation and password for security
   */
  requestAccountDeletion: (data: DeleteAccountRequest) =>
    apiPost<DeleteAccountResponse>("/api/settings/delete-account", data),

  /**
   * Cancel a pending account deletion request
   * Only works during the grace period
   */
  cancelAccountDeletion: () =>
    apiPost<{ success: boolean; message: string }>("/api/settings/cancel-deletion", {}),
};

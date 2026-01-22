import { apiGet, apiPut } from "./client";
import type { Profile, UserSettings, NotificationSettings } from "@/types/models";

export const profileApi = {
  /**
   * Get current user's profile
   */
  getMe: () => apiGet<Profile>("/api/profiles/me"),

  /**
   * Update current user's profile
   */
  updateMe: (data: Partial<Profile>) => apiPut<Profile>("/api/profiles/me", data),

  /**
   * Get current user's settings
   */
  getSettings: () => apiGet<UserSettings>("/api/settings"),

  /**
   * Update current user's settings
   */
  updateSettings: (data: { notification_settings: NotificationSettings }) =>
    apiPut<UserSettings>("/api/settings", data),
};

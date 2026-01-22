import { apiGet, apiPut } from "./client";
import type {
  Profile,
  UserSettings,
  NotificationSettings,
} from "@/types/models";

export const profileApi = {
  /**
   * Get current user's profile
   */
  getMe: () => apiGet<Profile>("/api/profiles/me"),

  /**
   * Update current user's profile
   */
  updateMe: (
    data: Partial<
      Pick<
        Profile,
        | "first_name"
        | "last_name"
        | "phone"
        | "company_name"
        | "title"
        | "bio"
        | "location"
      >
    >,
  ) => apiPut<Profile>("/api/profiles/me", data),

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

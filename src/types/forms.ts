/**
 * Form input types with Zod schema definitions
 * Used for form validation with react-hook-form
 */

import { z } from "zod";
import {
  PROJECT_STATUSES,
  TENDER_STATUSES,
  TASK_STATUSES,
  RFI_STATUSES,
  DOCUMENT_TYPES,
  PRIORITIES,
  USER_TYPES,
} from "@/lib/constants/statuses";

// ============================================
// Auth Forms
// ============================================

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
    user_type: z.enum([USER_TYPES.GC, USER_TYPES.SUB], {
      message: "Please select your role",
    }),
    company_name: z.string().optional(),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupFormData = z.infer<typeof signupSchema>;

// ============================================
// Project Forms
// ============================================

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(255),
  description: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  status: z
    .enum([
      PROJECT_STATUSES.DRAFT,
      PROJECT_STATUSES.ACTIVE,
      PROJECT_STATUSES.BIDDING,
      PROJECT_STATUSES.AWARDED,
      PROJECT_STATUSES.IN_PROGRESS,
      PROJECT_STATUSES.COMPLETED,
      PROJECT_STATUSES.CANCELLED,
    ])
    .optional(),
  estimated_value: z.number().positive("Estimated value must be positive").optional(),
  bid_due_date: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

// ============================================
// Document Forms
// ============================================

export const documentSchema = z.object({
  name: z.string().min(1, "Document name is required").max(255),
  description: z.string().optional(),
  document_type: z.enum([
    DOCUMENT_TYPES.PLAN,
    DOCUMENT_TYPES.SPECIFICATION,
    DOCUMENT_TYPES.ADDENDUM,
    DOCUMENT_TYPES.CONTRACT,
    DOCUMENT_TYPES.CHANGE_ORDER,
    DOCUMENT_TYPES.SUBMITTAL,
    DOCUMENT_TYPES.RFI,
    DOCUMENT_TYPES.OTHER,
  ]),
  category: z.string().optional(),
  author: z.string().optional(),
});

export type DocumentFormData = z.infer<typeof documentSchema>;

// ============================================
// Tender Forms
// ============================================

export const tenderSchema = z.object({
  name: z.string().min(1, "Tender name is required").max(255),
  description: z.string().optional(),
  trade_category: z.string().optional(),
  scope_of_work: z.string().optional(),
  status: z
    .enum([
      TENDER_STATUSES.DRAFT,
      TENDER_STATUSES.OPEN,
      TENDER_STATUSES.CLOSED,
      TENDER_STATUSES.AWARDED,
      TENDER_STATUSES.CANCELLED,
    ])
    .optional(),
  bid_due_date: z.string().optional(),
  estimated_value: z.number().positive("Estimated value must be positive").optional(),
  priority: z
    .enum([
      PRIORITIES.LOW,
      PRIORITIES.MEDIUM,
      PRIORITIES.HIGH,
      PRIORITIES.URGENT,
    ])
    .optional(),
});

export type TenderFormData = z.infer<typeof tenderSchema>;

// ============================================
// Bid Forms
// ============================================

export const bidSchema = z.object({
  company_name: z.string().min(1, "Company name is required").max(255),
  contact_name: z.string().optional(),
  contact_email: z
    .string()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),
  contact_phone: z.string().optional(),
  bid_amount: z.number().positive("Bid amount must be positive"),
  notes: z.string().optional(),
});

export type BidFormData = z.infer<typeof bidSchema>;

// ============================================
// Task Forms
// ============================================

export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(255),
  description: z.string().optional(),
  status: z
    .enum([
      TASK_STATUSES.TODO,
      TASK_STATUSES.IN_PROGRESS,
      TASK_STATUSES.COMPLETED,
    ])
    .optional(),
  priority: z
    .enum([
      PRIORITIES.LOW,
      PRIORITIES.MEDIUM,
      PRIORITIES.HIGH,
      PRIORITIES.URGENT,
    ])
    .optional(),
  assignee: z.string().optional(),
  assignee_id: z.string().uuid().optional().or(z.literal("")),
  due_date: z.string().optional(),
  category: z.string().optional(),
  progress: z.coerce.number().min(0).max(100).optional(),
});

export type TaskFormData = z.infer<typeof taskSchema>;

// ============================================
// RFI Forms
// ============================================

export const rfiSchema = z.object({
  title: z.string().min(1, "RFI title is required").max(255),
  description: z.string().optional(),
  priority: z
    .enum([
      PRIORITIES.LOW,
      PRIORITIES.MEDIUM,
      PRIORITIES.HIGH,
      PRIORITIES.URGENT,
    ])
    .optional(),
  requester: z.string().optional(),
  assignee: z.string().optional(),
  assignee_id: z.string().uuid().optional().or(z.literal("")),
  category: z.string().optional(),
  due_date: z.string().optional(),
});

export type RFIFormData = z.infer<typeof rfiSchema>;

export const rfiResponseSchema = z.object({
  content: z.string().min(1, "Response content is required"),
  author: z.string().optional(),
});

export type RFIResponseFormData = z.infer<typeof rfiResponseSchema>;

// ============================================
// Profile Forms
// ============================================

export const profileSchema = z.object({
  company_name: z.string().optional(),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// ============================================
// Settings Forms
// ============================================

export const notificationSettingsSchema = z.object({
  email_notifications: z.boolean(),
  push_notifications: z.boolean(),
  bid_updates: z.boolean(),
  rfi_alerts: z.boolean(),
  task_reminders: z.boolean(),
  weekly_reports: z.boolean(),
});

export type NotificationSettingsFormData = z.infer<
  typeof notificationSettingsSchema
>;

/**
 * Schema for changing email address
 * Requires current password for security verification
 */
export const changeEmailSchema = z.object({
  new_email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(1, "Current password is required for verification"),
});

export type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;

/**
 * Schema for changing password
 * Validates password strength requirements
 */
export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirm_password: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })
  .refine((data) => data.current_password !== data.new_password, {
    message: "New password must be different from current password",
    path: ["new_password"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

/**
 * Schema for account deletion
 * Requires email confirmation and password for security
 */
export const deleteAccountSchema = z.object({
  confirm_email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email confirmation is required"),
  password: z.string().min(1, "Password is required for verification"),
  reason: z
    .string()
    .max(500, "Reason must be 500 characters or less")
    .optional(),
  acknowledge: z
    .boolean()
    .refine((val) => val === true, {
      message: "You must acknowledge that this action is irreversible",
    }),
});

export type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;

/**
 * Schema for theme preference
 */
export const themePreferenceSchema = z.enum(["light", "dark", "system"]);

export type ThemePreferenceFormData = z.infer<typeof themePreferenceSchema>;

// ============================================
// AI Forms
// ============================================

export const qnaSchema = z.object({
  question: z.string().min(1, "Please enter a question"),
  document_ids: z.array(z.string()).optional(),
});

export type QnAFormData = z.infer<typeof qnaSchema>;

export const tenderScopeDocSchema = z.object({
  trade: z.string().min(1, "Please select a trade"),
  tender_name: z.string().min(1, "Tender name is required"),
  additional_requirements: z.string().optional(),
});

export type TenderScopeDocFormData = z.infer<typeof tenderScopeDocSchema>;

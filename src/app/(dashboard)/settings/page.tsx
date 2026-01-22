"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Switch,
  Button,
  Input,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Modal,
} from "@/components/ui";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useShowToast } from "@/components/ui/Toast";
import { profileApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import { useUIStore } from "@/stores/ui-store";
import { useUser, useUpdatePassword } from "@/hooks/useAuth";
import {
  changeEmailSchema,
  changePasswordSchema,
  deleteAccountSchema,
  type ChangeEmailFormData,
  type ChangePasswordFormData,
  type DeleteAccountFormData,
} from "@/types/forms";
import type { NotificationSettings, ThemePreference } from "@/types/models";
import {
  Bell,
  Mail,
  Smartphone,
  Save,
  FileText,
  User,
  Shield,
  Palette,
  AlertTriangle,
  Key,
  Trash2,
  Sun,
  Moon,
  Monitor,
  ExternalLink,
  Loader2,
  Check,
  X,
} from "lucide-react";

// ============================================
// Constants
// ============================================

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun; description: string }[] = [
  { value: "light", label: "Light", icon: Sun, description: "Always use light mode" },
  { value: "dark", label: "Dark", icon: Moon, description: "Always use dark mode" },
  { value: "system", label: "System", icon: Monitor, description: "Match your system settings" },
];

// ============================================
// Main Component
// ============================================

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const toast = useShowToast();
  const { user, profile } = useUser();
  const { theme, setTheme } = useUIStore();

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => profileApi.getSettings(),
  });

  // Default notification settings matching backend schema
  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: false,
    bid_updates: true,
    rfi_alerts: true,
    task_reminders: true,
    weekly_reports: false,
  });

  const [hasNotificationChanges, setHasNotificationChanges] = useState(false);

  // Sync notifications state with fetched settings
  useEffect(() => {
    if (settings?.notification_settings) {
      setNotifications(settings.notification_settings);
      setHasNotificationChanges(false);
    }
  }, [settings]);

  // Update notification settings mutation
  const { mutate: updateNotifications, isPending: isUpdatingNotifications } = useMutation({
    mutationFn: () =>
      profileApi.updateSettings({ notification_settings: notifications }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
      setHasNotificationChanges(false);
      toast.success("Settings saved", "Your notification preferences have been updated.");
    },
    onError: (error: Error) => {
      toast.error("Failed to save settings", error.message);
    },
  });

  const handleNotificationToggle = useCallback((key: keyof NotificationSettings) => {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      setHasNotificationChanges(true);
      return updated;
    });
  }, []);

  // Handle theme change with persistence to backend
  const handleThemeChange = useCallback((newTheme: ThemePreference) => {
    setTheme(newTheme);
    // Also save to backend for cross-device sync
    profileApi.updateSettings({ theme_preference: newTheme }).catch(() => {
      // Silently fail - local storage is the primary source
    });
  }, [setTheme]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account settings and preferences"
        breadcrumbs={[
          { label: "Dashboard", href: ROUTES.DASHBOARD },
          { label: "Settings" },
        ]}
      />

      <div className="max-w-4xl">
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="account" className="gap-2">
              <User className="h-4 w-4 hidden sm:block" />
              Account
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4 hidden sm:block" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4 hidden sm:block" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="danger" className="gap-2">
              <AlertTriangle className="h-4 w-4 hidden sm:block" />
              Danger Zone
            </TabsTrigger>
          </TabsList>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <AccountSection user={user} profile={profile} />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <NotificationsSection
              notifications={notifications}
              isLoading={isLoading}
              hasChanges={hasNotificationChanges}
              isPending={isUpdatingNotifications}
              onToggle={handleNotificationToggle}
              onSave={() => updateNotifications()}
            />
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <AppearanceSection
              currentTheme={theme}
              onThemeChange={handleThemeChange}
            />
          </TabsContent>

          {/* Danger Zone Tab */}
          <TabsContent value="danger" className="space-y-6">
            <DangerZoneSection userEmail={user?.email || ""} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ============================================
// Account Section
// ============================================

interface AccountSectionProps {
  user: { email?: string } | null | undefined;
  profile: { first_name?: string | null; last_name?: string | null } | null | undefined;
}

function AccountSection({ user, profile }: AccountSectionProps) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const fullName = profile
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
    : "";

  return (
    <>
      {/* Account Overview */}
      <Card variant="bordered">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your account details and login information
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Link */}
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Profile</p>
              <p className="font-medium">{fullName || "Not set"}</p>
            </div>
            <Link href={ROUTES.PROFILE}>
              <Button variant="outline" size="sm" rightIcon={<ExternalLink className="h-3 w-3" />}>
                Edit Profile
              </Button>
            </Link>
          </div>

          {/* Email */}
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email Address</p>
              <p className="font-medium">{user?.email || "Not available"}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEmailModal(true)}
              leftIcon={<Mail className="h-4 w-4" />}
            >
              Change Email
            </Button>
          </div>

          {/* Password */}
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Password</p>
              <p className="font-medium">••••••••••••</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPasswordModal(true)}
              leftIcon={<Key className="h-4 w-4" />}
            >
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <ChangeEmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        currentEmail={user?.email || ""}
      />
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </>
  );
}

// ============================================
// Notifications Section
// ============================================

interface NotificationsSectionProps {
  notifications: NotificationSettings;
  isLoading: boolean;
  hasChanges: boolean;
  isPending: boolean;
  onToggle: (key: keyof NotificationSettings) => void;
  onSave: () => void;
}

function NotificationsSection({
  notifications,
  isLoading,
  hasChanges,
  isPending,
  onToggle,
  onSave,
}: NotificationsSectionProps) {
  return (
    <Card variant="bordered">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure how and when you receive notifications
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <SkeletonCard />
        ) : (
          <>
            {/* Email Notifications */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium">Email Notifications</h4>
              </div>
              <div className="space-y-4 pl-6">
                <Switch
                  label="Email Notifications"
                  description="Receive notifications via email"
                  checked={notifications.email_notifications}
                  onChange={() => onToggle("email_notifications")}
                />
                <Switch
                  label="Bid Updates"
                  description="Get notified about bid status changes and new bids"
                  checked={notifications.bid_updates}
                  onChange={() => onToggle("bid_updates")}
                  disabled={!notifications.email_notifications}
                />
                <Switch
                  label="RFI Alerts"
                  description="Get notified when RFIs are created or answered"
                  checked={notifications.rfi_alerts}
                  onChange={() => onToggle("rfi_alerts")}
                  disabled={!notifications.email_notifications}
                />
                <Switch
                  label="Task Reminders"
                  description="Get reminded about upcoming task deadlines"
                  checked={notifications.task_reminders}
                  onChange={() => onToggle("task_reminders")}
                  disabled={!notifications.email_notifications}
                />
              </div>
            </div>

            <hr className="border-border" />

            {/* Push Notifications */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium">Push Notifications</h4>
              </div>
              <div className="pl-6">
                <Switch
                  label="Enable Push Notifications"
                  description="Receive real-time notifications in your browser"
                  checked={notifications.push_notifications}
                  onChange={() => onToggle("push_notifications")}
                />
              </div>
            </div>

            <hr className="border-border" />

            {/* Reports */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-medium">Reports</h4>
              </div>
              <div className="pl-6">
                <Switch
                  label="Weekly Reports"
                  description="Receive a weekly summary of project activity"
                  checked={notifications.weekly_reports}
                  onChange={() => onToggle("weekly_reports")}
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4 border-t border-border">
              <Button
                onClick={onSave}
                disabled={!hasChanges}
                isLoading={isPending}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Save Changes
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// Appearance Section
// ============================================

interface AppearanceSectionProps {
  currentTheme: ThemePreference;
  onThemeChange: (theme: ThemePreference) => void;
}

function AppearanceSection({ currentTheme, onThemeChange }: AppearanceSectionProps) {
  return (
    <Card variant="bordered">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Palette className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how BlueprintX looks on your device
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <h4 className="mb-4 font-medium">Theme</h4>
          <div className="grid gap-3 sm:grid-cols-3">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = currentTheme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onThemeChange(option.value)}
                  className={`
                    relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all
                    ${isSelected
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                    }
                  `}
                >
                  {isSelected && (
                    <div className="absolute right-2 top-2">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={`
                    flex h-12 w-12 items-center justify-center rounded-full
                    ${isSelected ? "bg-primary/20" : "bg-muted"}
                  `}>
                    <Icon className={`h-6 w-6 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// Danger Zone Section
// ============================================

interface DangerZoneSectionProps {
  userEmail: string;
}

function DangerZoneSection({ userEmail }: DangerZoneSectionProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <>
      <Card variant="bordered" className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions that affect your account
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div>
              <p className="font-medium text-destructive">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        userEmail={userEmail}
      />
    </>
  );
}

// ============================================
// Change Email Modal
// ============================================

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
}

function ChangeEmailModal({ isOpen, onClose, currentEmail }: ChangeEmailModalProps) {
  const toast = useShowToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    mode: "onChange",
  });

  const { mutate: changeEmail, isPending } = useMutation({
    mutationFn: (data: ChangeEmailFormData) =>
      profileApi.changeEmail({
        new_email: data.new_email,
        password: data.password,
      }),
    onSuccess: (response) => {
      toast.success(
        "Verification email sent",
        response.message || "Please check your new email to confirm the change."
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      reset();
      onClose();
    },
    onError: (error: Error) => {
      toast.error("Failed to change email", error.message);
    },
  });

  const onSubmit = (data: ChangeEmailFormData) => {
    if (data.new_email === currentEmail) {
      toast.error("Invalid email", "New email must be different from your current email.");
      return;
    }
    changeEmail(data);
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Email Address" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-sm text-muted-foreground">
            Current email: <span className="font-medium text-foreground">{currentEmail}</span>
          </p>
        </div>

        <Input
          {...register("new_email")}
          type="email"
          label="New Email Address"
          placeholder="Enter your new email"
          error={errors.new_email?.message}
          leftIcon={<Mail className="h-4 w-4" />}
          autoComplete="email"
          required
        />

        <Input
          {...register("password")}
          type="password"
          label="Current Password"
          placeholder="Enter your password to confirm"
          error={errors.password?.message}
          leftIcon={<Key className="h-4 w-4" />}
          autoComplete="current-password"
          required
        />

        <p className="text-sm text-muted-foreground">
          We'll send a verification link to your new email address. Your email won't
          change until you verify the new address.
        </p>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isValid}
            isLoading={isPending}
            leftIcon={<Mail className="h-4 w-4" />}
          >
            Send Verification
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ============================================
// Change Password Modal
// ============================================

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const toast = useShowToast();
  const { mutate: updatePassword, isPending } = useUpdatePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    updatePassword(data.new_password, {
      onSuccess: () => {
        toast.success("Password updated", "Your password has been changed successfully.");
        reset();
        onClose();
      },
      onError: (error) => {
        toast.error("Failed to change password", error.message);
      },
    });
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Password" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          {...register("current_password")}
          type="password"
          label="Current Password"
          placeholder="Enter your current password"
          error={errors.current_password?.message}
          leftIcon={<Key className="h-4 w-4" />}
          autoComplete="current-password"
          required
        />

        <Input
          {...register("new_password")}
          type="password"
          label="New Password"
          placeholder="Enter your new password"
          error={errors.new_password?.message}
          leftIcon={<Shield className="h-4 w-4" />}
          autoComplete="new-password"
          required
        />

        <Input
          {...register("confirm_password")}
          type="password"
          label="Confirm New Password"
          placeholder="Confirm your new password"
          error={errors.confirm_password?.message}
          leftIcon={<Shield className="h-4 w-4" />}
          autoComplete="new-password"
          required
        />

        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-sm font-medium mb-1">Password requirements:</p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>At least 8 characters long</li>
            <li>Contains at least one uppercase letter</li>
            <li>Contains at least one lowercase letter</li>
            <li>Contains at least one number</li>
          </ul>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isValid}
            isLoading={isPending}
            leftIcon={<Key className="h-4 w-4" />}
          >
            Update Password
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ============================================
// Delete Account Modal
// ============================================

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

function DeleteAccountModal({ isOpen, onClose, userEmail }: DeleteAccountModalProps) {
  const toast = useShowToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
    mode: "onChange",
    defaultValues: {
      acknowledge: false,
    },
  });

  const confirmEmail = watch("confirm_email");
  const emailMatches = confirmEmail?.toLowerCase() === userEmail.toLowerCase();

  const { mutate: deleteAccount, isPending } = useMutation({
    mutationFn: (data: DeleteAccountFormData) =>
      profileApi.requestAccountDeletion({
        confirm_email: data.confirm_email,
        password: data.password,
        reason: data.reason,
      }),
    onSuccess: (response) => {
      toast.success(
        "Account deletion scheduled",
        response.message || "Your account will be deleted. Check your email for details."
      );
      queryClient.clear();
      reset();
      onClose();
      // Redirect to logout or home page would happen here via the backend
    },
    onError: (error: Error) => {
      toast.error("Failed to delete account", error.message);
    },
  });

  const onSubmit = (data: DeleteAccountFormData) => {
    if (!emailMatches) {
      toast.error("Email mismatch", "Please enter your email address exactly as shown.");
      return;
    }
    deleteAccount(data);
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Account" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">This action is irreversible</p>
              <p className="text-sm text-muted-foreground mt-1">
                Deleting your account will permanently remove all your data, including
                projects, documents, bids, and settings. This cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Type <span className="font-mono font-medium text-foreground">{userEmail}</span> to confirm:
          </p>
          <Input
            {...register("confirm_email")}
            type="email"
            placeholder="Enter your email to confirm"
            error={errors.confirm_email?.message}
            autoComplete="off"
            required
          />
          {confirmEmail && !emailMatches && (
            <p className="mt-1 text-sm text-destructive flex items-center gap-1">
              <X className="h-3 w-3" />
              Email does not match
            </p>
          )}
          {emailMatches && (
            <p className="mt-1 text-sm text-success flex items-center gap-1">
              <Check className="h-3 w-3" />
              Email matches
            </p>
          )}
        </div>

        <Input
          {...register("password")}
          type="password"
          label="Password"
          placeholder="Enter your password"
          error={errors.password?.message}
          leftIcon={<Key className="h-4 w-4" />}
          autoComplete="current-password"
          required
        />

        <div>
          <label className="block text-sm font-medium mb-1">
            Reason for leaving (optional)
          </label>
          <textarea
            {...register("reason")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            rows={3}
            placeholder="Help us improve by sharing why you're leaving..."
          />
          {errors.reason && (
            <p className="mt-1 text-sm text-destructive">{errors.reason.message}</p>
          )}
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register("acknowledge")}
            className="mt-0.5 h-4 w-4 rounded border-border text-destructive focus:ring-destructive"
          />
          <span className="text-sm">
            I understand that this action is permanent and all my data will be deleted.
          </span>
        </label>
        {errors.acknowledge && (
          <p className="text-sm text-destructive">{errors.acknowledge.message}</p>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="destructive"
            disabled={!isValid || !emailMatches}
            isLoading={isPending}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Delete My Account
          </Button>
        </div>
      </form>
    </Modal>
  );
}

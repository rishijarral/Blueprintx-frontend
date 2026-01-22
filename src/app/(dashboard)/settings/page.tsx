"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Switch,
  Button,
} from "@/components/ui";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useShowToast } from "@/components/ui/Toast";
import { profileApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import { Bell, Mail, Smartphone, Save, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import type { NotificationSettings } from "@/types/models";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const toast = useShowToast();

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

  useEffect(() => {
    if (settings?.notification_settings) {
      setNotifications(settings.notification_settings);
    }
  }, [settings]);

  const { mutate: updateSettings, isPending } = useMutation({
    mutationFn: () =>
      profileApi.updateSettings({ notification_settings: notifications }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
      toast.success(
        "Settings saved",
        "Your notification preferences have been updated.",
      );
    },
    onError: (error: Error) => {
      toast.error("Failed to save settings", error.message);
    },
  });

  const handleToggle = (key: keyof NotificationSettings) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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

      <div className="max-w-2xl space-y-6">
        {/* Notification Settings */}
        <Card variant="bordered">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Configure how you receive notifications
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
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium">Email Notifications</h4>
                  </div>
                  <div className="space-y-4">
                    <Switch
                      label="Email Notifications"
                      description="Receive notifications via email"
                      checked={notifications.email_notifications}
                      onChange={() => handleToggle("email_notifications")}
                    />
                    <Switch
                      label="Bid Updates"
                      description="Get notified about bid status changes and new bids"
                      checked={notifications.bid_updates}
                      onChange={() => handleToggle("bid_updates")}
                    />
                    <Switch
                      label="RFI Alerts"
                      description="Get notified when RFIs are created or answered"
                      checked={notifications.rfi_alerts}
                      onChange={() => handleToggle("rfi_alerts")}
                    />
                    <Switch
                      label="Task Reminders"
                      description="Get reminded about upcoming task deadlines"
                      checked={notifications.task_reminders}
                      onChange={() => handleToggle("task_reminders")}
                    />
                  </div>
                </div>

                <hr className="border-border" />

                {/* Push Notifications */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium">Push Notifications</h4>
                  </div>
                  <Switch
                    label="Enable Push Notifications"
                    description="Receive real-time notifications in your browser"
                    checked={notifications.push_notifications}
                    onChange={() => handleToggle("push_notifications")}
                  />
                </div>

                <hr className="border-border" />

                {/* Reports */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium">Reports</h4>
                  </div>
                  <Switch
                    label="Weekly Reports"
                    description="Receive a weekly summary of project activity"
                    checked={notifications.weekly_reports}
                    onChange={() => handleToggle("weekly_reports")}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => updateSettings()}
            isLoading={isPending}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}

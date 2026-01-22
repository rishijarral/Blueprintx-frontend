"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Switch, Button } from "@/components/ui";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { useShowToast } from "@/components/ui/Toast";
import { profileApi } from "@/lib/api";
import { queryKeys } from "@/types/api";
import { ROUTES } from "@/lib/constants/routes";
import { Bell, Mail, Smartphone, Save } from "lucide-react";
import { useState, useEffect } from "react";
import type { NotificationSettings } from "@/types/models";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const toast = useShowToast();

  const { data: settings, isLoading } = useQuery({
    queryKey: queryKeys.settings,
    queryFn: () => profileApi.getSettings(),
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_new_bid: true,
    email_bid_status: true,
    email_new_tender: true,
    email_rfi_update: true,
    email_task_assigned: true,
    push_enabled: false,
  });

  useEffect(() => {
    if (settings?.notification_settings) {
      setNotifications(settings.notification_settings);
    }
  }, [settings]);

  const { mutate: updateSettings, isPending } = useMutation({
    mutationFn: () => profileApi.updateSettings({ notification_settings: notifications }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings });
      toast.success("Settings saved", "Your notification preferences have been updated.");
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
                      label="New Bid Received"
                      description="Get notified when a subcontractor submits a bid"
                      checked={notifications.email_new_bid}
                      onChange={() => handleToggle("email_new_bid")}
                    />
                    <Switch
                      label="Bid Status Updates"
                      description="Get notified when your bid status changes"
                      checked={notifications.email_bid_status}
                      onChange={() => handleToggle("email_bid_status")}
                    />
                    <Switch
                      label="New Tenders"
                      description="Get notified about new tender opportunities"
                      checked={notifications.email_new_tender}
                      onChange={() => handleToggle("email_new_tender")}
                    />
                    <Switch
                      label="RFI Updates"
                      description="Get notified when RFIs are created or answered"
                      checked={notifications.email_rfi_update}
                      onChange={() => handleToggle("email_rfi_update")}
                    />
                    <Switch
                      label="Task Assignments"
                      description="Get notified when tasks are assigned to you"
                      checked={notifications.email_task_assigned}
                      onChange={() => handleToggle("email_task_assigned")}
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
                    checked={notifications.push_enabled}
                    onChange={() => handleToggle("push_enabled")}
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

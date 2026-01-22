"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { queryKeys } from "@/types/api";
import {
  notificationsApi,
  type Notification,
  type NotificationType,
} from "@/lib/api/notifications";
import { formatDistanceToNow } from "date-fns";

// Notification type icon/color mapping
const notificationStyles: Record<
  NotificationType,
  { icon: string; color: string; bgColor: string }
> = {
  bid_received: { icon: "file-text", color: "text-blue-500", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  bid_awarded: { icon: "trophy", color: "text-green-500", bgColor: "bg-green-100 dark:bg-green-900/30" },
  bid_rejected: { icon: "x-circle", color: "text-red-500", bgColor: "bg-red-100 dark:bg-red-900/30" },
  bid_shortlisted: { icon: "star", color: "text-yellow-500", bgColor: "bg-yellow-100 dark:bg-yellow-900/30" },
  bid_withdrawn: { icon: "minus-circle", color: "text-gray-500", bgColor: "bg-gray-100 dark:bg-gray-900/30" },
  hire_request_received: { icon: "briefcase", color: "text-purple-500", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
  hire_request_accepted: { icon: "check-circle", color: "text-green-500", bgColor: "bg-green-100 dark:bg-green-900/30" },
  hire_request_declined: { icon: "x-circle", color: "text-red-500", bgColor: "bg-red-100 dark:bg-red-900/30" },
  hire_request_expired: { icon: "clock", color: "text-orange-500", bgColor: "bg-orange-100 dark:bg-orange-900/30" },
  contract_sent: { icon: "file-signature", color: "text-blue-500", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  contract_signed: { icon: "check-square", color: "text-green-500", bgColor: "bg-green-100 dark:bg-green-900/30" },
  contract_fully_signed: { icon: "check-circle-2", color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" },
  review_received: { icon: "message-square", color: "text-yellow-500", bgColor: "bg-yellow-100 dark:bg-yellow-900/30" },
  review_response_received: { icon: "message-circle", color: "text-blue-500", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  profile_verified: { icon: "badge-check", color: "text-green-500", bgColor: "bg-green-100 dark:bg-green-900/30" },
  profile_rejected: { icon: "shield-x", color: "text-red-500", bgColor: "bg-red-100 dark:bg-red-900/30" },
  profile_viewed: { icon: "eye", color: "text-gray-500", bgColor: "bg-gray-100 dark:bg-gray-900/30" },
  new_message: { icon: "mail", color: "text-blue-500", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  tender_published: { icon: "megaphone", color: "text-purple-500", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
  tender_closing_soon: { icon: "alert-triangle", color: "text-orange-500", bgColor: "bg-orange-100 dark:bg-orange-900/30" },
  tender_closed: { icon: "lock", color: "text-gray-500", bgColor: "bg-gray-100 dark:bg-gray-900/30" },
  system: { icon: "info", color: "text-gray-500", bgColor: "bg-gray-100 dark:bg-gray-900/30" },
};

function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  onClick,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (notification: Notification) => void;
}) {
  const style = notificationStyles[notification.notification_type] || notificationStyles.system;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={cn(
        "flex items-start gap-3 p-3 cursor-pointer",
        "hover:bg-muted/50 transition-colors duration-150",
        "border-b border-border/50 last:border-b-0",
        !notification.is_read && "bg-primary/5"
      )}
      onClick={() => onClick(notification)}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          style.bgColor
        )}
      >
        <Bell className={cn("w-5 h-5", style.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium truncate",
            !notification.is_read && "text-foreground font-semibold"
          )}
        >
          {notification.title}
        </p>
        {notification.message && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {notification.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1">
        {!notification.is_read && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead(notification.id);
            }}
            className={cn(
              "p-1.5 rounded-lg",
              "text-muted-foreground hover:text-primary hover:bg-primary/10",
              "transition-colors duration-150"
            )}
            title="Mark as read"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          className={cn(
            "p-1.5 rounded-lg",
            "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
            "transition-colors duration-150"
          )}
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

export function NotificationBell() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch unread count
  const { data: unreadData } = useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch notifications when dropdown is open
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: queryKeys.notifications.list({ per_page: 10 }),
    queryFn: () => notificationsApi.list({ per_page: 10 }),
    enabled: isOpen,
  });

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });

  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: notificationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      markReadMutation.mutate(notification.id);
    }

    // Navigate based on notification type
    const data = notification.data as Record<string, string>;
    switch (notification.notification_type) {
      case "bid_received":
      case "bid_awarded":
      case "bid_rejected":
        if (data.tender_id) {
          router.push(`/tenders/${data.tender_id}`);
        }
        break;
      case "hire_request_received":
      case "hire_request_accepted":
      case "hire_request_declined":
        if (data.hire_request_id) {
          router.push(`/hiring/${data.hire_request_id}`);
        }
        break;
      case "contract_sent":
      case "contract_signed":
      case "contract_fully_signed":
        if (data.contract_id) {
          router.push(`/contracts/${data.contract_id}`);
        }
        break;
      case "profile_verified":
      case "profile_rejected":
        router.push("/marketplace/profile");
        break;
      case "new_message":
        if (data.hire_request_id) {
          router.push(`/hiring/${data.hire_request_id}`);
        }
        break;
      default:
        // Navigate to notifications page
        router.push("/notifications");
    }
    setIsOpen(false);
  };

  const unreadCount = unreadData?.count || 0;
  const notifications = notificationsData?.data || [];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative flex h-10 w-10 items-center justify-center rounded-xl",
          "text-muted-foreground hover:text-foreground",
          "bg-muted/50 hover:bg-muted",
          "transition-colors duration-200",
          isOpen && "bg-muted text-foreground"
        )}
        whileTap={{ scale: 0.95 }}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className={cn(
                "absolute -right-0.5 -top-0.5 min-w-[18px] h-[18px] px-1",
                "flex items-center justify-center",
                "rounded-full bg-primary text-primary-foreground",
                "text-[10px] font-bold",
                "ring-2 ring-background"
              )}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute right-0 top-full mt-2 w-[380px] max-w-[calc(100vw-2rem)]",
              "bg-popover border border-border rounded-xl shadow-xl",
              "overflow-hidden z-50"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllReadMutation.mutate()}
                    className={cn(
                      "p-1.5 rounded-lg text-xs font-medium",
                      "text-muted-foreground hover:text-primary hover:bg-primary/10",
                      "transition-colors duration-150 flex items-center gap-1"
                    )}
                    disabled={markAllReadMutation.isPending}
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span className="hidden sm:inline">Mark all read</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "p-1.5 rounded-lg",
                    "text-muted-foreground hover:text-foreground hover:bg-muted",
                    "transition-colors duration-150"
                  )}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Bell className="w-12 h-12 mb-2 opacity-20" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={(id) => markReadMutation.mutate(id)}
                      onDelete={(id) => deleteMutation.mutate(id)}
                      onClick={handleNotificationClick}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-border">
                <button
                  onClick={() => {
                    router.push("/notifications");
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full py-2 text-sm font-medium text-center",
                    "text-primary hover:text-primary/80",
                    "transition-colors duration-150"
                  )}
                >
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

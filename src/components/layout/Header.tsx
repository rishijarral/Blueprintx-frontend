"use client";

import { memo, useMemo } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useUser, useSignOut } from "@/hooks/useAuth";
import { useUIStore } from "@/stores/ui-store";
import { ROUTES } from "@/lib/constants/routes";
import { Avatar, Dropdown } from "@/components/ui";
import { NotificationBell } from "@/components/notifications";
import {
  Menu,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  HelpCircle,
} from "lucide-react";

export const Header = memo(function Header() {
  const router = useRouter();
  const { user, profile } = useUser();
  const { mutate: signOut } = useSignOut();
  const { theme, setTheme, toggleMobileMenu } = useUIStore();

  // Memoize menu items to prevent recreation on each render
  const userMenuItems = useMemo(
    () => [
      {
        label: "Profile",
        value: "profile",
        icon: <User className="h-4 w-4" />,
        onClick: () => router.push(ROUTES.PROFILE),
      },
      {
        label: "Settings",
        value: "settings",
        icon: <Settings className="h-4 w-4" />,
        onClick: () => router.push(ROUTES.SETTINGS),
      },
      {
        label: "Help & Support",
        value: "help",
        icon: <HelpCircle className="h-4 w-4" />,
        onClick: () => window.open("https://docs.blueprintx.com", "_blank"),
      },
      {
        label: "Sign Out",
        value: "signout",
        icon: <LogOut className="h-4 w-4" />,
        onClick: () => signOut(),
        destructive: true,
      },
    ],
    [router, signOut]
  );

  const fullName = profile
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
    : user?.email?.split("@")[0];

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-[var(--header-height)]",
        "left-0 lg:left-[var(--sidebar-current-width)]",
        // Clean background with subtle glass effect
        "bg-background/95 backdrop-blur-md",
        "border-b border-border",
        "transition-all duration-300",
      )}
    >
      <div className="flex h-full items-center justify-end px-4 lg:px-6">
        {/* Mobile menu toggle - positioned absolute on left */}
        <button
          onClick={toggleMobileMenu}
          className={cn(
            "lg:hidden absolute left-4 flex h-10 w-10 items-center justify-center rounded-xl",
            "text-muted-foreground hover:text-foreground",
            "bg-muted/50 hover:bg-muted",
            "transition-colors duration-200",
            "active:scale-95",
          )}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              "text-muted-foreground hover:text-foreground",
              "bg-muted/50 hover:bg-muted",
              "transition-colors duration-200",
              "active:scale-95",
            )}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* Notifications */}
          <NotificationBell />

          {/* User menu */}
          <Dropdown
            align="right"
            trigger={
              <button
                className={cn(
                  "flex items-center gap-3 rounded-xl px-2 py-1.5",
                  "hover:bg-muted/50",
                  "transition-colors duration-200",
                  "active:scale-[0.98]",
                )}
              >
                <Avatar name={fullName || user?.email} size="sm" />
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-semibold text-foreground">
                    {fullName || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {profile?.user_type === "gc"
                      ? "General Contractor"
                      : "Subcontractor"}
                  </p>
                </div>
              </button>
            }
            items={userMenuItems}
          />
        </div>
      </div>

    </header>
  );
});

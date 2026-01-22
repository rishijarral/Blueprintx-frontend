"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useUser, useSignOut } from "@/hooks/useAuth";
import { useUIStore } from "@/stores/ui-store";
import { ROUTES } from "@/lib/constants/routes";
import { Avatar, Button, Dropdown } from "@/components/ui";
import {
  Menu,
  Bell,
  Sun,
  Moon,
  Search,
  User,
  Settings,
  LogOut,
  HelpCircle,
} from "lucide-react";

export function Header() {
  const router = useRouter();
  const { user, profile } = useUser();
  const { mutate: signOut } = useSignOut();
  const { theme, setTheme, toggleMobileMenu } = useUIStore();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search
      console.log("Search:", searchQuery);
    }
  };

  const userMenuItems = [
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
  ];

  const fullName = profile
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim()
    : user?.email?.split("@")[0];

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-[var(--header-height)] bg-background/80 backdrop-blur-sm border-b border-border",
        "left-[var(--sidebar-width)] lg:left-[var(--sidebar-width)]"
      )}
    >
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left side - Mobile menu + Search */}
        <div className="flex items-center gap-4">
          {/* Mobile menu toggle */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search projects, tenders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "h-10 w-64 lg:w-80 rounded-lg border border-input bg-background pl-10 pr-4 text-sm",
                  "placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                )}
              />
            </div>
          </form>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted transition-colors"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* Notifications */}
          <button
            className="relative flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {/* Notification badge */}
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
          </button>

          {/* User menu */}
          <Dropdown
            align="right"
            trigger={
              <button className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors">
                <Avatar
                  name={fullName || user?.email}
                  size="sm"
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{fullName || "User"}</p>
                  <p className="text-xs text-muted-foreground">
                    {profile?.user_type === "gc" ? "General Contractor" : "Subcontractor"}
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
}

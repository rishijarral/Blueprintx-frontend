"use client";

import { useState, useEffect, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useUser } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants/routes";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Users,
  Gavel,
  CheckSquare,
  MessageSquare,
  Settings,
  ChevronLeft,
  HardHat,
  Store,
  UserPlus,
  Handshake,
  Shield,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: ("gc" | "sub")[];
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: ROUTES.DASHBOARD,
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: "Projects",
    href: ROUTES.PROJECTS,
    icon: <FolderKanban className="h-5 w-5" />,
  },
  {
    label: "Tenders",
    href: ROUTES.TENDERS,
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: "My Bids",
    href: ROUTES.BIDS,
    icon: <Gavel className="h-5 w-5" />,
    roles: ["sub"],
  },
  {
    label: "Marketplace",
    href: ROUTES.MARKETPLACE,
    icon: <Store className="h-5 w-5" />,
    roles: ["gc"],
  },
  {
    label: "Hiring",
    href: ROUTES.HIRING,
    icon: <Handshake className="h-5 w-5" />,
    roles: ["gc"],
  },
  {
    label: "My Subs",
    href: ROUTES.MY_SUBCONTRACTORS,
    icon: <UserPlus className="h-5 w-5" />,
    roles: ["gc"],
  },
  {
    label: "Tasks",
    href: ROUTES.TASKS,
    icon: <CheckSquare className="h-5 w-5" />,
  },
  {
    label: "RFIs",
    href: ROUTES.RFIS,
    icon: <MessageSquare className="h-5 w-5" />,
  },
];

const bottomNavItems: NavItem[] = [
  {
    label: "Admin",
    href: "/admin",
    icon: <Shield className="h-5 w-5" />,
    adminOnly: true,
  },
  {
    label: "Settings",
    href: ROUTES.SETTINGS,
    icon: <Settings className="h-5 w-5" />,
  },
];

function SidebarComponent() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { profile } = useUser();

  // Update CSS custom property when sidebar collapses
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty(
      "--sidebar-current-width",
      isCollapsed ? "var(--sidebar-collapsed-width)" : "var(--sidebar-width)",
    );
    root.dataset.sidebarCollapsed = isCollapsed ? "true" : "false";
  }, [isCollapsed]);

  const userType = profile?.user_type || "gc";
  const isAdmin = profile?.is_admin || false;

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userType),
  );

  const filteredBottomNavItems = bottomNavItems.filter(
    (item) => !item.adminOnly || isAdmin,
  );

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen",
        "bg-sidebar text-sidebar-foreground",
        "border-r border-white/5",
        "shadow-xl transition-all duration-300",
        isCollapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]",
      )}
    >
      <div className="relative flex h-full flex-col">
        {/* Logo */}
        <div
          className={cn(
            "flex h-[var(--header-height)] items-center px-4",
            "border-b border-white/5",
            isCollapsed ? "justify-center" : "justify-between",
          )}
        >
          <Link href={ROUTES.DASHBOARD} className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                "bg-gradient-to-br from-primary to-primary-deep",
                "shadow-lg",
              )}
            >
              <HardHat className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col whitespace-nowrap">
                <span className="text-lg font-bold text-white tracking-tight">
                  BlueprintX
                </span>
                <span className="text-[10px] font-semibold text-steel-400 uppercase tracking-widest">
                  Construction
                </span>
              </div>
            )}
          </Link>

          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                "text-steel-400 hover:text-white hover:bg-white/5",
                "transition-colors duration-200",
              )}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Expand button when collapsed */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className={cn(
              "absolute -right-3 top-20 z-50",
              "flex h-6 w-6 items-center justify-center rounded-full",
              "bg-primary text-white shadow-lg hover:bg-primary-hover",
            )}
            aria-label="Expand sidebar"
          >
            <ChevronLeft className="h-3 w-3 rotate-180" />
          </button>
        )}

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl px-3 py-3",
                      "transition-colors duration-150",
                      isCollapsed && "justify-center px-0",
                      active
                        ? "bg-primary/15 text-white"
                        : "text-steel-400 hover:text-white hover:bg-white/5",
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {active && (
                      <div
                        className={cn(
                          "absolute left-0 top-1/2 -translate-y-1/2",
                          "w-1 h-8 rounded-r-full bg-primary",
                        )}
                      />
                    )}
                    <span className={cn("flex-shrink-0", active && "text-primary")}>
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="text-sm font-semibold tracking-wide">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-white/5 p-3">
          <ul className="space-y-1">
            {filteredBottomNavItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl px-3 py-3",
                      "transition-colors duration-150",
                      isCollapsed && "justify-center px-0",
                      active
                        ? "bg-primary/15 text-white"
                        : "text-steel-400 hover:text-white hover:bg-white/5",
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {active && (
                      <div
                        className={cn(
                          "absolute left-0 top-1/2 -translate-y-1/2",
                          "w-1 h-8 rounded-r-full bg-primary",
                        )}
                      />
                    )}
                    <span className={cn("flex-shrink-0", active && "text-primary")}>
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="text-sm font-semibold tracking-wide">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </aside>
  );
}

// Memoize to prevent unnecessary re-renders
export const Sidebar = memo(SidebarComponent);

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useUser } from "@/hooks/useAuth";
import { ROUTES } from "@/lib/constants/routes";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  ClipboardList,
  Users,
  Gavel,
  CheckSquare,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  HardHat,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: ("gc" | "sub")[];
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
    label: "Subcontractors",
    href: ROUTES.SUBCONTRACTORS,
    icon: <Users className="h-5 w-5" />,
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
    label: "Settings",
    href: ROUTES.SETTINGS,
    icon: <Settings className="h-5 w-5" />,
  },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { profile } = useUser();

  const userType = profile?.user_type || "gc";

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userType)
  );

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300",
        isCollapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-[var(--header-height)] items-center justify-between px-4 border-b border-sidebar-hover">
          <Link href={ROUTES.DASHBOARD} className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <HardHat className="h-5 w-5 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-bold">BlueprintX</span>
            )}
          </Link>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sidebar-hover transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                    "hover:bg-sidebar-hover",
                    isActive(item.href) && "bg-sidebar-active text-white",
                    isCollapsed && "justify-center px-2"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom Navigation */}
        <div className="border-t border-sidebar-hover p-4">
          <ul className="space-y-1">
            {bottomNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                    "hover:bg-sidebar-hover",
                    isActive(item.href) && "bg-sidebar-active text-white",
                    isCollapsed && "justify-center px-2"
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  {item.icon}
                  {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}

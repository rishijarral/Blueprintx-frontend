"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useUser } from "@/hooks/useAuth";
import { useUIStore } from "@/stores/ui-store";
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
  X,
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
  {
    label: "Settings",
    href: ROUTES.SETTINGS,
    icon: <Settings className="h-5 w-5" />,
  },
];

export function MobileNav() {
  const pathname = usePathname();
  const { profile } = useUser();
  const { isMobileMenuOpen, closeMobileMenu } = useUIStore();

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

  // Close menu on route change
  useEffect(() => {
    closeMobileMenu();
  }, [pathname, closeMobileMenu]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  if (!isMobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeMobileMenu}
      />

      {/* Drawer */}
      <div className="absolute left-0 top-0 h-full w-72 bg-sidebar text-sidebar-foreground animate-slide-up">
        {/* Header */}
        <div className="flex h-[var(--header-height)] items-center justify-between px-4 border-b border-sidebar-hover">
          <Link href={ROUTES.DASHBOARD} className="flex items-center gap-3" onClick={closeMobileMenu}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <HardHat className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold">BlueprintX</span>
          </Link>
          <button
            onClick={closeMobileMenu}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sidebar-hover transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
                    "hover:bg-sidebar-hover",
                    isActive(item.href) && "bg-sidebar-active text-white"
                  )}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

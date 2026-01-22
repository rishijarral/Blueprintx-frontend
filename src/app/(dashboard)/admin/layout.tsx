"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import { queryKeys } from "@/types/api";
import { cn } from "@/lib/utils/cn";
import { Skeleton } from "@/components/ui";
import {
  LayoutDashboard,
  ShieldCheck,
  ScrollText,
  ChevronRight,
  Shield,
} from "lucide-react";

interface AdminNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

const adminNavItems: AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="h-5 w-5" />,
    description: "Overview and statistics",
  },
  {
    label: "Verifications",
    href: "/admin/verifications",
    icon: <ShieldCheck className="h-5 w-5" />,
    description: "Review pending verifications",
  },
  {
    label: "Audit Log",
    href: "/admin/audit-log",
    icon: <ScrollText className="h-5 w-5" />,
    description: "View admin activity log",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [hasChecked, setHasChecked] = useState(false);

  // Check admin status
  const { data: adminCheck, isLoading, error } = useQuery({
    queryKey: queryKeys.admin.check,
    queryFn: () => adminApi.checkAdmin(),
    retry: false,
  });

  useEffect(() => {
    if (!isLoading) {
      setHasChecked(true);
      if (error || !adminCheck?.is_admin) {
        router.replace("/");
      }
    }
  }, [adminCheck, isLoading, error, router]);

  // Show loading while checking admin status
  if (isLoading || !hasChecked) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-4">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto animate-pulse" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Redirect handled in useEffect, show nothing while redirecting
  if (!adminCheck?.is_admin) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-700 shadow-lg">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">
            Manage verifications and system settings
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Admin Sidebar Navigation */}
        <aside className="lg:w-64 flex-shrink-0">
          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                    active
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <span className={cn(active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium", active ? "text-primary-foreground" : "")}>
                      {item.label}
                    </p>
                    <p className={cn("text-xs truncate", active ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className={cn("h-4 w-4 flex-shrink-0", active ? "text-primary-foreground" : "text-muted-foreground")} />
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

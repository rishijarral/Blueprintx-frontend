"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { cn } from "@/lib/utils/cn";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop only */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Main Content Area */}
      <div
        className={cn(
          "min-h-screen",
          "lg:pl-[var(--sidebar-current-width)]",
          "transition-all duration-300",
        )}
      >
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main
          className={cn(
            "pt-[var(--header-height)]",
            "min-h-[calc(100vh-var(--header-height))]",
          )}
        >
          <div
            className={cn(
              "mx-auto w-full",
              "max-w-[1600px]",
              "px-4 py-6",
              "sm:px-6 sm:py-8",
              "lg:px-8",
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

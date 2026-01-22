"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  className?: string;
  variant?: "default" | "hero";
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
  variant = "default",
}: PageHeaderProps) {
  const isHero = variant === "hero";

  return (
    <div
      className={cn("mb-8 animate-fade-in-up", isHero && "mb-10", className)}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((item, index) => (
              <li key={index} className="flex items-center gap-2">
                {index > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                )}
                {item.href ? (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5",
                      "text-muted-foreground hover:text-foreground",
                      "transition-colors duration-200",
                      "font-medium",
                    )}
                  >
                    {index === 0 && <Home className="h-3.5 w-3.5" />}
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "text-foreground font-semibold",
                      "flex items-center gap-1.5",
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Title and Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1
            className={cn(
              "font-bold text-foreground tracking-tight",
              isHero ? "text-display-md" : "text-3xl",
              "animate-fade-in-up",
            )}
          >
            {title}
          </h1>
          {description && (
            <p
              className={cn(
                "text-muted-foreground max-w-2xl",
                isHero ? "text-lg" : "text-base",
                "animate-fade-in-up",
              )}
              style={{ animationDelay: "50ms" }}
            >
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div
            className="flex items-center gap-3 animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

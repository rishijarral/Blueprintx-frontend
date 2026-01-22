"use client";

import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "outline"
    | "glass";
  size?: "sm" | "md" | "lg";
}

function Badge({
  className,
  variant = "default",
  size = "md",
  ...props
}: BadgeProps) {
  const variants = {
    default: cn(
      "bg-gradient-to-r from-primary to-primary-deep",
      "text-primary-foreground",
      "shadow-sm",
    ),
    secondary: cn("bg-secondary text-secondary-foreground", "shadow-sm"),
    success: cn(
      "bg-gradient-to-r from-success to-[hsl(145_80%_30%)]",
      "text-success-foreground",
      "shadow-sm",
    ),
    warning: cn(
      "bg-gradient-to-r from-warning to-[hsl(42_100%_45%)]",
      "text-warning-foreground",
      "shadow-sm",
    ),
    error: cn(
      "bg-gradient-to-r from-error to-[hsl(0_85%_48%)]",
      "text-error-foreground",
      "shadow-sm",
    ),
    info: cn(
      "bg-gradient-to-r from-info to-[hsl(210_100%_42%)]",
      "text-info-foreground",
      "shadow-sm",
    ),
    outline: cn("border-2 border-border bg-transparent", "text-foreground"),
    glass: cn(
      "bg-white/20 dark:bg-white/10",
      "backdrop-blur-md",
      "border border-white/30 dark:border-white/10",
      "text-foreground",
      "shadow-sm",
    ),
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px] font-semibold",
    md: "px-2.5 py-1 text-xs font-semibold",
    lg: "px-3 py-1.5 text-sm font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full",
        "transition-all duration-200",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };

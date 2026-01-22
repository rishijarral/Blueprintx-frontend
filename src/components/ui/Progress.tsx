"use client";

import { cn } from "@/lib/utils/cn";

export interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "error" | "gradient";
  animated?: boolean;
  glow?: boolean;
}

function Progress({
  value,
  max = 100,
  className,
  showLabel = false,
  size = "md",
  variant = "default",
  animated = true,
  glow = false,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  const trackStyles = {
    sm: "rounded-full",
    md: "rounded-full",
    lg: "rounded-full",
  };

  const variants = {
    default: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-error",
    gradient: "bg-gradient-to-r from-primary via-primary-glow to-accent",
  };

  const glowStyles = glow
    ? {
        default: "shadow-[0_0_10px_hsl(var(--color-primary)/0.5)]",
        success: "shadow-[0_0_10px_hsl(var(--color-success)/0.5)]",
        warning: "shadow-[0_0_10px_hsl(var(--color-warning)/0.5)]",
        error: "shadow-[0_0_10px_hsl(var(--color-error)/0.5)]",
        gradient: "shadow-[0_0_10px_hsl(var(--color-primary)/0.5)]",
      }
    : { default: "", success: "", warning: "", error: "", gradient: "" };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            Progress
          </span>
          <span className="text-sm font-bold text-foreground tabular-nums">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden bg-steel-200 dark:bg-steel-700",
          "shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]",
          sizes[size],
          trackStyles[size],
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            "h-full rounded-full",
            "transition-all duration-500 ease-out",
            animated && percentage > 0 && "animate-progress-fill",
            variants[variant],
            glowStyles[variant],
          )}
          style={{
            width: `${percentage}%`,
            animationFillMode: "forwards",
          }}
        >
          {/* Shimmer effect for active progress */}
          {animated && percentage > 0 && percentage < 100 && (
            <div
              className={cn(
                "h-full w-full rounded-full",
                "bg-gradient-to-r from-transparent via-white/25 to-transparent",
                "animate-shimmer",
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export { Progress };

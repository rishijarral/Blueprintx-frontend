"use client";

import { cn } from "@/lib/utils/cn";
import { CSSProperties } from "react";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "shimmer";
  style?: CSSProperties;
}

function Skeleton({ className, variant = "shimmer", style }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-steel-200 dark:bg-steel-700",
        variant === "shimmer" &&
          "animate-shimmer bg-gradient-to-r from-steel-200 via-steel-100 to-steel-200 dark:from-steel-700 dark:via-steel-600 dark:to-steel-700 bg-[length:200%_100%]",
        variant === "default" && "animate-pulse",
        className,
      )}
      style={style}
    />
  );
}

// Preset skeletons for common patterns
function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === lines - 1 ? "w-3/4" : "w-full")}
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl p-5 space-y-4",
        "bg-steel-100/50 dark:bg-steel-800/50",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
      </div>
      <SkeletonText lines={2} />
      <div className="flex gap-3">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}

function SkeletonTable({
  rows = 5,
  cols = 4,
  className,
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-10 flex-1 rounded-lg"
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className="h-14 flex-1 rounded-lg"
              style={{
                animationDelay: `${(rowIndex * cols + colIndex) * 30}ms`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" | "xl" }) {
  const sizes = {
    sm: "h-9 w-9",
    md: "h-11 w-11",
    lg: "h-14 w-14",
    xl: "h-20 w-20",
  };

  return <Skeleton className={cn("rounded-full", sizes[size])} />;
}

function SkeletonStat({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 space-y-4",
        "bg-steel-100/50 dark:bg-steel-800/50",
        className,
      )}
    >
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-12 w-20" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonTable,
  SkeletonAvatar,
  SkeletonStat,
};

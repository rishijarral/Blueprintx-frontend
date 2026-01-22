"use client";

import { useState, memo, useMemo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { User } from "lucide-react";

export interface AvatarProps {
  className?: string;
  src?: string | null;
  alt?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fallback?: string;
  name?: string;
  ring?: boolean;
  priority?: boolean;
}

// Size mappings - defined outside component for performance
const SIZES = {
  xs: { class: "h-7 w-7 text-[10px]", pixels: 28 },
  sm: { class: "h-9 w-9 text-xs", pixels: 36 },
  md: { class: "h-11 w-11 text-sm", pixels: 44 },
  lg: { class: "h-14 w-14 text-base", pixels: 56 },
  xl: { class: "h-20 w-20 text-xl", pixels: 80 },
} as const;

const ICON_SIZES = {
  xs: "h-3.5 w-3.5",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-10 w-10",
} as const;

const GRADIENTS = [
  "from-rose-500 to-pink-600",
  "from-orange-500 to-red-600",
  "from-amber-500 to-orange-600",
  "from-lime-500 to-green-600",
  "from-emerald-500 to-teal-600",
  "from-cyan-500 to-blue-600",
  "from-blue-500 to-indigo-600",
  "from-violet-500 to-purple-600",
  "from-fuchsia-500 to-pink-600",
  "from-primary to-primary-deep",
] as const;

// Helper functions
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getGradientFromName(name: string): string {
  const hash = name
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return GRADIENTS[hash % GRADIENTS.length];
}

// Check if URL is external (needs unoptimized next/image)
function isExternalUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

const Avatar = memo(function Avatar({
  className,
  src,
  alt,
  size = "md",
  fallback,
  name,
  ring = false,
  priority = false,
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const sizeConfig = SIZES[size];
  
  const ringStyles = ring
    ? "ring-2 ring-white dark:ring-steel-900 ring-offset-2 ring-offset-background"
    : "";

  // Memoize gradient calculation
  const gradient = useMemo(
    () => (name ? getGradientFromName(name) : "from-steel-400 to-steel-500"),
    [name]
  );

  // Memoize initials calculation
  const displayText = useMemo(
    () => fallback || (name ? getInitials(name) : null),
    [fallback, name]
  );

  const showFallback = !src || hasError;

  if (showFallback) {
    return (
      <div
        className={cn(
          "relative inline-flex items-center justify-center rounded-full",
          "font-bold text-white",
          "bg-gradient-to-br",
          gradient,
          "shadow-md",
          sizeConfig.class,
          ringStyles,
          className,
        )}
        aria-label={alt || name}
      >
        {displayText ? (
          <span className="drop-shadow-sm">{displayText}</span>
        ) : (
          <User className={cn("text-white/80", ICON_SIZES[size])} />
        )}
      </div>
    );
  }

  // Use next/image for optimized loading
  const isExternal = isExternalUrl(src!);

  return (
    <div
      className={cn(
        "relative inline-block rounded-full overflow-hidden",
        "shadow-md",
        sizeConfig.class,
        ringStyles,
        className,
      )}
    >
      <Image
        src={src!}
        alt={alt || name || "Avatar"}
        width={sizeConfig.pixels}
        height={sizeConfig.pixels}
        className="object-cover w-full h-full"
        onError={() => setHasError(true)}
        priority={priority}
        // For external URLs, we need unoptimized mode unless they're in next.config
        unoptimized={isExternal}
      />
    </div>
  );
});

export { Avatar };

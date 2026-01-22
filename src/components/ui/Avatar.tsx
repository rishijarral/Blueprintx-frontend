"use client";

import { useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { User } from "lucide-react";

export interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fallback?: string;
  name?: string;
}

function Avatar({
  className,
  src,
  alt,
  size = "md",
  fallback,
  name,
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const sizes = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  };

  const iconSizes = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-8 w-8",
  };

  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate consistent color based on name
  const getColorFromName = (name: string) => {
    const colors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-amber-500",
      "bg-yellow-500",
      "bg-lime-500",
      "bg-green-500",
      "bg-emerald-500",
      "bg-teal-500",
      "bg-cyan-500",
      "bg-sky-500",
      "bg-blue-500",
      "bg-indigo-500",
      "bg-violet-500",
      "bg-purple-500",
      "bg-fuchsia-500",
      "bg-pink-500",
    ];
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const showFallback = !src || hasError;

  if (showFallback) {
    const displayText = fallback || (name ? getInitials(name) : null);
    const bgColor = name ? getColorFromName(name) : "bg-muted";

    return (
      <div
        className={cn(
          "relative inline-flex items-center justify-center rounded-full font-medium text-white",
          bgColor,
          sizes[size],
          className
        )}
        aria-label={alt || name}
      >
        {displayText ? (
          displayText
        ) : (
          <User className={cn("text-muted-foreground", iconSizes[size])} />
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || name || "Avatar"}
      className={cn(
        "inline-block rounded-full object-cover",
        sizes[size],
        className
      )}
      onError={() => setHasError(true)}
      {...props}
    />
  );
}

export { Avatar };

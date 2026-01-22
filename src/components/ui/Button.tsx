"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "destructive"
    | "outline"
    | "ghost"
    | "link"
    | "glass"
    | "neu";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles = cn(
      "inline-flex items-center justify-center font-semibold",
      "transition-all duration-200 ease-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "active:scale-[0.98]",
    );

    const variants = {
      // Primary - Clear and visible in both modes
      primary: cn(
        "bg-primary text-primary-foreground",
        "hover:bg-primary-hover",
        "shadow-sm hover:shadow-md",
        "border border-primary-deep/20",
      ),
      // Secondary - Visible with proper contrast
      secondary: cn(
        "bg-secondary text-secondary-foreground",
        "hover:bg-secondary-hover",
        "border border-border",
        "shadow-sm",
      ),
      // Destructive - Clear danger state
      destructive: cn(
        "bg-destructive text-destructive-foreground",
        "hover:bg-destructive-hover",
        "shadow-sm hover:shadow-md",
        "border border-red-700/20",
      ),
      // Outline - Clear border, no background
      outline: cn(
        "border-2 border-border bg-transparent",
        "text-foreground",
        "hover:bg-muted hover:border-primary/40",
      ),
      // Ghost - Minimal, appears on hover
      ghost: cn("bg-transparent text-foreground", "hover:bg-muted"),
      // Link - Text style
      link: cn(
        "text-primary underline-offset-4",
        "hover:underline hover:text-primary-hover",
        "p-0 h-auto shadow-none",
      ),
      // Glass - Subtle glassmorphism
      glass: cn(
        "bg-white/60 dark:bg-white/10",
        "backdrop-blur-md",
        "border border-white/60 dark:border-white/15",
        "text-foreground",
        "hover:bg-white/80 dark:hover:bg-white/15",
        "shadow-sm",
      ),
      // Neumorphic - Soft 3D effect with better light mode contrast
      neu: cn(
        "bg-white dark:bg-steel-800",
        "text-steel-700 dark:text-steel-100",
        "border border-steel-200 dark:border-steel-700/50",
        "shadow-[2px_2px_6px_rgba(0,0,0,0.08),-2px_-2px_6px_rgba(255,255,255,1)]",
        "dark:shadow-[3px_3px_8px_rgba(0,0,0,0.25),-3px_-3px_8px_rgba(50,60,80,0.1)]",
        "hover:bg-steel-50 dark:hover:bg-steel-750",
        "hover:shadow-[3px_3px_8px_rgba(0,0,0,0.1),-3px_-3px_8px_rgba(255,255,255,1)]",
        "dark:hover:shadow-[4px_4px_10px_rgba(0,0,0,0.3),-4px_-4px_10px_rgba(50,60,80,0.12)]",
        "active:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.08),inset_-1px_-1px_3px_rgba(255,255,255,0.9)]",
        "dark:active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.2),inset_-2px_-2px_5px_rgba(50,60,80,0.08)]",
      ),
    };

    const sizes = {
      sm: "h-9 px-4 text-sm rounded-lg gap-2",
      md: "h-11 px-5 text-sm rounded-xl gap-2",
      lg: "h-12 px-6 text-base rounded-xl gap-2.5",
      icon: "h-11 w-11 rounded-xl",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };

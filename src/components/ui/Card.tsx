"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

// Card Root
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "elevated" | "glass" | "neu";
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hover = false, ...props }, ref) => {
    const variants = {
      // Default - Clean with subtle shadow
      default: cn(
        "bg-card text-card-foreground",
        "border border-border/50",
        "shadow-sm",
      ),
      // Bordered - Clear visible boundary
      bordered: cn("bg-card text-card-foreground", "border border-border"),
      // Elevated - Prominent shadow
      elevated: cn(
        "bg-card text-card-foreground",
        "border border-border/30",
        "shadow-lg",
      ),
      // Glass - Glassmorphism effect
      glass: cn(
        "bg-white/80 dark:bg-steel-800/80",
        "backdrop-blur-lg",
        "border border-white/60 dark:border-white/10",
        "shadow-lg shadow-black/5 dark:shadow-black/20",
      ),
      // Neumorphic - Soft look
      neu: cn(
        "bg-steel-50 dark:bg-steel-800",
        "text-card-foreground",
        "border border-steel-200/50 dark:border-steel-700/50",
        "shadow-[4px_4px_12px_rgba(0,0,0,0.06),-4px_-4px_12px_rgba(255,255,255,0.8)]",
        "dark:shadow-[4px_4px_12px_rgba(0,0,0,0.3),-4px_-4px_12px_rgba(50,60,80,0.1)]",
      ),
    };

    const hoverStyles = hover
      ? "transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20 cursor-pointer"
      : "";

    return (
      <div
        ref={ref}
        className={cn("rounded-2xl", variants[variant], hoverStyles, className)}
        {...props}
      />
    );
  },
);
Card.displayName = "Card";

// Card Header
const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-5 sm:p-6", className)}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

// Card Title
const CardTitle = forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-bold leading-none tracking-tight text-foreground",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

// Card Description
const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

// Card Content
const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("p-5 pt-0 sm:p-6 sm:pt-0", className)}
      {...props}
    />
  ),
);
CardContent.displayName = "CardContent";

// Card Footer
const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-5 pt-0 sm:p-6 sm:pt-0", className)}
      {...props}
    />
  ),
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};

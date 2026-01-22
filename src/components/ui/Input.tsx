"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: "default" | "neu" | "glass";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      error,
      label,
      hint,
      leftIcon,
      rightIcon,
      variant = "default",
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || props.name;

    const variants = {
      // Default - Clean with border
      default: cn(
        "border border-input bg-background",
        "focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
        error && "border-destructive focus:ring-destructive",
      ),
      // Neumorphic - Inset carved look
      neu: cn(
        "border-0 bg-steel-100 dark:bg-steel-800",
        "shadow-[inset_2px_2px_5px_rgba(0,0,0,0.08),inset_-2px_-2px_5px_rgba(255,255,255,0.8)]",
        "dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3),inset_-2px_-2px_5px_rgba(60,70,90,0.15)]",
        "focus:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.08),inset_-2px_-2px_5px_rgba(255,255,255,0.8),0_0_0_3px_hsl(var(--color-primary-glow)/0.25)]",
        "dark:focus:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3),inset_-2px_-2px_5px_rgba(60,70,90,0.15),0_0_0_3px_hsl(var(--color-primary-glow)/0.3)]",
        error &&
          "shadow-[inset_2px_2px_5px_rgba(0,0,0,0.08),inset_-2px_-2px_5px_rgba(255,255,255,0.8),0_0_0_2px_hsl(var(--color-destructive)/0.5)]",
      ),
      // Glass - Transparent blur effect
      glass: cn(
        "border border-white/30 dark:border-white/10",
        "bg-white/50 dark:bg-white/5",
        "backdrop-blur-md",
        "focus:bg-white/70 dark:focus:bg-white/10",
        "focus:border-primary/50",
        "focus:ring-2 focus:ring-primary/20",
        error && "border-destructive/50",
      ),
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            {label}
            {props.required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={type}
            className={cn(
              "flex h-12 w-full rounded-xl px-4 py-3 text-sm text-foreground",
              "placeholder:text-muted-foreground",
              "focus:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-all duration-200",
              variants[variant],
              leftIcon && "pl-11",
              rightIcon && "pr-11",
              className,
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-2 text-sm font-medium text-destructive flex items-center gap-1.5"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
        {hint && !error && (
          <p
            id={`${inputId}-hint`}
            className="mt-2 text-sm text-muted-foreground"
          >
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };

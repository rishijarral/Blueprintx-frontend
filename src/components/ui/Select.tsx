"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  error?: string;
  label?: string;
  hint?: string;
  placeholder?: string;
  variant?: "default" | "neu";
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      options,
      error,
      label,
      hint,
      placeholder,
      variant = "default",
      id,
      ...props
    },
    ref,
  ) => {
    const selectId = id || props.name;

    const variants = {
      default: cn(
        "border border-input bg-background",
        "focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
        error && "border-destructive focus:ring-destructive",
      ),
      neu: cn(
        "border-0 bg-steel-100 dark:bg-steel-800",
        "shadow-[inset_2px_2px_5px_rgba(0,0,0,0.08),inset_-2px_-2px_5px_rgba(255,255,255,0.8)]",
        "dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3),inset_-2px_-2px_5px_rgba(60,70,90,0.15)]",
        "focus:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.08),inset_-2px_-2px_5px_rgba(255,255,255,0.8),0_0_0_3px_hsl(var(--color-primary-glow)/0.25)]",
        "dark:focus:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3),inset_-2px_-2px_5px_rgba(60,70,90,0.15),0_0_0_3px_hsl(var(--color-primary-glow)/0.3)]",
        error &&
          "shadow-[inset_2px_2px_5px_rgba(0,0,0,0.08),inset_-2px_-2px_5px_rgba(255,255,255,0.8),0_0_0_2px_hsl(var(--color-destructive)/0.5)]",
      ),
    };

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            {label}
            {props.required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "flex h-12 w-full appearance-none rounded-xl px-4 py-3 pr-11 text-sm text-foreground",
              "focus:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-all duration-200",
              "cursor-pointer",
              variants[variant],
              className,
            )}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error
                ? `${selectId}-error`
                : hint
                  ? `${selectId}-hint`
                  : undefined
            }
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div
            className={cn(
              "pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2",
              "flex h-6 w-6 items-center justify-center rounded-md",
              "bg-steel-200/50 dark:bg-steel-700/50",
            )}
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        {error && (
          <p
            id={`${selectId}-error`}
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
            id={`${selectId}-hint`}
            className="mt-2 text-sm text-muted-foreground"
          >
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";

export { Select };

"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, description, id, ...props }, ref) => {
    const switchId = id || props.name;

    return (
      <div className="flex items-center justify-between gap-4">
        {(label || description) && (
          <div className="space-y-0.5">
            {label && (
              <label
                htmlFor={switchId}
                className={cn(
                  "text-sm font-medium cursor-pointer",
                  props.disabled && "cursor-not-allowed opacity-50"
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={switchId}
            type="checkbox"
            role="switch"
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              "h-6 w-11 rounded-full bg-input transition-colors",
              "peer-checked:bg-primary",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
              "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
              className
            )}
          />
          <div
            className={cn(
              "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
              "peer-checked:translate-x-5"
            )}
          />
        </div>
      </div>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };

"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface DropdownItem {
  label: string;
  value: string;
  icon?: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
  onClick?: () => void;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

function Dropdown({
  trigger,
  items,
  align = "left",
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={cn("relative inline-block", className)}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 min-w-[200px]",
            "rounded-xl p-1.5",
            // Glassmorphism effect
            "bg-white/90 dark:bg-steel-800/95",
            "backdrop-blur-xl",
            "border border-white/50 dark:border-white/10",
            "shadow-lg shadow-black/10 dark:shadow-black/30",
            "animate-fade-in-down",
            align === "left" ? "left-0" : "right-0",
          )}
          role="menu"
        >
          {items.map((item, index) => (
            <button
              key={item.value}
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                item.onClick?.();
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                "text-popover-foreground font-medium",
                "transition-all duration-150",
                "hover:bg-steel-100 dark:hover:bg-steel-700",
                "focus:bg-steel-100 dark:focus:bg-steel-700 focus:outline-none",
                "disabled:pointer-events-none disabled:opacity-50",
                "active:scale-[0.98]",
                item.destructive &&
                  cn(
                    "text-destructive",
                    "hover:bg-destructive/10 focus:bg-destructive/10",
                    "dark:hover:bg-destructive/20 dark:focus:bg-destructive/20",
                  ),
              )}
            >
              {item.icon && (
                <span
                  className={cn(
                    "h-4 w-4 flex-shrink-0",
                    !item.destructive && "text-muted-foreground",
                  )}
                >
                  {item.icon}
                </span>
              )}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { Dropdown };

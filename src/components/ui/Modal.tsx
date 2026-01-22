"use client";

import { useEffect, useCallback, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";
import { X } from "lucide-react";
import { Button } from "./Button";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  footer?: ReactNode;
  variant?: "default" | "glass";
}

function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  footer,
  variant = "default",
}: ModalProps) {
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-4xl",
  };

  const variants = {
    default: cn("bg-card border border-border", "shadow-2xl"),
    glass: cn(
      "bg-white/80 dark:bg-steel-900/90",
      "backdrop-blur-2xl",
      "border border-white/30 dark:border-white/10",
      "shadow-glass",
    ),
  };

  // Handle escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEscape) {
        onClose();
      }
    },
    [onClose, closeOnEscape],
  );

  // Handle body scroll lock and escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
    >
      {/* Overlay with blur */}
      <div
        className={cn(
          "fixed inset-0 bg-black/40 dark:bg-black/60",
          "backdrop-blur-sm",
          "animate-fade-in",
        )}
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        className={cn(
          "relative z-10 w-full rounded-2xl",
          "max-h-[90vh] flex flex-col",
          "animate-scale-in",
          variants[variant],
          sizes[size],
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-6 pb-2">
            <div>
              {title && (
                <h2
                  id="modal-title"
                  className="text-xl font-bold text-card-foreground tracking-tight"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="mt-1.5 text-sm text-muted-foreground"
                >
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className={cn(
                  "h-9 w-9 -mr-2 -mt-2 rounded-xl",
                  "hover:bg-steel-200 dark:hover:bg-steel-700",
                )}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 pt-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div
            className={cn(
              "flex items-center justify-end gap-3 p-6 pt-4",
              "border-t border-border/50",
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // Only render portal on client side
  if (typeof window === "undefined") return null;

  return createPortal(modalContent, document.body);
}

export { Modal };

"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui";
import { Plus } from "lucide-react";
import {
  BlueprintIllustration,
  ClipboardIllustration,
  GavelIllustration,
  ToolboxIllustration,
  WorkersIllustration,
  ErrorIllustration,
  SearchEmptyIllustration,
} from "@/components/illustrations";

type IllustrationType =
  | "blueprint"
  | "clipboard"
  | "gavel"
  | "toolbox"
  | "workers"
  | "error"
  | "search"
  | "custom";

interface EmptyStateProps {
  icon?: ReactNode;
  illustration?: IllustrationType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const illustrations: Record<
  Exclude<IllustrationType, "custom">,
  React.FC<{ className?: string }>
> = {
  blueprint: BlueprintIllustration,
  clipboard: ClipboardIllustration,
  gavel: GavelIllustration,
  toolbox: ToolboxIllustration,
  workers: WorkersIllustration,
  error: ErrorIllustration,
  search: SearchEmptyIllustration,
};

export function EmptyState({
  icon,
  illustration = "blueprint",
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const IllustrationComponent =
    illustration !== "custom" ? illustrations[illustration] : null;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        "animate-fade-in-up",
        className,
      )}
    >
      {/* Illustration or Icon */}
      <div className="mb-6 animate-float">
        {icon ? (
          <div
            className={cn(
              "flex h-20 w-20 items-center justify-center rounded-2xl",
              "bg-steel-100 dark:bg-steel-800",
              "shadow-neu-outset-sm",
            )}
          >
            {icon}
          </div>
        ) : IllustrationComponent ? (
          <IllustrationComponent className="w-52 h-auto opacity-90" />
        ) : null}
      </div>

      {/* Title */}
      <h3
        className={cn(
          "text-xl font-bold text-foreground mb-2",
          "tracking-tight",
        )}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-base text-muted-foreground max-w-md mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {action && (
            <Button
              onClick={action.onClick}
              leftIcon={action.icon || <Plus className="h-4 w-4" />}
              size="lg"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" onClick={secondaryAction.onClick} size="lg">
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

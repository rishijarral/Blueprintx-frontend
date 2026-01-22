import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes with clsx
 * Handles class conflicts and conditional classes
 * 
 * @example
 * cn("px-4 py-2", condition && "bg-primary", "text-white")
 * cn("p-4", className) // where className might override padding
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

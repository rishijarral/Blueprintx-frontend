"use client";

import {
  motion,
  type HTMLMotionProps,
  type Variants,
  AnimatePresence,
} from "framer-motion";
import { forwardRef, type ReactNode } from "react";

// ============================================
// Animation Variants
// ============================================

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export const cardHover: Variants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -4,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  tap: { scale: 0.98 },
};

export const buttonTap: Variants = {
  rest: { scale: 1 },
  tap: { scale: 0.97 },
};

// ============================================
// Motion Components
// ============================================

interface MotionDivProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
}

// Fade In Up Animation
export const FadeInUp = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeInUp}
      {...props}
    >
      {children}
    </motion.div>
  ),
);
FadeInUp.displayName = "FadeInUp";

// Fade In Animation
export const FadeIn = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={fadeIn}
      {...props}
    >
      {children}
    </motion.div>
  ),
);
FadeIn.displayName = "FadeIn";

// Scale In Animation
export const ScaleIn = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={scaleIn}
      {...props}
    >
      {children}
    </motion.div>
  ),
);
ScaleIn.displayName = "ScaleIn";

// Stagger Container
interface StaggerContainerProps extends MotionDivProps {
  delay?: number;
  staggerDelay?: number;
}

export const StaggerContainer = forwardRef<
  HTMLDivElement,
  StaggerContainerProps
>(({ children, delay = 0.1, staggerDelay = 0.08, ...props }, ref) => (
  <motion.div
    ref={ref}
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: delay,
        },
      },
    }}
    {...props}
  >
    {children}
  </motion.div>
));
StaggerContainer.displayName = "StaggerContainer";

// Stagger Item
export const StaggerItem = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, ...props }, ref) => (
    <motion.div ref={ref} variants={staggerItem} {...props}>
      {children}
    </motion.div>
  ),
);
StaggerItem.displayName = "StaggerItem";

// Hover Card
interface HoverCardProps extends MotionDivProps {
  hoverScale?: number;
  hoverY?: number;
}

export const HoverCard = forwardRef<HTMLDivElement, HoverCardProps>(
  ({ children, hoverScale = 1.02, hoverY = -4, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      variants={{
        rest: { scale: 1, y: 0 },
        hover: {
          scale: hoverScale,
          y: hoverY,
          transition: { duration: 0.25, ease: "easeOut" },
        },
        tap: { scale: 0.98 },
      }}
      {...props}
    >
      {children}
    </motion.div>
  ),
);
HoverCard.displayName = "HoverCard";

// Page Transition Wrapper
export const PageTransition = forwardRef<HTMLDivElement, MotionDivProps>(
  ({ children, ...props }, ref) => (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      {...props}
    >
      {children}
    </motion.div>
  ),
);
PageTransition.displayName = "PageTransition";

// Counter Animation Component
interface CounterProps {
  value: number;
  duration?: number;
  className?: string;
  formatFn?: (value: number) => string;
}

export function Counter({
  value,
  duration = 1.5,
  className,
  formatFn,
}: CounterProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {formatFn ? formatFn(value) : value}
      </motion.span>
    </motion.span>
  );
}

// Export AnimatePresence for convenience
export { AnimatePresence, motion };

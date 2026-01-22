"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

interface UseInViewOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

interface UseInViewReturn<T extends HTMLElement> {
  ref: RefObject<T | null>;
  isInView: boolean;
}

/**
 * Hook to detect when an element enters the viewport
 * Useful for scroll-triggered animations
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: UseInViewOptions = {},
): UseInViewReturn<T> {
  const { threshold = 0.1, rootMargin = "0px", triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isInView };
}

/**
 * Hook for staggered animations on multiple elements
 */
export function useStaggeredInView<T extends HTMLElement = HTMLDivElement>(
  itemCount: number,
  options: UseInViewOptions = {},
): {
  containerRef: RefObject<T | null>;
  isInView: boolean;
  getDelay: (index: number) => number;
} {
  const { ref: containerRef, isInView } = useInView<T>(options);

  const getDelay = (index: number): number => {
    return index * 50; // 50ms stagger between items
  };

  return { containerRef, isInView, getDelay };
}

/**
 * Hook for animated counters
 */
export function useCountUp(
  end: number,
  options: {
    duration?: number;
    startOnView?: boolean;
  } = {},
): { ref: RefObject<HTMLElement | null>; count: number } {
  const { duration = 1000, startOnView = true } = options;
  const ref = useRef<HTMLElement>(null);
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasStarted) return;

    const startAnimation = () => {
      setHasStarted(true);
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(easeOut * end));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };

      requestAnimationFrame(animate);
    };

    if (!startOnView) {
      startAnimation();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startAnimation();
          observer.unobserve(element);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [end, duration, startOnView, hasStarted]);

  return { ref, count };
}

/**
 * Security utilities for input validation and sanitization
 */

/**
 * Sanitize a string to prevent XSS attacks
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Check if a string contains potentially dangerous content
 */
export function containsDangerousContent(input: string): boolean {
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick=, onerror=, etc.
    /data:/gi, // data: URLs
    /vbscript:/gi,
    /expression\s*\(/gi, // CSS expressions
  ];

  return dangerousPatterns.some((pattern) => pattern.test(input));
}

/**
 * Validate password strength
 * Returns an object with validation results
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number; // 0-4
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("Password must be at least 8 characters");
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add uppercase letters");
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add lowercase letters");
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add numbers");
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add special characters");
  }

  return {
    isValid: score >= 4,
    score: Math.min(score, 4),
    feedback,
  };
}

/**
 * Generate a cryptographically secure random string
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

/**
 * Rate limiter for client-side operations
 */
export class ClientRateLimiter {
  private timestamps: number[] = [];
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if action is allowed
   */
  canProceed(): boolean {
    const now = Date.now();
    // Remove timestamps outside the window
    this.timestamps = this.timestamps.filter(
      (timestamp) => now - timestamp < this.windowMs,
    );
    return this.timestamps.length < this.maxRequests;
  }

  /**
   * Record an action
   */
  recordAction(): void {
    this.timestamps.push(Date.now());
  }

  /**
   * Get time until next allowed action (in ms)
   */
  getTimeUntilReset(): number {
    if (this.canProceed()) return 0;
    const oldestTimestamp = this.timestamps[0];
    return this.windowMs - (Date.now() - oldestTimestamp);
  }

  /**
   * Try to perform an action, returns false if rate limited
   */
  tryAction(): boolean {
    if (!this.canProceed()) return false;
    this.recordAction();
    return true;
  }
}

/**
 * Debounce function to prevent rapid-fire events
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle function to limit execution frequency
 */
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Mask sensitive data for display
 */
export function maskSensitiveData(
  data: string,
  visibleChars: number = 4,
): string {
  if (data.length <= visibleChars * 2) {
    return "*".repeat(data.length);
  }
  const start = data.slice(0, visibleChars);
  const end = data.slice(-visibleChars);
  const masked = "*".repeat(data.length - visibleChars * 2);
  return `${start}${masked}${end}`;
}

/**
 * Check if running in a secure context (HTTPS or localhost)
 */
export function isSecureContext(): boolean {
  if (typeof window === "undefined") return true;
  return window.isSecureContext;
}

/**
 * Safely parse JSON with error handling
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

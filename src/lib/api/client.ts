import { getClient } from "@/lib/supabase/client";
import type { APIError, ApiResponse, PaginatedResponse } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Request timeout (30 seconds)
const REQUEST_TIMEOUT = 30000;

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Token cache to avoid repeated Supabase calls
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;
let tokenPromise: Promise<string | null> | null = null;

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  status: number;
  code: string;
  details?: Record<string, unknown>;
  isRetryable: boolean;

  constructor(status: number, error: APIError) {
    super(error.message);
    this.name = "ApiError";
    this.status = status;
    this.code = error.error;
    this.details = error.details;
    this.isRetryable = status >= 500 || status === 0;
  }
}

/**
 * Get the current access token from Supabase with caching
 * Uses in-memory cache to avoid repeated getSession() calls
 */
async function getAccessToken(): Promise<string | null> {
  const now = Date.now();
  
  // Return cached token if still valid (with 30s buffer before expiry)
  if (cachedToken && tokenExpiresAt > now + 30000) {
    return cachedToken;
  }
  
  // If there's already a token fetch in progress, wait for it
  if (tokenPromise) {
    return tokenPromise;
  }
  
  // Fetch new token
  tokenPromise = (async () => {
    try {
      const supabase = getClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        cachedToken = session.access_token;
        // Cache until token expires (exp is in seconds, convert to ms)
        // Parse JWT to get expiry without external deps
        try {
          const payload = JSON.parse(atob(session.access_token.split('.')[1]));
          tokenExpiresAt = payload.exp * 1000;
        } catch {
          // If parsing fails, cache for 5 minutes
          tokenExpiresAt = now + 5 * 60 * 1000;
        }
        return cachedToken;
      }
      
      cachedToken = null;
      tokenExpiresAt = 0;
      return null;
    } finally {
      tokenPromise = null;
    }
  })();
  
  return tokenPromise;
}

/**
 * Clear the token cache (call on logout)
 */
export function clearTokenCache(): void {
  cachedToken = null;
  tokenExpiresAt = 0;
  tokenPromise = null;
}

/**
 * Create an AbortController with timeout
 */
function createTimeoutController(timeout: number): {
  controller: AbortController;
  timeoutId: NodeJS.Timeout;
} {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  return { controller, timeoutId };
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Base API client for making authenticated requests
 * Handles response unwrapping, retries, and errors
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retryCount = 0,
): Promise<T> {
  const token = await getAccessToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    // Allow the browser to cache GET requests and use conditional requests
    "Accept": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const { controller, timeoutId } = createTimeoutController(REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
      // Use include for cross-origin requests in dev (localhost:3000 -> localhost:8080)
      credentials: "include",
      // Enable keepalive for faster subsequent requests
      keepalive: true,
    });

    clearTimeout(timeoutId);

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 5000;

      if (retryCount < MAX_RETRIES) {
        await sleep(waitTime);
        return apiRequest<T>(endpoint, options, retryCount + 1);
      }

      throw new ApiError(429, {
        error: "rate_limited",
        message: "Too many requests. Please try again later.",
        status_code: 429,
      });
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    // Parse response
    const contentType = response.headers.get("content-type");
    let data: unknown;

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error = data as APIError;
      const apiError = new ApiError(response.status, {
        error: error.error || "unknown_error",
        message: error.message || "An unexpected error occurred",
        status_code: response.status,
        details: error.details,
      });

      // Retry on server errors
      if (apiError.isRetryable && retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, retryCount);
        await sleep(delay);
        return apiRequest<T>(endpoint, options, retryCount + 1);
      }

      throw apiError;
    }

    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(0, {
        error: "timeout",
        message: "Request timed out. Please try again.",
        status_code: 0,
      });
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      if (retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, retryCount);
        await sleep(delay);
        return apiRequest<T>(endpoint, options, retryCount + 1);
      }

      throw new ApiError(0, {
        error: "network_error",
        message:
          "Unable to connect to the server. Please check your connection.",
        status_code: 0,
      });
    }

    throw error;
  }
}

/**
 * GET request - automatically unwraps { data: T } responses
 */
export async function apiGet<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  let url = endpoint;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        // Don't double-encode - URLSearchParams handles encoding
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await apiRequest<T | ApiResponse<T>>(url, { method: "GET" });

  // Unwrap { data: T } response if present (for single item responses)
  // Paginated responses already have correct shape
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    !("pagination" in response)
  ) {
    return (response as ApiResponse<T>).data;
  }

  return response as T;
}

/**
 * GET request for paginated endpoints - returns full response with pagination
 */
export async function apiGetPaginated<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | string[] | undefined>,
): Promise<PaginatedResponse<T>> {
  let url = endpoint;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(key, v));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return apiRequest<PaginatedResponse<T>>(url, { method: "GET" });
}

/**
 * POST request - automatically unwraps { data: T } responses
 */
export async function apiPost<T>(endpoint: string, body?: unknown): Promise<T> {
  const response = await apiRequest<T | ApiResponse<T>>(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });

  // Unwrap { data: T } response
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiResponse<T>).data;
  }

  return response as T;
}

/**
 * PUT request - automatically unwraps { data: T } responses
 */
export async function apiPut<T>(endpoint: string, body?: unknown): Promise<T> {
  const response = await apiRequest<T | ApiResponse<T>>(endpoint, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });

  // Unwrap { data: T } response
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiResponse<T>).data;
  }

  return response as T;
}

/**
 * PATCH request - automatically unwraps { data: T } responses
 */
export async function apiPatch<T>(
  endpoint: string,
  body?: unknown,
): Promise<T> {
  const response = await apiRequest<T | ApiResponse<T>>(endpoint, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });

  // Unwrap { data: T } response
  if (response && typeof response === "object" && "data" in response) {
    return (response as ApiResponse<T>).data;
  }

  return response as T;
}

/**
 * DELETE request
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: "DELETE" });
}

/**
 * Upload file with multipart form data
 */
export async function apiUpload<T>(
  endpoint: string,
  formData: FormData,
  onProgress?: (progress: number) => void,
): Promise<T> {
  const token = await getAccessToken();

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.timeout = REQUEST_TIMEOUT * 2;

    xhr.open("POST", `${API_BASE_URL}${endpoint}`);

    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          // Unwrap { data: T } response
          if (response && typeof response === "object" && "data" in response) {
            resolve(response.data);
          } else {
            resolve(response);
          }
        } catch {
          resolve(xhr.responseText as unknown as T);
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new ApiError(xhr.status, error));
        } catch {
          reject(
            new ApiError(xhr.status, {
              error: "upload_failed",
              message: xhr.statusText || "An error occurred during upload",
              status_code: xhr.status,
            }),
          );
        }
      }
    });

    xhr.addEventListener("error", () => {
      reject(
        new ApiError(0, {
          error: "network_error",
          message: "Failed to connect to the server",
          status_code: 0,
        }),
      );
    });

    xhr.addEventListener("timeout", () => {
      reject(
        new ApiError(0, {
          error: "timeout",
          message: "Upload timed out. Please try again with a smaller file.",
          status_code: 0,
        }),
      );
    });

    xhr.send(formData);
  });
}

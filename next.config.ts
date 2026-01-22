import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // =============================================================================
  // SECURITY HEADERS
  // =============================================================================
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: [
          // Prevent clickjacking attacks
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Enable XSS filter in browsers
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Control referrer information
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions Policy (formerly Feature-Policy)
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // Strict Transport Security (HSTS)
          // Only enable in production with HTTPS
          ...(process.env.NODE_ENV === "production"
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains; preload",
                },
              ]
            : []),
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              // Default to self
              "default-src 'self'",
              // Scripts: self + inline for Next.js hydration + eval for dev
              process.env.NODE_ENV === "production"
                ? "script-src 'self' 'unsafe-inline'"
                : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Styles: self + inline for Tailwind/styled-jsx
              "style-src 'self' 'unsafe-inline'",
              // Images: self + data URIs + Supabase storage + common CDNs
              "img-src 'self' data: blob: https://*.supabase.co https://*.supabase.in",
              // Fonts: self + Google Fonts
              "font-src 'self' data: https://fonts.gstatic.com",
              // Connect: API endpoints + Supabase
              `connect-src 'self' ${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"} ${process.env.NEXT_PUBLIC_SUPABASE_URL || ""} wss://*.supabase.co`,
              // Frame ancestors: prevent embedding
              "frame-ancestors 'none'",
              // Base URI
              "base-uri 'self'",
              // Form actions
              "form-action 'self'",
              // Upgrade insecure requests in production
              ...(process.env.NODE_ENV === "production"
                ? ["upgrade-insecure-requests"]
                : []),
            ].join("; "),
          },
        ],
      },
    ];
  },

  // =============================================================================
  // PERFORMANCE OPTIMIZATIONS
  // =============================================================================

  // Enable React Strict Mode for better development experience
  reactStrictMode: true,

  // Optimize images
  images: {
    // Enable modern image formats
    formats: ["image/avif", "image/webp"],
    // Remote image domains (Supabase storage)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
      },
    ],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    // Image sizes for next/image
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimize image size
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Enable experimental features for better performance
  experimental: {
    // Optimize package imports to reduce bundle size
    optimizePackageImports: [
      "lucide-react",
      "date-fns",
      "framer-motion",
      "@tanstack/react-query",
    ],
  },

  // =============================================================================
  // BUILD OPTIMIZATIONS
  // =============================================================================

  // Disable x-powered-by header
  poweredByHeader: false,

  // Generate ETags for caching
  generateEtags: true,

  // Compress responses
  compress: true,

  // Production source maps (disable for smaller builds, enable for debugging)
  productionBrowserSourceMaps: false,

  // =============================================================================
  // TURBOPACK CONFIGURATION (Next.js 16+)
  // =============================================================================
  // Empty config to acknowledge Turbopack is being used
  turbopack: {},

  // =============================================================================
  // REDIRECTS & REWRITES
  // =============================================================================

  // Permanent redirects
  async redirects() {
    return [
      // Redirect /home to /
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      // Redirect /dashboard to /
      {
        source: "/dashboard",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

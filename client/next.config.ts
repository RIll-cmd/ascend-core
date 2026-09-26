import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 2,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
  async rewrites() {
    // Resolve the backend API URL dynamically based on environment configuration:
    // 1. Explicit NEXT_PUBLIC_API_URL or CORE_API_URL (e.g. Vercel Preview/Staging or Production override)
    // 2. Local development fallback (http://127.0.0.1:8000)
    // 3. Production default (https://ascend-os-server.onrender.com)
    const backendUrl =
      process.env.CORE_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      (process.env.NODE_ENV === "development"
        ? "http://127.0.0.1:8000"
        : "https://ascend-os-server.onrender.com");

    const trimmed = backendUrl.replace(/\/$/, "");

    return [
      {
        source: "/api",
        destination: `${trimmed}/api`,
      },
      {
        source: "/api/:path*",
        destination: `${trimmed}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;



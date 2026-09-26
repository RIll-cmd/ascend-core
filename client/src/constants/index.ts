export const APP_NAME = "Ascend OS";

const getApiBaseUrl = () => {
  // Explicit env override takes precedence (e.g. Vercel env or .env.production)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  // In the browser when no explicit URL is configured,
  // an empty string routes through relative /api paths (handled by Next.js / Vercel rewrites)
  if (typeof window !== "undefined") {
    return "";
  }
  if (process.env.VERCEL_ENV === "preview") {
    return "https://ascend-os-server-staging.onrender.com";
  }
  return "http://127.0.0.1:8000";
};

export const API_BASE_URL = getApiBaseUrl();

export const NAVIGATION_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Profile", href: "/profile", icon: "User" },
  { label: "Settings", href: "/settings", icon: "Settings" },
];

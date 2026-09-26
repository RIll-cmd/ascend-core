export const APP_NAME = "Ascend OS";

const getApiBaseUrl = () => {
  // If in a Vercel Preview environment, always point to staging Core
  if (
    process.env.VERCEL_ENV === "preview" ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === "preview"
  ) {
    return "https://ascend-os-server-staging.onrender.com";
  }

  // In the browser, check if running on a Vercel preview domain
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (
      (host.endsWith(".vercel.app") && !host.startsWith("ascend-core.") && !host.startsWith("ascend-os.")) ||
      host.includes("-git-")
    ) {
      return "https://ascend-os-server-staging.onrender.com";
    }
    return "";
  }

  // Explicit env override for other environments
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }

  return "http://127.0.0.1:8000";
};

export const API_BASE_URL = getApiBaseUrl();

export const NAVIGATION_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Profile", href: "/profile", icon: "User" },
  { label: "Settings", href: "/settings", icon: "Settings" },
];

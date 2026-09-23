const PUBLIC_ROUTES = [
  "/landing",
  "/login",
  "/register",
  "/guest",
  "/unauthorized",
  "/v2",
  "/privacy",
  "/terms",
  "/refund",
] as const;

const PROTECTED_ROUTE_ROOTS = [
  "/dashboard", "/missions", "/habits", "/calendar", "/profile",
  "/workouts", "/sleep", "/learning", "/skills", "/tower",
  "/bosses", "/inventory", "/crafting", "/shop", "/beasts",
  "/beasts-and-pets", "/aira", "/achievements", "/automations",
  "/analytics", "/season-pass", "/character", "/editor", "/settings",
  "/onboarding",
] as const;

export const isPublicRoute = (pathname: string) =>
  PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

const isProtectedRoute = (pathname: string) =>
  PROTECTED_ROUTE_ROOTS.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

export function getAuthRedirect(
  pathname: string,
  isAuthenticated: boolean
): string | null {
  if (isAuthenticated && (pathname === "/" || pathname === "/login")) {
    return "/dashboard";
  }

  if (!isAuthenticated && isProtectedRoute(pathname) && !isPublicRoute(pathname)) {
    return "/login";
  }

  return null;
}

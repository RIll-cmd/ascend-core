const PUBLIC_ROUTES = [
  "/landing",
  "/login",
  "/register",
  "/guest",
  "/unauthorized",
  "/v2",
] as const;

const isPublicRoute = (pathname: string) =>
  PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

export function getAuthRedirect(
  pathname: string,
  isAuthenticated: boolean
): string | null {
  if (isAuthenticated && (pathname === "/" || pathname === "/login")) {
    return "/dashboard";
  }

  if (!isAuthenticated && !isPublicRoute(pathname) && pathname !== "/") {
    return "/login";
  }

  return null;
}

"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { getAuthRedirect, isPublicRoute } from "@/lib/authRouteGuard";
import { Spinner } from "@/components/ui/8bit/spinner";

export function AuthRouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (!isHydrated) return;

    const redirectPath = getAuthRedirect(pathname, isAuthenticated);
    if (redirectPath && redirectPath !== pathname) {
      router.replace(redirectPath);
    }
  }, [isAuthenticated, isHydrated, pathname, router]);

  const isStaticPublic =
    isPublicRoute(pathname) && pathname !== "/" && pathname !== "/login";

  if (!isHydrated && !isStaticPublic) {
    return <AuthLoadingState />;
  }

  const redirectPath = getAuthRedirect(pathname, isAuthenticated);
  if (redirectPath) {
    return <AuthLoadingState />;
  }

  return children;
}

export function AuthLoadingState() {
  return (
    <div
      role="status"
      aria-label="Restoring session"
      className="fixed inset-0 z-[9999] bg-black text-white flex items-center justify-center select-none"
    >
      <div className="flex items-center gap-3 text-xs font-mono tracking-[0.25em] text-zinc-300">
        <Spinner variant="diamond" className="size-4 text-white" />
        <span>RESTORING SESSION</span>
      </div>
    </div>
  );
}

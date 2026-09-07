"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { getAuthRedirect } from "@/lib/authRouteGuard";

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

  if (!isHydrated) {
    return <AuthLoadingState />;
  }

  const redirectPath = getAuthRedirect(pathname, isAuthenticated);
  if (redirectPath) {
    return <AuthLoadingState />;
  }

  return children;
}

function AuthLoadingState() {
  return (
    <main className="min-h-screen w-full bg-[#0B1020] text-slate-100 flex items-center justify-center">
      <div className="flex items-center gap-3 text-xs font-mono tracking-[0.2em] text-blue-300">
        <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
        RESTORING SESSION
      </div>
    </main>
  );
}

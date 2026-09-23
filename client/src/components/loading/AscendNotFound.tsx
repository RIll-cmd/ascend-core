"use client";

import { useRouter } from "next/navigation";
import NotFoundBrickBreaker from "@/components/ui/8bit/blocks/not-found-brick-breaker";

export function AscendNotFound(): React.JSX.Element {
  const router = useRouter();

  function goBack() {
    const referrer = document.referrer;
    if (window.history.length > 1 && referrer && new URL(referrer).origin === window.location.origin) {
      router.back();
    } else {
      router.push("/landing");
    }
  }

  return (
    <main className="min-h-screen bg-[#0B1020] text-slate-100">
      <NotFoundBrickBreaker
        badge="LOST COORDINATES"
        title="BREAK OUT OF THE VOID"
        description="This route is gone. Clear the 404 wall or return to the gateway."
        href="/landing"
        cta="RETURN TO LANDING"
        className="min-h-[calc(100vh-5rem)] bg-[#0B1020] text-slate-100"
      />
      <div className="flex justify-center pb-8">
        <button type="button" onClick={goBack} className="rounded-none border border-cyan-400/60 px-5 py-3 font-mono text-xs text-cyan-300 hover:bg-cyan-400/10 focus-visible:outline-2 focus-visible:outline-cyan-300">
          GO BACK
        </button>
      </div>
    </main>
  );
}

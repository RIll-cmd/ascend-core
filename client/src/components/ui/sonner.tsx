"use client";

import {
  Check,
  Info,
  Loader2,
  OctagonX,
  TriangleAlert,
} from "lucide-react";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, toast as sonnerToast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/* === Tactile Circular Status Orbs (Matching AIRA Orb Motif) === */
const SuccessOrb = () => (
  <div className="relative w-8 h-8 rounded-full bg-[#08090d] border-2 border-white flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
    <div className="w-[22px] h-[22px] rounded-full bg-emerald-950/70 border border-emerald-400/80 flex items-center justify-center">
      <Check className="w-3.5 h-3.5 text-emerald-300 stroke-[3]" />
    </div>
  </div>
);

const InfoOrb = () => (
  <div className="relative w-8 h-8 rounded-full bg-[#08090d] border-2 border-white flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
    <div className="w-[22px] h-[22px] rounded-full bg-sky-950/70 border border-sky-400/80 flex items-center justify-center">
      <Info className="w-3.5 h-3.5 text-sky-300 stroke-[2.8]" />
    </div>
  </div>
);

const WarningOrb = () => (
  <div className="relative w-8 h-8 rounded-full bg-[#08090d] border-2 border-white flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
    <div className="w-[22px] h-[22px] rounded-full bg-amber-950/70 border border-amber-400/80 flex items-center justify-center">
      <TriangleAlert className="w-3.5 h-3.5 text-amber-300 stroke-[2.8]" />
    </div>
  </div>
);

const ErrorOrb = () => (
  <div className="relative w-8 h-8 rounded-full bg-[#08090d] border-2 border-white flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
    <div className="w-[22px] h-[22px] rounded-full bg-rose-950/70 border border-rose-400/80 flex items-center justify-center">
      <OctagonX className="w-3.5 h-3.5 text-rose-300 stroke-[2.8]" />
    </div>
  </div>
);

const LoadingOrb = () => (
  <div className="relative w-8 h-8 rounded-full bg-[#08090d] border-2 border-white flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
    <div className="w-[22px] h-[22px] rounded-full bg-cyan-950/70 border border-cyan-400/80 flex items-center justify-center">
      <Loader2 className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
    </div>
  </div>
);

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  useEffect(() => {
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
      (window as any).triggerSonnerToast = sonnerToast;
    }

    // Remove layout-transition (height) from Sonner's injected style tag to adhere to Web Interface Guidelines
    const sanitizeSonnerStyle = () => {
      document.querySelectorAll("style").forEach((st) => {
        if (st.textContent && st.textContent.includes("[data-sonner-toaster]") && st.textContent.includes("height .4s")) {
          st.textContent = st.textContent.replace(/height\s*\.4s,?/g, "");
        }
      });
    };
    sanitizeSonnerStyle();
    const observer = new MutationObserver(sanitizeSonnerStyle);
    observer.observe(document.head, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div suppressHydrationWarning>
      <Sonner
        theme={theme as ToasterProps["theme"]}
        className="toaster group"
        icons={{
          success: <SuccessOrb />,
          info: <InfoOrb />,
          warning: <WarningOrb />,
          error: <ErrorOrb />,
          loading: <LoadingOrb />,
        }}
        toastOptions={{
          classNames: {
            toast:
              "group toast relative !bg-[#08090d] !text-white !border-2 !border-white !rounded-[20px] !shadow-[0_16px_40px_rgba(0,0,0,0.95)] !backdrop-blur-xl !py-3.5 !px-4 !pr-10 sm:!pr-11 !min-h-[62px] !items-center !gap-3 !font-sans",
            title: "!text-white !font-bold !text-[13.5px] sm:!text-[14px] !leading-snug !tracking-normal",
            description: "!text-zinc-300 !text-[12px] sm:!text-[12.5px] !leading-relaxed !mt-0.5 !font-medium",
            actionButton:
              "!bg-white !text-black !font-bold !rounded-lg !text-xs !py-1.5 !px-3 hover:!bg-zinc-200 transition-colors",
            cancelButton:
              "!bg-zinc-800 !text-zinc-200 !rounded-lg !text-xs !py-1.5 !px-3 hover:!bg-zinc-700 transition-colors",
            closeButton:
              "!bg-[#08090d] !border !border-white/40 !text-white hover:!border-white !top-2.5 !right-2.5",
          },
        }}
        {...props}
      />
    </div>
  );
};

export { Toaster };

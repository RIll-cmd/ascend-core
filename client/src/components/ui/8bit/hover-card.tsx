"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import "./styles/retro.css";

interface HoverCardContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const HoverCardContext = React.createContext<HoverCardContextType>({
  open: false,
  setOpen: () => {},
});

function HoverCard({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <HoverCardContext.Provider value={{ open, setOpen }}>
      <div
        className="relative inline-block"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {children}
      </div>
    </HoverCardContext.Provider>
  );
}

function HoverCardTrigger({
  children,
  className,
  asChild,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
      className: cn("cursor-pointer inline-flex", className, (children.props as { className?: string })?.className),
      ...props,
    });
  }

  return (
    <div className={cn("cursor-pointer inline-flex", className)} {...props}>
      {children}
    </div>
  );
}

function HoverCardContent({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { open } = React.useContext(HoverCardContext);

  if (!open) return null;

  return (
    <div
      role="tooltip"
      className={cn(
        "absolute z-50 min-w-64 p-3 bg-[#181d17]/98 border-y-4 border-[#8c7a53] text-[#fff8df] shadow-[0_12px_30px_rgba(0,0,0,0.9)]",
        "top-full left-1/2 -translate-x-1/2 mt-2 animate-in fade-in zoom-in-95 duration-150 retro text-[10px]",
        className
      )}
      {...props}
    >
      {/* Stepped pixel side borders */}
      <div className="absolute inset-0 border-x-4 -mx-1 border-[#8c7a53] pointer-events-none" />
      {children}
    </div>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
export default HoverCard;

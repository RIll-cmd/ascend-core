import * as React from "react";
import { cn } from "@/lib/utils";
import "./styles/retro.css";

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "retro inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1",
        "bg-[#1c2237] text-slate-200 border-b-2 border-r-2 border-t border-l border-[#4b5563] shadow-[1px_1px_0_0_#000]",
        "px-1.5 font-mono text-[9px] font-bold uppercase select-none pointer-events-none",
        className
      )}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
}

export { Kbd, KbdGroup };
export default Kbd;

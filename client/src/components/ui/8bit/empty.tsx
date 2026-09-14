"use client";

import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import "./styles/retro.css";

const emptyMediaVariants = cva(
  "flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "relative bg-[#1c2237] text-[#f6c453] border-2 border-black flex size-12 shrink-0 items-center justify-center shadow-[2px_2px_0_0_#000]",
      },
      font: {
        normal: "font-mono",
        retro: "retro",
      },
    },
    defaultVariants: {
      variant: "icon",
      font: "retro",
    },
  }
);

function Empty({
  className,
  font = "retro",
  ...props
}: React.ComponentProps<"div"> & { font?: "normal" | "retro" }) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-none border-2 border-dashed border-[#8c7a53]/50 bg-[#121626]/80 p-6 text-center md:p-10 select-none",
        font !== "normal" && "retro",
        className
      )}
      {...props}
    />
  );
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn(
        "flex max-w-sm flex-col items-center gap-2 text-center",
        className
      )}
      {...props}
    />
  );
}

function EmptyMedia({
  className,
  variant = "icon",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div className={cn("relative size-max my-1", className)}>
      <div
        data-slot="empty-icon"
        data-variant={variant}
        className={cn(emptyMediaVariants({ variant, className }))}
        {...props}
      />
      {variant !== "default" && (
        <>
          <div className="absolute top-0 left-0 w-full h-1 bg-[#8c7a53] pointer-events-none" />
          <div className="absolute bottom-0 w-full h-1 bg-[#8c7a53] pointer-events-none" />
          <div className="absolute top-1 -left-1 w-1 h-1/2 bg-[#8c7a53] pointer-events-none" />
          <div className="absolute bottom-1 -left-1 w-1 h-1/2 bg-[#8c7a53] pointer-events-none" />
          <div className="absolute top-1 -right-1 w-1 h-1/2 bg-[#8c7a53] pointer-events-none" />
          <div className="absolute bottom-1 -right-1 w-1 h-1/2 bg-[#8c7a53] pointer-events-none" />
        </>
      )}
    </div>
  );
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-title"
      className={cn("text-sm font-bold tracking-wide text-white", className)}
      {...props}
    />
  );
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="empty-description"
      className={cn(
        "text-slate-400 text-[9px] leading-relaxed max-w-xs",
        className
      )}
      {...props}
    />
  );
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "flex w-full max-w-sm min-w-0 flex-col items-center gap-3 text-xs",
        className
      )}
      {...props}
    />
  );
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
};
export default Empty;

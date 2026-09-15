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
        icon: "relative bg-muted text-foreground flex size-12 shrink-0 items-center justify-center",
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
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-none border-2 border-dashed border-border bg-card/60 p-6 text-center select-none md:p-8",
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
          <div className="absolute top-0 left-0 w-full h-1.5 bg-foreground dark:bg-ring pointer-events-none" />
          <div className="absolute bottom-0 w-full h-1.5 bg-foreground dark:bg-ring pointer-events-none" />
          <div className="absolute top-1.5 -left-1.5 w-1.5 h-1/2 bg-foreground dark:bg-ring pointer-events-none" />
          <div className="absolute bottom-1.5 -left-1.5 w-1.5 h-1/2 bg-foreground dark:bg-ring pointer-events-none" />
          <div className="absolute top-1.5 -right-1.5 w-1.5 h-1/2 bg-foreground dark:bg-ring pointer-events-none" />
          <div className="absolute bottom-1.5 -right-1.5 w-1.5 h-1/2 bg-foreground dark:bg-ring pointer-events-none" />
        </>
      )}
    </div>
  );
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-title"
      className={cn("text-xs sm:text-sm font-bold tracking-wide text-foreground", className)}
      {...props}
    />
  );
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="empty-description"
      className={cn(
        "text-muted-foreground text-[10px] leading-relaxed max-w-xs",
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

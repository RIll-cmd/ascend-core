import * as React from "react";
import { cn } from "@/lib/utils";

export type PixelBorderStyle =
  | "retro-button"
  | "stepped-box"
  | "badge-tabs"
  | "pill-input"
  | "checkbox-square"
  | "switch-track"
  | "classic-flat";

export interface ButtonBorderDecorationsProps {
  variant?: string;
  size?: string;
  colorClass?: string;
  showShadows?: boolean;
  className?: string;
}

/**
 * Authentic @8bitcn/button pixel border decoration layer.
 * Renders 4 corner pixel anchors, stepped top/bottom bars, stepped side bars,
 * and retro 3D highlight/shadow layers.
 */
export function ButtonBorderDecorations({
  variant = "default",
  size = "default",
  colorClass = "bg-foreground dark:bg-ring",
  showShadows = true,
  className,
}: ButtonBorderDecorationsProps) {
  if (variant === "ghost" || variant === "link") return null;

  if (size === "icon") {
    return (
      <span
        aria-hidden="true"
        className={cn("pointer-events-none contents", className)}
        data-slot="button-decorations-icon"
      >
        <span className={cn("absolute top-0 left-0 h-[5px] w-full md:h-1.5", colorClass)} />
        <span className={cn("absolute bottom-0 h-[5px] w-full md:h-1.5", colorClass)} />
        <span className={cn("absolute top-1 -left-1 h-1/2 w-[5px] md:w-1.5", colorClass)} />
        <span className={cn("absolute bottom-1 -left-1 h-1/2 w-[5px] md:w-1.5", colorClass)} />
        <span className={cn("absolute top-1 -right-1 h-1/2 w-[5px] md:w-1.5", colorClass)} />
        <span className={cn("absolute -right-1 bottom-1 h-1/2 w-[5px] md:w-1.5", colorClass)} />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none contents", className)}
      data-slot="button-decorations"
    >
      {/* 4 Corner Pixels (steps the retro rounded contour) */}
      <span className={cn("absolute top-0 left-0 size-1.5", colorClass)} />
      <span className={cn("absolute top-0 right-0 size-1.5", colorClass)} />
      <span className={cn("absolute bottom-0 left-0 size-1.5", colorClass)} />
      <span className={cn("absolute right-0 bottom-0 size-1.5", colorClass)} />

      {/* Top and Bottom Horizontal Half-Bars */}
      <span className={cn("absolute -top-1.5 left-1.5 h-1.5 w-1/2", colorClass)} />
      <span className={cn("absolute -top-1.5 right-1.5 h-1.5 w-1/2", colorClass)} />
      <span className={cn("absolute -bottom-1.5 left-1.5 h-1.5 w-1/2", colorClass)} />
      <span className={cn("absolute -bottom-1.5 right-1.5 h-1.5 w-1/2", colorClass)} />

      {/* Stepped Left and Right Vertical Bars */}
      <span className={cn("absolute top-1.5 -left-1.5 h-[calc(100%-12px)] w-1.5", colorClass)} />
      <span className={cn("absolute top-1.5 -right-1.5 h-[calc(100%-12px)] w-1.5", colorClass)} />

      {/* Inner 3D Highlight / Shadow Layer */}
      {showShadows && variant !== "outline" && (
        <>
          <span className="absolute top-0 left-0 h-1.5 w-full bg-foreground/20 pointer-events-none" />
          <span className="absolute top-1.5 left-0 h-1.5 w-3 bg-foreground/20 pointer-events-none" />
          <span className="absolute bottom-0 left-0 h-1.5 w-full bg-foreground/20 pointer-events-none" />
          <span className="absolute right-0 bottom-1.5 h-1.5 w-3 bg-foreground/20 pointer-events-none" />
        </>
      )}
    </span>
  );
}

/**
 * Authentic @8bitcn/badge side pixel tab notches.
 */
export function BadgeTabDecorations({
  className,
  colorClass = "bg-inherit border-y border-black",
}: {
  className?: string;
  colorClass?: string;
}) {
  return (
    <>
      <span
        aria-hidden="true"
        className={cn(
          "-left-1.5 absolute inset-y-[4px] w-1.5 pointer-events-none",
          colorClass,
          className
        )}
      />
      <span
        aria-hidden="true"
        className={cn(
          "-right-1.5 absolute inset-y-[4px] w-1.5 pointer-events-none",
          colorClass,
          className
        )}
      />
    </>
  );
}

/**
 * Authentic @8bitcn/card, @8bitcn/input, and @8bitcn/checkbox stepped box border overlay.
 * Combined with container class `border-y-6`, this overlay provides the `-mx-1.5 border-x-6`
 * stepped cut-corners.
 */
export function CardSteppedBorderOverlay({
  className,
  borderColor = "border-inherit",
}: {
  className?: string;
  borderColor?: string;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 border-x-6 -mx-1.5 pointer-events-none",
        borderColor,
        className
      )}
      aria-hidden="true"
    />
  );
}

/**
 * Authentic @8bitcn/switch stepped track border overlay.
 * Dual cross layers (border-y-4 -my-1 and border-x-4 -mx-1) creating a stepped retro toggle frame.
 */
export function SwitchSteppedBorderDecorations({
  className,
  borderColor = "border-foreground dark:border-ring",
}: {
  className?: string;
  borderColor?: string;
}) {
  return (
    <>
      <div
        className={cn(
          "absolute inset-0 border-y-4 -my-1 pointer-events-none",
          borderColor,
          className
        )}
        aria-hidden="true"
      />
      <div
        className={cn(
          "absolute inset-0 border-x-4 -mx-1 pointer-events-none",
          borderColor,
          className
        )}
        aria-hidden="true"
      />
    </>
  );
}

/**
 * Code extraction helper templates for documentation and copying directly in the Element Studio.
 */
export const BORDER_CODE_SNIPPETS: Record<
  PixelBorderStyle,
  { name: string; description: string; tailwindClasses: string; jsxSnippet: string }
> = {
  "retro-button": {
    name: "Retro Beveled Button Border",
    description: "4 corner anchor pixels, stepped top/bottom bars, side bars, and 3D shadows.",
    tailwindClasses: "relative border-none active:translate-y-1 transition-transform",
    jsxSnippet: `<button className="relative px-4 py-2 border-none active:translate-y-1 transition-transform bg-foreground text-background font-bold uppercase retro">
  Click Me
  {/* 8bitcn Stepped Pixel Border */}
  <span className="absolute top-0 left-0 size-1.5 bg-foreground" />
  <span className="absolute top-0 right-0 size-1.5 bg-foreground" />
  <span className="absolute bottom-0 left-0 size-1.5 bg-foreground" />
  <span className="absolute right-0 bottom-0 size-1.5 bg-foreground" />
  <span className="absolute -top-1.5 left-1.5 h-1.5 w-1/2 bg-foreground" />
  <span className="absolute -top-1.5 right-1.5 h-1.5 w-1/2 bg-foreground" />
  <span className="absolute -bottom-1.5 left-1.5 h-1.5 w-1/2 bg-foreground" />
  <span className="absolute -bottom-1.5 right-1.5 h-1.5 w-1/2 bg-foreground" />
  <span className="absolute top-1.5 -left-1.5 h-[calc(100%-12px)] w-1.5 bg-foreground" />
  <span className="absolute top-1.5 -right-1.5 h-[calc(100%-12px)] w-1.5 bg-foreground" />
</button>`,
  },
  "stepped-box": {
    name: "Stepped Notched Box Border",
    description: "Iconic 8bitcn card and input frame using border-y-6 and inset-0 border-x-6 -mx-1.5.",
    tailwindClasses: "relative border-y-6 border-foreground dark:border-ring",
    jsxSnippet: `<div className="relative border-y-6 border-foreground p-4 bg-card text-card-foreground">
  <div className="absolute inset-0 border-x-6 -mx-1.5 border-foreground pointer-events-none" aria-hidden="true" />
  Card Content
</div>`,
  },
  "badge-tabs": {
    name: "Stepped Tab Badge Border",
    description: "Horizontal badge pill with notched left and right pixel tabs.",
    tailwindClasses: "relative inline-flex items-stretch px-2 py-0.5",
    jsxSnippet: `<div className="relative inline-flex items-stretch px-2.5 py-0.5 bg-primary text-primary-foreground text-xs font-bold retro">
  Badge Label
  <div className="-left-1.5 absolute inset-y-[4px] w-1.5 bg-primary" />
  <div className="-right-1.5 absolute inset-y-[4px] w-1.5 bg-primary" />
</div>`,
  },
  "pill-input": {
    name: "Pill Contour Border",
    description: "Elongated retro outline frame with rounded pixel corners for date pickers and text fields.",
    tailwindClasses: "relative inline-flex items-center border-none px-4 py-2",
    jsxSnippet: `<div className="relative inline-flex items-center gap-2 px-4 py-2 text-sm retro border-none">
  <CalendarIcon className="size-4" />
  <span>Pick a date</span>
  <span className="absolute top-0 left-0 size-1.5 bg-foreground" />
  <span className="absolute top-0 right-0 size-1.5 bg-foreground" />
  <span className="absolute bottom-0 left-0 size-1.5 bg-foreground" />
  <span className="absolute right-0 bottom-0 size-1.5 bg-foreground" />
  <span className="absolute -top-1.5 left-1.5 h-1.5 w-1/2 bg-foreground" />
  <span className="absolute -top-1.5 right-1.5 h-1.5 w-1/2 bg-foreground" />
  <span className="absolute -bottom-1.5 left-1.5 h-1.5 w-1/2 bg-foreground" />
  <span className="absolute -bottom-1.5 right-1.5 h-1.5 w-1/2 bg-foreground" />
  <span className="absolute top-1.5 -left-1.5 h-[calc(100%-12px)] w-1.5 bg-foreground" />
  <span className="absolute top-1.5 -right-1.5 h-[calc(100%-12px)] w-1.5 bg-foreground" />
</div>`,
  },
  "checkbox-square": {
    name: "Stepped Checkbox Border",
    description: "Compact 20px retro square frame with stepped corners.",
    tailwindClasses: "relative size-5 border-y-6 border-foreground flex items-center justify-center",
    jsxSnippet: `<div className="relative size-5 border-y-6 border-foreground flex items-center justify-center">
  <div className="absolute inset-0 border-x-6 -mx-1.5 border-foreground pointer-events-none" aria-hidden="true" />
</div>`,
  },
  "switch-track": {
    name: "Stepped Switch Track Border",
    description: "Dual overlapping 4px cross border (border-y-4 -my-1 + border-x-4 -mx-1) creating a stepped retro toggle frame.",
    tailwindClasses: "relative inline-flex h-4 w-8 border-y-4 -my-1 and border-x-4 -mx-1",
    jsxSnippet: `<div className="relative inline-flex h-4 w-8 items-center bg-input">
  <div className="size-4 bg-foreground" />
  {/* Dual Overlapping Stepped Retro Borders */}
  <div className="absolute inset-0 border-y-4 -my-1 border-foreground dark:border-ring pointer-events-none" aria-hidden="true" />
  <div className="absolute inset-0 border-x-4 -mx-1 border-foreground dark:border-ring pointer-events-none" aria-hidden="true" />
</div>`,
  },
  "classic-flat": {
    name: "Classic Pixel Border",
    description: "2px solid border with 3px drop-shadow offset.",
    tailwindClasses: "border-2 border-black shadow-[3px_3px_0_0_#000]",
    jsxSnippet: `<div className="border-2 border-black shadow-[3px_3px_0_0_#000] p-4 bg-background">
  Content
</div>`,
  },
};

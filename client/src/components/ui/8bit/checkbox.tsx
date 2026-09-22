"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Checkbox as ShadcnCheckbox } from "@/components/ui/checkbox";
import "@/components/ui/8bit/styles/retro.css";

export const checkboxVariants = cva("", {
  variants: {
    font: {
      normal: "",
      retro: "retro",
    },
  },
  defaultVariants: {
    font: "retro",
  },
});

export interface BitCheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {
  asChild?: boolean;
  borderStyle?: string;
  wrapperClassName?: string;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  BitCheckboxProps
>(({ className, wrapperClassName, font, borderStyle, ...props }, ref) => {
  return (
    <div
      data-border-style={borderStyle}
      className={cn(
        "relative inline-flex items-center justify-center border-y-6 border-foreground dark:border-ring shrink-0 select-none",
        wrapperClassName
      )}
    >
      <ShadcnCheckbox
        ref={ref}
        className={cn(
          "rounded-none size-5 ring-0 border-none bg-background data-[state=checked]:bg-foreground dark:data-[state=checked]:bg-ring data-[state=checked]:text-background dark:data-[state=checked]:text-black",
          font !== "normal" && "retro",
          className
        )}
        {...props}
      />

      <div
        className="absolute inset-0 border-x-6 -mx-1.5 border-foreground dark:border-ring pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
});

Checkbox.displayName = "8BitCheckbox";

export { Checkbox };
export default Checkbox;

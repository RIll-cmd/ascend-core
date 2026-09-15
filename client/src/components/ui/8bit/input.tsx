import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Input as ShadcnInput } from "@/components/ui/input";
import "./styles/retro.css";

export const bitInputVariants = cva("", {
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

export interface BitInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof bitInputVariants> {
  asChild?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, BitInputProps>(
  ({ className, font, ...props }, ref) => {
    return (
      <div
        className={cn(
          "relative border-y-6 border-foreground dark:border-ring !p-0 flex items-center bg-background",
          className
        )}
      >
        <ShadcnInput
          ref={ref}
          {...props}
          className={cn(
            "rounded-none ring-0 !w-full border-0 bg-transparent px-3 py-2 text-xs focus-visible:ring-0 focus-visible:outline-none",
            font !== "normal" && "retro",
            className
          )}
        />

        {/* 8bitcn Stepped cut-corner side borders */}
        <div
          className="absolute inset-0 border-x-6 -mx-1.5 border-foreground dark:border-ring pointer-events-none"
          aria-hidden="true"
        />
      </div>
    );
  }
);

Input.displayName = "8BitInput";
export default Input;

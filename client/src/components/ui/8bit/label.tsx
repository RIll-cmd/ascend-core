import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import "./styles/retro.css";

export const bitLabelVariants = cva(
  "text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none",
  {
    variants: {
      font: {
        normal: "",
        retro: "retro text-[10px] tracking-wider",
      },
    },
    defaultVariants: {
      font: "retro",
    },
  }
);

export interface BitLabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof bitLabelVariants> {}

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  BitLabelProps
>(({ className, font = "retro", ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(bitLabelVariants({ font }), className)}
    {...props}
  />
));

Label.displayName = "8BitLabel";
export default Label;

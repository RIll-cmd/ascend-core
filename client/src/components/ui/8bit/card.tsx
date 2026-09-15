import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  Card as ShadcnCard,
  CardContent as ShadcnCardContent,
  CardDescription as ShadcnCardDescription,
  CardFooter as ShadcnCardFooter,
  CardHeader as ShadcnCardHeader,
  CardTitle as ShadcnCardTitle,
} from "@/components/ui/card";
import "./styles/retro.css";

export const cardVariants = cva("", {
  variants: {
    font: {
      normal: "",
      retro: "retro",
    },
    variant: {
      default: "border-foreground dark:border-ring bg-card text-card-foreground",
      dungeon: "border-[#8c7a53] bg-[#181d17]/95 text-[#fff8df]",
      tavern: "border-[#c79d4d] bg-[#231710]/95 text-[#fff1b5]",
      cyber: "border-cyan-500 bg-[#09151c]/95 text-cyan-100",
    },
  },
  defaultVariants: {
    font: "retro",
    variant: "default",
  },
});

export interface BitCardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

function Card({ className, font, variant = "default", ...props }: BitCardProps) {
  return (
    <div
      className={cn(
        "relative text-card-foreground border-y-6 p-0",
        cardVariants({ variant }),
        className
      )}
    >
      <ShadcnCard
        {...props}
        className={cn(
          "rounded-none border-0 w-full h-full flex flex-col bg-transparent text-inherit shadow-none",
          font !== "normal" && "retro"
        )}
      />

      {/* Stepped pixel side borders */}
      <div
        className="absolute inset-0 border-x-6 -mx-1.5 border-inherit pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}

function CardHeader({ className, font, ...props }: BitCardProps) {
  return (
    <ShadcnCardHeader
      className={cn(font !== "normal" && "retro", "p-4", className)}
      {...props}
    />
  );
}

function CardTitle({ className, font, ...props }: BitCardProps) {
  return (
    <ShadcnCardTitle
      className={cn(font !== "normal" && "retro text-sm sm:text-base font-bold tracking-wider", className)}
      {...props}
    />
  );
}

function CardDescription({ className, font, ...props }: BitCardProps) {
  return (
    <ShadcnCardDescription
      className={cn(font !== "normal" && "retro text-[10px] text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardContent({ className, font, ...props }: BitCardProps) {
  return (
    <ShadcnCardContent
      className={cn("flex-1 p-4 pt-0", font !== "normal" && "retro", className)}
      {...props}
    />
  );
}

function CardFooter({ className, font, ...props }: BitCardProps) {
  return (
    <ShadcnCardFooter
      data-slot="card-footer"
      className={cn("p-4 pt-0", font !== "normal" && "retro", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
export default Card;

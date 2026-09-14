import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import "./styles/retro.css";

function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn("group/item-group flex flex-col gap-1", className)}
      {...props}
    />
  );
}

function ItemSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cn("my-1 bg-[#8c7a53]/40", className)}
      {...props}
    />
  );
}

const itemVariants = cva(
  "group/item relative flex items-center border-2 border-black p-2.5 transition-colors duration-100 flex-wrap outline-none select-none",
  {
    variants: {
      variant: {
        default: "bg-[#141a2e]/90 text-slate-100 border-[#2f3b60]",
        outline: "bg-[#181d17]/95 border-[#8c7a53] text-[#fff8df]",
        muted: "bg-[#0b1020]/80 border-slate-800 text-slate-300",
        common: "bg-[#1e1b18]/90 border-[#785b34] text-slate-200",
        rare: "bg-[#0c1e33]/90 border-[#0284c7] text-sky-200",
        epic: "bg-[#25103a]/90 border-[#9333ea] text-purple-200",
        legendary: "bg-[#2d1c07]/90 border-[#f59e0b] text-amber-200",
        mythic: "bg-[#330814]/90 border-[#e11d48] text-rose-200",
      },
      size: {
        default: "p-3 gap-3",
        sm: "py-2 px-3 gap-2",
        lg: "p-4 gap-4",
      },
      font: {
        normal: "font-mono",
        retro: "retro",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      font: "retro",
    },
  }
);

export interface BitItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof itemVariants> {
  asChild?: boolean;
}

function Item({
  className,
  variant = "default",
  size = "default",
  font = "retro",
  asChild = false,
  ...props
}: BitItemProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-slot="item"
      data-variant={variant}
      data-size={size}
      data-font={font}
      className={cn(itemVariants({ variant, size, font, className }))}
      {...props}
    />
  );
}

const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center gap-2 relative",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "size-10 border-2 border-black bg-[#0f1422] p-1 shadow-[1px_1px_0_0_#000]",
        image: "size-11 border-2 border-black bg-[#101410] overflow-hidden [&_img]:size-full [&_img]:object-contain pixelated",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function ItemMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
      {...props}
    />
  );
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-content"
      className={cn("flex flex-1 flex-col gap-0.5 min-w-0", className)}
      {...props}
    />
  );
}

function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-title"
      className={cn(
        "flex w-fit items-center gap-2 text-xs font-bold leading-snug tracking-wide",
        className
      )}
      {...props}
    />
  );
}

function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="item-description"
      className={cn(
        "text-slate-400 line-clamp-1 text-[9px] font-mono leading-normal",
        className
      )}
      {...props}
    />
  );
}

function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-actions"
      className={cn("flex items-center gap-2 shrink-0", className)}
      {...props}
    />
  );
}

function ItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-header"
      className={cn("flex basis-full items-center justify-between gap-2", className)}
      {...props}
    />
  );
}

function ItemFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-footer"
      className={cn("flex basis-full items-center justify-between gap-2", className)}
      {...props}
    />
  );
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
};
export default Item;

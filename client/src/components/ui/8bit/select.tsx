"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { type VariantProps, cva } from "class-variance-authority";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import "./styles/retro.css";

export const selectVariants = cva("", {
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

const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;

interface BitSelectValueProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value>,
    VariantProps<typeof selectVariants> {}

const SelectValue = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Value>,
  BitSelectValueProps
>(({ className, font, ...props }, ref) => (
  <SelectPrimitive.Value
    ref={ref}
    className={cn(font !== "normal" && "retro", className)}
    {...props}
  />
));
SelectValue.displayName = "8BitSelectValue";

interface BitSelectTriggerProps
  extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>,
    VariantProps<typeof selectVariants> {}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  BitSelectTriggerProps
>(({ className, font, children, ...props }, ref) => (
  <div
    className={cn(
      "relative border-y-6 border-foreground dark:border-ring bg-background",
      font !== "normal" && "retro"
    )}
  >
    <SelectPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex h-9 w-full items-center justify-between gap-2 bg-transparent px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 border-0 rounded-none cursor-pointer",
        font !== "normal" && "retro",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="size-3.5 opacity-60 shrink-0" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>

    {/* 8bitcn Stepped Cut-Corner Overlay */}
    <div
      className="absolute inset-0 border-x-6 -mx-1.5 border-foreground dark:border-ring pointer-events-none"
      aria-hidden="true"
    />
  </div>
));
SelectTrigger.displayName = "8BitSelectTrigger";

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> &
    VariantProps<typeof selectVariants>
>(({ className, children, position = "popper", font, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden bg-popover text-popover-foreground shadow-md rounded-none border-4 border-foreground dark:border-ring -ml-1 mt-1 p-1",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        font !== "normal" && "retro",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = "8BitSelectContent";

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-xs font-semibold retro", className)}
    {...props}
  />
));
SelectLabel.displayName = "8BitSelectLabel";

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center py-1.5 pl-7 pr-2 text-xs outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 rounded-none border-y-2 border-dashed border-transparent hover:border-foreground dark:hover:border-ring retro cursor-pointer",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex size-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="size-3" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = "8BitSelectItem";

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
SelectSeparator.displayName = "8BitSelectSeparator";

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronUp className="size-4" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = "8BitSelectScrollUpButton";

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronDown className="size-4" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName = "8BitSelectScrollDownButton";

/**
 * Convenient standalone Select component for canvas and forms.
 */
export interface BitSelectComponentProps {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (val: string) => void;
  options?: Array<{ label: string; value: string }>;
  className?: string;
}

export function BitSelect({
  placeholder = "Theme",
  value,
  defaultValue,
  onValueChange,
  options = [
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
    { label: "System", value: "system" },
  ],
  className,
}: BitSelectComponentProps) {
  return (
    <Select value={value} defaultValue={defaultValue} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
export default BitSelect;

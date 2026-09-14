"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import "./styles/retro.css";

export interface BitSwitchProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  variant?: "default" | "retro" | "destructive" | "cyber";
}

const variantActiveStyles = {
  default: "bg-[#16a34a]",
  retro: "bg-[#d97706]",
  destructive: "bg-[#b91c1c]",
  cyber: "bg-[#06b6d4]",
};

const Switch = React.forwardRef<HTMLButtonElement, BitSwitchProps>(
  (
    {
      className,
      checked,
      defaultChecked = false,
      onCheckedChange,
      variant = "retro",
      disabled = false,
      ...props
    },
    ref
  ) => {
    const isControlled = checked !== undefined;
    const [internalChecked, setInternalChecked] = React.useState<boolean>(defaultChecked);
    const isChecked = isControlled ? checked : internalChecked;

    const handleToggle = () => {
      if (disabled) return;
      const next = !isChecked;
      if (!isControlled) {
        setInternalChecked(next);
      }
      onCheckedChange?.(next);
    };

    const activeBg = variantActiveStyles[variant] || variantActiveStyles.retro;

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={isChecked}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle();
          }
        }}
        className={cn(
          "relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center border-2 border-black transition-colors select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0B1020]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isChecked ? activeBg : "bg-[#252a38]",
          className
        )}
        {...props}
      >
        {/* Thumb */}
        <span
          className={cn(
            "pointer-events-none block size-3.5 bg-white border border-black shadow-[1px_1px_0_0_#000] transition-transform",
            isChecked ? "translate-x-5 bg-[#fef08a]" : "translate-x-0.5 bg-[#94a3b8]"
          )}
        />

        {/* Stepped pixel corner notches */}
        <span
          aria-hidden="true"
          className="absolute inset-0 border-y-2 -my-[2px] border-foreground/60 dark:border-ring/60 pointer-events-none"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 border-x-2 -mx-[2px] border-foreground/60 dark:border-ring/60 pointer-events-none"
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";

export { Switch };
export default Switch;

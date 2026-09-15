import * as React from "react";
import { cn } from "@/lib/utils";
import "./styles/retro.css";

export interface BitCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  font?: "normal" | "retro";
}

export const Checkbox = React.forwardRef<HTMLInputElement, BitCheckboxProps>(
  ({ className, checked = false, onCheckedChange, disabled, font = "retro", id, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState<boolean>(checked);

    React.useEffect(() => {
      setIsChecked(checked);
    }, [checked]);

    const toggle = () => {
      if (disabled) return;
      const next = !isChecked;
      setIsChecked(next);
      onCheckedChange?.(next);
    };

    return (
      <div
        className={cn(
          "relative inline-flex items-center justify-center size-5 shrink-0 select-none cursor-pointer border-y-4 border-foreground dark:border-ring bg-background transition-colors",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        onClick={toggle}
        role="checkbox"
        aria-checked={isChecked}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            toggle();
          }
        }}
      >
        <input
          type="checkbox"
          ref={ref}
          id={id}
          checked={isChecked}
          disabled={disabled}
          onChange={(e) => {
            setIsChecked(e.target.checked);
            onCheckedChange?.(e.target.checked);
          }}
          className="sr-only"
          {...props}
        />

        {/* 8bitcn Stepped Cut-Corner Overlay */}
        <div
          className="absolute inset-0 border-x-4 -mx-1 border-foreground dark:border-ring pointer-events-none"
          aria-hidden="true"
        />

        {/* Checked Pixel Fill Marker */}
        {isChecked && (
          <span className="size-2 bg-foreground dark:bg-ring shadow-[1px_1px_0_0_rgba(0,0,0,0.5)]" />
        )}
      </div>
    );
  }
);

Checkbox.displayName = "8BitCheckbox";
export default Checkbox;

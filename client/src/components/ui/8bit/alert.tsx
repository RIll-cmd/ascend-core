import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

import {
  Alert as ShadcnAlert,
  AlertDescription as ShadcnAlertDescription,
  AlertTitle as ShadcnAlertTitle,
} from "@/components/ui/alert";

export const alertVariants = cva("", {
  variants: {
    font: {
      normal: "",
      retro: "retro",
    },
    variant: {
      default: "bg-card text-card-foreground",
      destructive:
        "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
      success: "bg-[#0d2818]/95 text-[#6ee7b7]",
      warning: "bg-[#291e0a]/95 text-[#fcd34d]",
      dungeon: "bg-[#181d17]/95 text-[#fff8df]",
      cyber: "bg-[#09151c]/95 text-cyan-100",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const VARIANT_ALERT_BORDER_COLORS: Record<string, string> = {
  default: "bg-foreground dark:bg-ring",
  destructive: "bg-destructive",
  success: "bg-[#10b981]",
  warning: "bg-[#f59e0b]",
  dungeon: "bg-[#8c7a53]",
  cyber: "bg-cyan-500 dark:bg-cyan-400",
};

export interface BitAlertProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof alertVariants> {
  borderColorClass?: string;
}

function Alert({
  children,
  className,
  font,
  variant = "default",
  borderColorClass,
  ...props
}: BitAlertProps) {
  const shadcnVariant = variant === "destructive" ? "destructive" : "default";
  const activeBorderColor =
    borderColorClass ||
    (variant && VARIANT_ALERT_BORDER_COLORS[variant]) ||
    "bg-foreground dark:bg-ring";

  return (
    <div className="relative">
      <ShadcnAlert
        {...props}
        variant={shadcnVariant}
        className={cn(
          "relative rounded-none border-none bg-background",
          font !== "normal" && "retro",
          alertVariants({ variant, font }),
          className
        )}
      >
        {children}
      </ShadcnAlert>

      {/* Authentic @8bitcn Stepped Pixel Border */}
      <div className={cn("absolute -top-1.5 w-1/2 left-1.5 h-1.5 pointer-events-none", activeBorderColor)} />
      <div className={cn("absolute -top-1.5 w-1/2 right-1.5 h-1.5 pointer-events-none", activeBorderColor)} />
      <div className={cn("absolute -bottom-1.5 w-1/2 left-1.5 h-1.5 pointer-events-none", activeBorderColor)} />
      <div className={cn("absolute -bottom-1.5 w-1/2 right-1.5 h-1.5 pointer-events-none", activeBorderColor)} />
      <div className={cn("absolute top-0 left-0 size-1.5 pointer-events-none", activeBorderColor)} />
      <div className={cn("absolute top-0 right-0 size-1.5 pointer-events-none", activeBorderColor)} />
      <div className={cn("absolute bottom-0 left-0 size-1.5 pointer-events-none", activeBorderColor)} />
      <div className={cn("absolute bottom-0 right-0 size-1.5 pointer-events-none", activeBorderColor)} />
      <div className={cn("absolute top-1.5 -left-1.5 h-1/2 w-1.5 pointer-events-none", activeBorderColor)} />
      <div className={cn("absolute bottom-1.5 -left-1.5 h-1/2 w-1.5 pointer-events-none", activeBorderColor)} />
      <div className={cn("absolute top-1.5 -right-1.5 h-1/2 w-1.5 pointer-events-none", activeBorderColor)} />
      <div className={cn("absolute bottom-1.5 -right-1.5 h-1/2 w-1.5 pointer-events-none", activeBorderColor)} />
    </div>
  );
}

function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <ShadcnAlertTitle
      className={cn("line-clamp-1 font-medium tracking-tight", className)}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <ShadcnAlertDescription
      className={cn(
        "text-muted-foreground grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
export default Alert;

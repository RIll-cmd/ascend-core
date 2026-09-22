import React, { type ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/8bit/badge";
import { Button } from "@/components/ui/8bit/button";
import "@/components/ui/8bit/styles/retro.css";

export interface HeroBadge {
  label: ReactNode;
  variant?: "default" | "primary" | "secondary" | "destructive" | "success" | "gold" | "outline" | "mythic";
  className?: string;
}

export interface HeroAction {
  href?: string;
  label: ReactNode;
  onClick?: () => void;
  variant?: "default" | "secondary" | "gold" | "destructive" | "success" | "dungeon" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  borderStyle?: "retro-beveled" | "classic";
  className?: string;
}

export interface Hero1Props {
  actions?: HeroAction[];
  badges?: HeroBadge[];
  children?: ReactNode;
  className?: string;
  description?: ReactNode;
  subtitle?: ReactNode;
  title: ReactNode;
  titleClassName?: string;
  descriptionClassName?: string;
  showScanlines?: boolean;
}

export function Hero1({
  title,
  subtitle,
  description,
  actions = [],
  badges = [],
  className,
  children,
  titleClassName,
  descriptionClassName,
  showScanlines = false,
}: Hero1Props) {
  return (
    <div
      className={cn(
        "relative w-full px-4 py-4 md:py-8",
        className
      )}
    >
      {/* Optional Scanline overlay */}
      {showScanlines && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 3px)",
          }}
        />
      )}

      <div className="relative mx-auto max-w-3xl text-center">
        {/* Badges */}
        {badges.length > 0 && (
          <div className="mb-6 flex flex-wrap justify-center gap-4">
            {badges.map((badge, idx) => (
              <Badge key={idx} variant={badge.variant || "default"} className={badge.className}>
                {badge.label}
              </Badge>
            ))}
          </div>
        )}

        {/* Title */}
        <h1
          className={cn(
            "retro mb-6 font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-normal sm:leading-relaxed tracking-wider",
            titleClassName
          )}
        >
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <div className="retro mb-4 text-neutral-400 text-xs md:text-sm tracking-wider">
            {subtitle}
          </div>
        )}

        {/* Description */}
        {description && (
          <div
            className={cn(
              "mx-auto mb-8 max-w-xl text-neutral-400",
              !descriptionClassName?.includes("font-") && "retro text-[9px] sm:text-[10px] md:text-xs leading-loose tracking-wider",
              descriptionClassName
            )}
          >
            {description}
          </div>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-5">
            {actions.map((action, idx) =>
              action.href ? (
                <Button
                  asChild
                  key={idx}
                  variant={action.variant}
                  size={action.size || "lg"}
                  borderStyle={action.borderStyle}
                  className={action.className}
                >
                  <Link href={action.href}>{action.label}</Link>
                </Button>
              ) : (
                <Button
                  key={idx}
                  onClick={action.onClick}
                  variant={action.variant}
                  size={action.size || "lg"}
                  borderStyle={action.borderStyle}
                  className={action.className}
                >
                  {action.label}
                </Button>
              )
            )}
          </div>
        )}

        {/* Optional extra content */}
        {children}
      </div>
    </div>
  );
}

export default Hero1;

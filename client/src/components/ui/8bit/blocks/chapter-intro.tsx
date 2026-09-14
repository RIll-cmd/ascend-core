import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "../card";
import "../styles/retro.css";

export interface ChapterIntroProps extends React.HTMLAttributes<HTMLDivElement> {
  floorNumber?: number;
  title: string;
  subtitle?: string;
  backgroundSrc?: string;
  align?: "left" | "center" | "right";
  height?: "sm" | "md" | "lg";
  darken?: number;
}

export default function ChapterIntro({
  className,
  floorNumber,
  title,
  subtitle,
  backgroundSrc = "/backgrounds/stone_arena_diorama.jpg",
  align = "center",
  height = "md",
  darken = 0.65,
  ...props
}: ChapterIntroProps) {
  const heightClass =
    height === "lg"
      ? "min-h-[320px] md:min-h-[420px]"
      : height === "sm"
        ? "min-h-[160px] md:min-h-[220px]"
        : "min-h-[220px] md:min-h-[300px]";

  const alignClass =
    align === "left"
      ? "justify-start text-left"
      : align === "right"
        ? "justify-end text-right"
        : "justify-center text-center";

  return (
    <Card
      variant="dungeon"
      className={cn("overflow-hidden select-none", className)}
      {...props}
    >
      <CardContent className="relative p-0">
        <div className={cn("relative w-full flex flex-col justify-between", heightClass)}>
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center pixelated opacity-50"
            style={{
              backgroundImage: `url('${backgroundSrc}')`,
            }}
          />

          {/* Darken vignette */}
          <div
            className="absolute inset-0 bg-[#0b1020]/80 mix-blend-multiply"
            style={{ opacity: darken }}
            aria-hidden="true"
          />

          {/* Top Cinematic Letterbox Bar */}
          <div className="relative z-10 w-full h-5 sm:h-7 bg-black/90 border-b border-[#8c7a53]/40 flex items-center justify-between px-4">
            <span className="retro text-[8px] text-[#f6c453] tracking-widest uppercase">
              {floorNumber !== undefined ? `FLOOR ${floorNumber} ARCHIVE` : "ASCEND TOWER"}
            </span>
            <span className="font-mono text-[8px] text-slate-400">
              GATE TELEMETRY
            </span>
          </div>

          {/* Core Cinematic Title Content */}
          <div className={cn("relative z-10 flex h-full items-center p-6 sm:p-10", alignClass)}>
            <div className="max-w-2xl">
              {floorNumber !== undefined && (
                <p className="retro text-xs sm:text-sm text-amber-400 font-bold mb-2 tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  FLOOR {floorNumber}
                </p>
              )}
              <h2 className="retro text-lg sm:text-2xl md:text-3xl font-bold leading-tight text-white drop-shadow-[0_3px_0_rgba(0,0,0,0.9)]">
                {title}
              </h2>
              {subtitle && (
                <p className="font-mono text-xs sm:text-sm text-slate-300 mt-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Bottom Cinematic Letterbox Bar */}
          <div className="relative z-10 w-full h-5 sm:h-7 bg-black/90 border-t border-[#8c7a53]/40 flex items-center justify-center px-4">
            <span className="retro text-[7px] sm:text-[8px] text-slate-400 tracking-widest animate-pulse">
              [ ENTERING COMBAT RADIUS ]
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { ChapterIntro };

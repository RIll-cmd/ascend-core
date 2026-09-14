"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import "../styles/retro.css";

export interface NotFound2Props extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  cta?: string;
  href?: string;
  guardianName?: string;
}

export default function NotFound2({
  title = "THE TUNNEL HAS COLLAPSED!",
  description = "A cave-in blocks the way ahead. The ancient chamber you seek is lost to the dungeon abyss.",
  cta = "RETREAT TO SAFETY",
  href = "/dashboard",
  guardianName = "DUNGEON KEEPER",
  className,
  ...props
}: NotFound2Props) {
  return (
    <div
      className={cn(
        "retro grid w-full place-content-center gap-6 bg-[#0B1020] border-2 border-[#8c7a53] p-8 sm:p-16 text-center shadow-[4px_4px_0_0_#000]",
        className
      )}
      {...props}
    >
      {/* Huge 404 banner */}
      <div className="retro font-bold text-6xl sm:text-8xl text-[#f6c453] tracking-widest drop-shadow-[4px_4px_0_#000]">
        404
      </div>

      {/* Retro Guardian Avatar / Icon */}
      <div className="flex justify-center -mt-2">
        <div className="size-20 sm:size-24 border-2 border-[#8c7a53] bg-[#1a1410] flex flex-col items-center justify-center shadow-[3px_3px_0_0_#000]">
          <span className="retro text-3xl select-none">🧙‍♂️</span>
          <span className="retro text-[7px] text-[#f6c453] font-bold mt-1">
            [{guardianName}]
          </span>
        </div>
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h1 className="retro font-bold text-base sm:text-xl text-white tracking-wide">
          {title}
        </h1>
        <p className="retro text-slate-400 text-[8px] sm:text-[9px] leading-relaxed">
          {description}
        </p>
      </div>

      {/* Action Button */}
      <div className="flex justify-center mt-2">
        <Link
          href={href}
          className="retro px-6 py-2.5 bg-[#f6c453] text-[#0B1020] font-bold text-xs border-2 border-black hover:bg-amber-300 shadow-[2px_2px_0_0_#000] cursor-pointer transition-transform active:translate-x-[1px] active:translate-y-[1px]"
        >
          {cta}
        </Link>
      </div>

      <p className="retro text-[7px] text-slate-600">
        ERROR CODE: DUNGEON_PATH_NOT_FOUND_404
      </p>
    </div>
  );
}

export { NotFound2 };

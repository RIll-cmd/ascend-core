"use client";

import React from "react";
import { Egg as EggIcon, Sparkles } from "lucide-react";
import { Egg } from "@/features/beasts/types/beast";

interface SvgOvergrownNestProps {
  egg: Egg | null;
  ready?: boolean;
  isHatching?: boolean;
  onSelectEggClick?: () => void;
  className?: string;
}

export const SvgOvergrownNest: React.FC<SvgOvergrownNestProps> = ({
  egg,
  ready = false,
  isHatching = false,
  onSelectEggClick,
  className = "",
}) => {
  return (
    <div
      className={`relative w-full max-w-[420px] aspect-[460/280] mx-auto flex items-center justify-center select-none ${className}`}
    >
      {/* ========================================================================= */}
      {/* LAYER 1: BACK SVG (Shadow, Rear Outer Weave, Hollow Cavity, Straw Bedding)*/}
      {/* ========================================================================= */}
      <svg
        viewBox="0 0 460 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        aria-hidden="true"
      >
        <defs>
          {/* Ground Soft Occlusion Shadow */}
          <filter id="nest-ground-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="14" />
          </filter>

          {/* Warm Incubating Radiance */}
          <filter id="nest-warmth-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="16" />
          </filter>

          {/* Wood Color Palettes */}
          <linearGradient id="nest-wood-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2c1408" />
            <stop offset="50%" stopColor="#45220e" />
            <stop offset="100%" stopColor="#1a0a03" />
          </linearGradient>

          <linearGradient id="nest-wood-mid" x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#3d1d0c" />
            <stop offset="45%" stopColor="#633418" />
            <stop offset="80%" stopColor="#7e4320" />
            <stop offset="100%" stopColor="#35170a" />
          </linearGradient>

          <linearGradient id="nest-wood-crest" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#69391a" />
            <stop offset="50%" stopColor="#9e5c30" />
            <stop offset="100%" stopColor="#5a2e13" />
          </linearGradient>

          {/* Deep Hollow Interior Cavity */}
          <radialGradient id="nest-hollow-bowl" cx="50%" cy="38%" r="55%">
            <stop offset="0%" stopColor="#180b05" stopOpacity="0.99" />
            <stop offset="50%" stopColor="#241208" stopOpacity="0.95" />
            <stop offset="80%" stopColor="#381c0d" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#4f2712" stopOpacity="0.2" />
          </radialGradient>

          {/* Golden Straw Bedding Gradients */}
          <linearGradient id="straw-rich-gold" x1="0%" y1="0%" x2="100%" y2="30%">
            <stop offset="0%" stopColor="#784209" />
            <stop offset="30%" stopColor="#b45309" />
            <stop offset="65%" stopColor="#ca8a04" />
            <stop offset="90%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>

          <linearGradient id="straw-fine-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ca8a04" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fef9c3" />
          </linearGradient>

          {/* Earthy Forest Moss Accent */}
          <linearGradient id="nest-moss-cushion" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4d7c0f" />
            <stop offset="60%" stopColor="#365314" />
            <stop offset="100%" stopColor="#142608" />
          </linearGradient>

          {/* Warm Egg Radiance */}
          <radialGradient id="nest-egg-radiance" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#fde047" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ca8a04" stopOpacity="0" />
          </radialGradient>

          {/* Sakura Blossom Petal */}
          <linearGradient id="nest-sakura-petal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#fbcfe8" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
        </defs>

        {/* 1. Ground Surface Ambient Occlusion Soft Shadow */}
        <ellipse cx="230" cy="248" rx="165" ry="24" fill="#120602" opacity="0.65" filter="url(#nest-ground-shadow)" />
        <ellipse cx="230" cy="244" rx="135" ry="15" fill="#1a0803" opacity="0.75" />

        {/* 2. Outer Silhouette Twigs & Fine Straw Sprigs (Organic bushy perimeter, no antler branches) */}
        <g strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Left perimeter subtle twigs */}
          <path d="M 86 160 C 68 156 50 152 35 146" stroke="#3b1e0d" strokeWidth="2.8" />
          <path d="M 74 175 C 56 182 40 195 28 210" stroke="#33190a" strokeWidth="2.4" />
          <path d="M 90 192 C 72 204 56 218 44 232" stroke="#2a1408" strokeWidth="2.2" />
          <path d="M 112 212 C 94 226 78 240 64 252" stroke="#3b1e0d" strokeWidth="2" />
          {/* Left subtle straw ends */}
          <path d="M 68 150 C 52 144 40 138 30 132" stroke="url(#straw-rich-gold)" strokeWidth="1.5" />
          <path d="M 80 168 C 62 172 48 178 38 186" stroke="url(#straw-fine-gold)" strokeWidth="1.4" />

          {/* Right perimeter subtle twigs */}
          <path d="M 374 160 C 392 156 410 152 425 146" stroke="#3b1e0d" strokeWidth="2.8" />
          <path d="M 386 175 C 404 182 420 195 432 210" stroke="#33190a" strokeWidth="2.4" />
          <path d="M 370 192 C 388 204 404 218 416 232" stroke="#2a1408" strokeWidth="2.2" />
          <path d="M 348 212 C 366 226 382 240 396 252" stroke="#3b1e0d" strokeWidth="2" />
          {/* Right subtle straw ends */}
          <path d="M 392 150 C 408 144 420 138 430 132" stroke="url(#straw-rich-gold)" strokeWidth="1.5" />
          <path d="M 380 168 C 398 172 412 178 422 186" stroke="url(#straw-fine-gold)" strokeWidth="1.4" />
        </g>

        {/* 3. Rear Wicker Bowl Body & Back Wall */}
        <path
          d="M 68 152 C 56 212 118 262 230 266 C 342 262 404 212 392 152 C 380 96 322 62 230 62 C 138 62 80 96 68 152 Z"
          fill="url(#nest-wood-shadow)"
          stroke="#160803"
          strokeWidth="3"
        />

        {/* 4. Intricate Woven Back Rim Bundles (Curving naturally behind the hollow) */}
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 82 144 C 110 92 168 68 230 68 C 292 68 350 92 378 144" stroke="url(#nest-wood-shadow)" strokeWidth="7" />
          <path d="M 96 134 C 124 86 174 66 230 66 C 286 66 336 86 364 134" stroke="url(#nest-wood-mid)" strokeWidth="5.5" />
          <path d="M 110 124 C 138 82 182 70 230 70 C 278 70 322 82 350 124" stroke="url(#nest-wood-crest)" strokeWidth="4" />
          <path d="M 126 116 C 154 78 190 74 230 74 C 270 74 306 78 334 116" stroke="#874722" strokeWidth="3" />
          {/* Subtle warm rim crest highlight */}
          <path d="M 152 98 C 178 82 204 78 230 78 C 256 78 282 82 308 98" stroke="#be7a44" strokeWidth="2" opacity="0.85" />
        </g>

        {/* 5. Deep Hollow Nest Cavity Interior */}
        <ellipse cx="230" cy="154" rx="140" ry="66" fill="#180b05" />
        <ellipse cx="230" cy="155" rx="134" ry="60" fill="url(#nest-hollow-bowl)" />

        {/* 6. Soft Downy Moss Lining the Bedding Crevices */}
        <g fill="url(#nest-moss-cushion)" opacity="0.75">
          <path d="M 130 162 C 145 152 168 154 182 160 C 176 172 158 174 144 172 C 136 170 132 166 130 162 Z" />
          <path d="M 330 162 C 315 152 292 154 278 160 C 284 172 302 174 316 172 C 324 170 328 166 330 162 Z" />
        </g>

        {/* 7. Abundant Golden Straw Bedding Strands (Warm, plush mattress) */}
        <g fill="none" strokeLinecap="round">
          {/* Sweeping concentric straw nests */}
          <path d="M 120 156 C 158 184 200 190 230 190 C 260 190 302 184 340 156" stroke="url(#straw-rich-gold)" strokeWidth="3" opacity="0.95" />
          <path d="M 135 148 C 170 176 205 182 230 182 C 255 182 290 176 325 148" stroke="url(#straw-rich-gold)" strokeWidth="2.4" opacity="0.9" />
          <path d="M 152 142 C 182 168 208 174 230 174 C 252 174 278 168 308 142" stroke="url(#straw-fine-gold)" strokeWidth="2" opacity="0.9" />
          <path d="M 172 136 Q 230 162 288 136" stroke="url(#straw-fine-gold)" strokeWidth="1.8" opacity="0.85" />
          {/* Delicate straw loops and curls in bedding */}
          <path d="M 144 160 C 154 172 170 170 178 158" stroke="url(#straw-fine-gold)" strokeWidth="1.5" />
          <path d="M 282 158 C 290 170 306 172 316 160" stroke="url(#straw-fine-gold)" strokeWidth="1.5" />
          <path d="M 205 174 C 218 184 242 184 255 174" stroke="url(#straw-fine-gold)" strokeWidth="1.6" />
        </g>

        {/* 8. Soft Radiant Roost Warmth Glow when Egg is Present */}
        <ellipse
          cx="230"
          cy="150"
          rx={ready ? "120" : egg ? "100" : "55"}
          ry={ready ? "70" : egg ? "58" : "32"}
          fill="url(#nest-egg-radiance)"
          filter="url(#nest-warmth-glow)"
          className={ready ? "animate-pulse" : ""}
        />

        {/* 9. Soft Sakura Blossom on Back Left Rim */}
        <g transform="translate(114, 114) rotate(-16) scale(0.9)">
          <path d="M 0 -13 C 3 -20 12 -20 14 -11 C 12 -3 0 0 0 0 Z" fill="url(#nest-sakura-petal-grad)" />
          <path d="M 13 -3 C 20 -3 20 8 11 11 C 3 11 0 0 0 0 Z" fill="url(#nest-sakura-petal-grad)" />
          <path d="M 7 11 C 3 20 -8 18 -9 11 C -5 3 0 0 0 0 Z" fill="url(#nest-sakura-petal-grad)" />
          <path d="M -11 7 C -20 3 -18 -8 -9 -11 C -2 -5 0 0 0 0 Z" fill="url(#nest-sakura-petal-grad)" />
          <path d="M -7 -11 C -7 -20 3 -20 7 -11 C 3 -3 0 0 0 0 Z" fill="url(#nest-sakura-petal-grad)" />
          <circle cx="0" cy="0" r="2.2" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.7" />
        </g>
      </svg>

      {/* ========================================================================= */}
      {/* LAYER 2: EGG MOUNT (Snugly nested inside the straw/moss bed)              */}
      {/* ========================================================================= */}
      <div className="absolute left-[50%] top-[43%] -translate-x-1/2 -translate-y-1/2 z-[5] flex items-center justify-center pointer-events-auto">
        {egg ? (
          <div className="relative group flex items-center justify-center">
            {/* Egg base contact shadow resting on bedding */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-28 h-8 bg-[#0a0301]/90 rounded-full blur-[3px] pointer-events-none" />

            <img
              src={egg.sprite || "/eggs/egg_1.png"}
              alt={egg.name}
              width={154}
              height={154}
              className={`w-32 h-32 sm:w-36 sm:h-36 object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.6)] transition-transform duration-300 select-none ${
                isHatching
                  ? "animate-bounce scale-110"
                  : ready
                  ? "animate-[wiggle_1.6s_ease-in-out_infinite] scale-105 cursor-pointer"
                  : "hover:scale-105"
              }`}
              style={{ imageRendering: "pixelated" }}
            />

            {/* Ready to hatch glowing aura badge */}
            {ready && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 items-center justify-center shadow-md border border-emerald-300">
                  <Sparkles className="w-3 h-3 text-white" />
                </span>
              </span>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onSelectEggClick}
            className="group flex flex-col items-center justify-center p-3 rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            title="Place an egg in the overgrown nest"
            aria-label="Empty overgrown nest hollow. Click to visit the nursery stall."
          >
            <div className="w-16 h-20 sm:w-18 sm:h-22 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] border-2 border-dashed border-[#c5a666] group-hover:border-emerald-500 bg-amber-950/40 group-hover:bg-emerald-900/40 flex flex-col items-center justify-center transition-colors shadow-inner backdrop-blur-[1px]">
              <EggIcon className="w-8 h-8 text-[#e3cf9e] group-hover:text-emerald-400 transition-colors drop-shadow" />
              <span className="text-[10px] font-pixel text-[#f5ebd7] group-hover:text-emerald-300 tracking-wider uppercase mt-1">
                Roost
              </span>
            </div>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* LAYER 3: FOREGROUND SVG (Front Rim, Braided Boughs, Straw Weaves & Sakura)*/}
      {/* ========================================================================= */}
      <svg
        viewBox="0 0 460 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        aria-hidden="true"
      >
        <defs>
          {/* Foreground Boughs Gradients */}
          <linearGradient id="fore-branch-dark" x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#3d1d0c" />
            <stop offset="25%" stopColor="#6e3919" />
            <stop offset="60%" stopColor="#965227" />
            <stop offset="85%" stopColor="#783f1d" />
            <stop offset="100%" stopColor="#45220e" />
          </linearGradient>

          <linearGradient id="fore-branch-light" x1="100%" y1="0%" x2="0%" y2="50%">
            <stop offset="0%" stopColor="#331709" />
            <stop offset="35%" stopColor="#633417" />
            <stop offset="70%" stopColor="#8c4c23" />
            <stop offset="90%" stopColor="#633417" />
            <stop offset="100%" stopColor="#331709" />
          </linearGradient>

          <linearGradient id="fore-rim-sun" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#96562b" />
            <stop offset="35%" stopColor="#d99153" />
            <stop offset="55%" stopColor="#f7c38a" />
            <stop offset="75%" stopColor="#d78d4e" />
            <stop offset="100%" stopColor="#85451e" />
          </linearGradient>

          {/* Golden Meadow Straw Gradients */}
          <linearGradient id="fore-straw-thick" x1="0%" y1="0%" x2="100%" y2="30%">
            <stop offset="0%" stopColor="#a16207" />
            <stop offset="30%" stopColor="#ca8a04" />
            <stop offset="65%" stopColor="#eab308" />
            <stop offset="88%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>

          <linearGradient id="fore-straw-fine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fef9c3" />
          </linearGradient>

          {/* Foreground Ivy Foliage */}
          <linearGradient id="fore-ivy-leaf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#86efac" />
            <stop offset="35%" stopColor="#22c55e" />
            <stop offset="75%" stopColor="#15803d" />
            <stop offset="100%" stopColor="#052e16" />
          </linearGradient>

          {/* Foreground Sakura Blossoms */}
          <linearGradient id="fore-sakura-bloom-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#ffe4e6" />
            <stop offset="80%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#be123c" />
          </linearGradient>
        </defs>

        {/* 1. Main Front Wicker Shell Body (Rounded lower bowl curvature) */}
        <path
          d="M 68 165 C 78 225 134 270 230 274 C 326 270 382 225 392 165 C 356 200 296 220 230 220 C 164 220 104 200 68 165 Z"
          fill="url(#fore-branch-dark)"
          stroke="#1a0b04"
          strokeWidth="2.8"
        />

        {/* 2. Heavy Interlocking Boughs across the Front Rim (Tactile, thick basket weave) */}
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Main Branch 1: Sweeps low left to high right */}
          <path
            d="M 72 180 C 136 242 220 246 305 230 C 346 222 376 198 386 174"
            stroke="url(#fore-branch-dark)"
            strokeWidth="8.5"
          />

          {/* Main Branch 2: Interlacing reverse curve */}
          <path
            d="M 80 198 C 168 258 275 250 342 226 C 372 210 388 186 384 168"
            stroke="url(#fore-branch-light)"
            strokeWidth="7.5"
          />

          {/* Front Rim Crest Branch: Snugly cradles the lower egg border */}
          <path
            d="M 86 172 C 148 218 224 220 302 214 C 344 208 372 190 382 166"
            stroke="url(#fore-branch-dark)"
            strokeWidth="6.5"
          />

          {/* Cross-weave stabilizing twigs */}
          <path d="M 112 220 C 178 256 252 242 322 246 C 352 248 372 232 378 212" stroke="#48220d" strokeWidth="6" />
          <path d="M 102 188 C 158 232 242 226 328 224 C 358 218 374 204 380 182" stroke="#683515" strokeWidth="5" />
          <path d="M 135 240 C 198 260 262 256 322 238" stroke="#381909" strokeWidth="5.5" />

          {/* Secondary wicker strands */}
          <path d="M 94 176 C 146 212 208 216 270 214 C 310 210 345 196 368 176" stroke="#7e411c" strokeWidth="3.8" />
          <path d="M 122 210 C 174 238 235 236 292 230 C 330 222 358 210 372 192" stroke="#5c2c12" strokeWidth="3.8" />
          <path d="M 152 238 C 205 256 262 254 315 242" stroke="#753a1a" strokeWidth="3.2" />
        </g>

        {/* 3. Sunlit Rim Highlights (Golden hour illumination along top edges) */}
        <g fill="none" stroke="url(#fore-rim-sun)" strokeLinecap="round" opacity="0.9">
          <path d="M 98 174 C 152 214 220 216 295 210 C 332 204 360 188 374 168" strokeWidth="2.6" />
          <path d="M 92 184 C 150 236 225 240 300 230" strokeWidth="2.2" />
          <path d="M 122 226 C 182 252 252 246 318 232" strokeWidth="1.8" />
        </g>

        {/* 4. Rich Golden Straw & Meadow Hay Weaves */}
        <g fill="none" strokeLinecap="round">
          {/* Main golden bands */}
          <path
            d="M 90 176 C 150 218 220 218 290 212 C 335 206 365 188 376 170"
            stroke="url(#fore-straw-thick)"
            strokeWidth="3.2"
            opacity="0.95"
          />
          <path
            d="M 104 194 C 168 236 240 234 312 222 C 342 212 365 194 374 178"
            stroke="url(#fore-straw-thick)"
            strokeWidth="2.6"
            opacity="0.9"
          />
          <path
            d="M 118 214 C 182 252 255 248 322 232 C 348 220 365 204 370 190"
            stroke="url(#fore-straw-fine)"
            strokeWidth="2.2"
            opacity="0.9"
          />
          <path
            d="M 142 238 C 202 258 265 254 318 240"
            stroke="url(#fore-straw-fine)"
            strokeWidth="2"
            opacity="0.85"
          />

          {/* Natural loose hay strands dangling over front rim */}
          <path d="M 96 182 C 82 176 68 172 60 180" stroke="url(#fore-straw-fine)" strokeWidth="1.8" />
          <path d="M 120 206 C 108 216 94 226 85 238" stroke="url(#fore-straw-fine)" strokeWidth="1.6" />
          <path d="M 165 240 C 158 256 150 268 142 278" stroke="url(#fore-straw-fine)" strokeWidth="1.6" />
          <path d="M 218 250 C 220 264 218 276 215 284" stroke="url(#fore-straw-fine)" strokeWidth="1.5" />
          <path d="M 270 248 C 280 262 290 274 300 282" stroke="url(#fore-straw-fine)" strokeWidth="1.6" />
          <path d="M 325 228 C 342 238 355 250 364 260" stroke="url(#fore-straw-fine)" strokeWidth="1.6" />
          <path d="M 368 182 C 385 176 398 172 406 180" stroke="url(#fore-straw-fine)" strokeWidth="1.8" />
        </g>

        {/* 5. Natural Ivy Vines Draping over the Front Lower Edges */}
        {/* Left Ivy Vine */}
        <g>
          <path d="M 106 198 C 94 210 84 226 78 242" stroke="#15803d" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {/* Leaf 1 */}
          <path
            d="M 84 218 C 70 214 66 198 78 190 C 90 198 92 210 84 218 Z"
            fill="url(#fore-ivy-leaf-grad)"
            stroke="#052e16"
            strokeWidth="1.1"
          />
          <path d="M 83 214 Q 79 202 78 192" stroke="#86efac" strokeWidth="0.8" fill="none" />
          {/* Leaf 2 */}
          <path
            d="M 96 232 C 88 246 74 252 66 244 C 70 232 84 226 96 232 Z"
            fill="url(#fore-ivy-leaf-grad)"
            stroke="#052e16"
            strokeWidth="1.1"
          />
          {/* Leaf 3 */}
          <path
            d="M 110 224 C 102 238 108 252 118 248 C 122 238 118 226 110 224 Z"
            fill="url(#fore-ivy-leaf-grad)"
            stroke="#052e16"
            strokeWidth="1.1"
          />
        </g>

        {/* Center Fresh Sprout / Clover Accent */}
        <g>
          <path d="M 196 248 C 184 252 180 266 190 272 C 200 266 202 254 196 248 Z" fill="url(#fore-ivy-leaf-grad)" stroke="#052e16" strokeWidth="0.9" />
          <path d="M 208 252 C 215 262 210 276 198 276 C 196 266 202 256 208 252 Z" fill="url(#fore-ivy-leaf-grad)" stroke="#052e16" strokeWidth="0.9" />
        </g>

        {/* Right Ivy Vine */}
        <g>
          <path d="M 350 198 C 362 210 370 226 374 242" stroke="#15803d" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          {/* Leaf 1 */}
          <path
            d="M 372 218 C 386 214 390 198 378 190 C 366 198 364 210 372 218 Z"
            fill="url(#fore-ivy-leaf-grad)"
            stroke="#052e16"
            strokeWidth="1.1"
          />
          <path d="M 373 214 Q 377 202 378 192" stroke="#86efac" strokeWidth="0.8" fill="none" />
          {/* Leaf 2 */}
          <path
            d="M 360 232 C 368 246 382 252 390 244 C 386 232 372 226 360 232 Z"
            fill="url(#fore-ivy-leaf-grad)"
            stroke="#052e16"
            strokeWidth="1.1"
          />
          {/* Leaf 3 */}
          <path
            d="M 346 224 C 354 238 348 252 338 248 C 334 238 338 226 346 224 Z"
            fill="url(#fore-ivy-leaf-grad)"
            stroke="#052e16"
            strokeWidth="1.1"
          />
        </g>

        {/* 6. Handcrafted Sakura Blossoms Nestled into the Rim */}
        {/* Blossom A: Left Rim Cherry Blossom */}
        <g transform="translate(130, 200) rotate(12) scale(1.05)">
          <path d="M 0 0 C -4 -8 -7 -14 0 -18 C 7 -14 4 -8 0 0 Z" fill="url(#fore-sakura-bloom-grad)" stroke="#be123c" strokeWidth="0.7" />
          <path d="M 0 0 C 5 -7 13 -9 16 -2 C 12 5 6 4 0 0 Z" fill="url(#fore-sakura-bloom-grad)" stroke="#be123c" strokeWidth="0.7" />
          <path d="M 0 0 C 7 3 13 10 7 16 C 1 13 2 6 0 0 Z" fill="url(#fore-sakura-bloom-grad)" stroke="#be123c" strokeWidth="0.7" />
          <path d="M 0 0 C -3 7 -9 14 -14 9 C -13 2 -5 2 0 0 Z" fill="url(#fore-sakura-bloom-grad)" stroke="#be123c" strokeWidth="0.7" />
          <path d="M 0 0 C -7 1 -16 -3 -12 -12 C -5 -11 -2 -4 0 0 Z" fill="url(#fore-sakura-bloom-grad)" stroke="#be123c" strokeWidth="0.7" />
          <circle cx="0" cy="0" r="2.6" fill="#fde047" stroke="#d97706" strokeWidth="0.7" />
          <circle cx="0" cy="0" r="1" fill="#be123c" />
        </g>

        {/* Blossom B: Right Lower Rim Blossom */}
        <g transform="translate(328, 220) rotate(-20) scale(0.92)">
          <path d="M 0 0 C -4 -8 -7 -14 0 -18 C 7 -14 4 -8 0 0 Z" fill="url(#fore-sakura-bloom-grad)" stroke="#be123c" strokeWidth="0.65" />
          <path d="M 0 0 C 5 -7 13 -9 16 -2 C 12 5 6 4 0 0 Z" fill="url(#fore-sakura-bloom-grad)" stroke="#be123c" strokeWidth="0.65" />
          <path d="M 0 0 C 7 3 13 10 7 16 C 1 13 2 6 0 0 Z" fill="url(#fore-sakura-bloom-grad)" stroke="#be123c" strokeWidth="0.65" />
          <path d="M 0 0 C -3 7 -9 14 -14 9 C -13 2 -5 2 0 0 Z" fill="url(#fore-sakura-bloom-grad)" stroke="#be123c" strokeWidth="0.65" />
          <path d="M 0 0 C -7 1 -16 -3 -12 -12 C -5 -11 -2 -4 0 0 Z" fill="url(#fore-sakura-bloom-grad)" stroke="#be123c" strokeWidth="0.65" />
          <circle cx="0" cy="0" r="2.4" fill="#fde047" stroke="#d97706" strokeWidth="0.65" />
          <circle cx="0" cy="0" r="0.9" fill="#be123c" />
        </g>

        {/* Blossom C: Scattered Fallen Sakura Petals in the Front Straw */}
        <g fill="url(#fore-sakura-bloom-grad)" stroke="#be123c" strokeWidth="0.55">
          <path d="M 205 220 C 196 214 194 204 202 198 C 210 202 212 214 205 220 Z" opacity="0.95" />
          <path d="M 256 226 C 265 220 274 224 275 232 C 268 238 259 234 256 226 Z" opacity="0.95" />
          <path d="M 378 190 C 385 184 392 188 394 196 C 386 200 380 196 378 190 Z" opacity="0.9" />
        </g>

        {/* 7. Morning Dewdrop Sparkles */}
        <g fill="#ffffff" opacity="0.9">
          <circle cx="80" cy="196" r="1.4" />
          <circle cx="376" cy="196" r="1.4" />
          <circle cx="116" cy="228" r="1.1" />
          <circle cx="342" cy="228" r="1.1" />
        </g>
      </svg>
    </div>
  );
};

export default SvgOvergrownNest;

"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SteampunkCog } from "./SteampunkGearTrain";

/**
 * 16-Bit Pixel Cross Sparkle Star for Celestial Observatory
 */
function ObservatoryStar({
  x,
  y,
  size = 1,
  delay = 0,
  duration = 3,
  color = "#FFFFFF",
}: {
  x: number;
  y: number;
  size?: number;
  delay?: number;
  duration?: number;
  color?: string;
}) {
  return (
    <div
      className="absolute select-none pointer-events-none chrono-animated"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) scale(${size})`,
        animation: `star-twinkle ${duration}s steps(4, end) infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 11 11"
        fill="none"
        style={{ imageRendering: "pixelated" }}
      >
        <rect x="4" y="4" width="3" height="3" fill={color} />
        <rect x="4" y="1" width="3" height="3" fill={color} fillOpacity="0.85" />
        <rect x="4" y="7" width="3" height="3" fill={color} fillOpacity="0.85" />
        <rect x="1" y="4" width="3" height="3" fill={color} fillOpacity="0.85" />
        <rect x="7" y="4" width="3" height="3" fill={color} fillOpacity="0.85" />
        <rect x="5" y="0" width="1" height="1" fill={color} fillOpacity="0.7" />
        <rect x="5" y="10" width="1" height="1" fill={color} fillOpacity="0.7" />
        <rect x="0" y="5" width="1" height="1" fill={color} fillOpacity="0.7" />
        <rect x="10" y="5" width="1" height="1" fill={color} fillOpacity="0.7" />
      </svg>
    </div>
  );
}

/**
 * Living 16-Bit Retro Pixel Art Clockwork Sanctuary Backdrop
 * Animated layers:
 * 1. Synchronized rotating brass & copper gear trains flanking the clock face and in the archway towers
 * 2. Sweeping astronomical clock hands & solar/lunar reticle
 * 3. Celestial observatory window with twinkling stars, cosmic nebula pulse, and periodic chrono-meteor
 * 4. Ambient rising steam plumes from boiler exhaust pipes
 * 5. Flickering warm gaslight wall lanterns & glowing vacuum tube filaments
 * 6. Floating golden brass chronometer motes
 * 7. 100% GPU-accelerated transforms, zero layout shifts, pointer-events-none
 */
export function SteampunkBackground({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [meteorTrigger, setMeteorTrigger] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Periodic Chrono-Meteor across the upper observatory window
  useEffect(() => {
    if (!mounted) return;

    let timeoutId: NodeJS.Timeout;
    const triggerMeteor = () => {
      const delay = 6500 + Math.random() * 4500;
      timeoutId = setTimeout(() => {
        setMeteorTrigger((prev) => prev + 1);
        triggerMeteor();
      }, delay);
    };

    triggerMeteor();
    return () => clearTimeout(timeoutId);
  }, [mounted]);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#0a0402]",
        className
      )}
    >
      <style>{`
        @keyframes chrono-gear-cw {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes chrono-gear-ccw {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(-360deg); }
        }
        @keyframes lantern-flicker-left {
          0%, 100% { opacity: 0.82; transform: translate(-50%, -50%) scale(1); filter: drop-shadow(0 0 18px rgba(245, 158, 11, 0.5)); }
          22% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); filter: drop-shadow(0 0 28px rgba(251, 191, 36, 0.8)); }
          48% { opacity: 0.72; transform: translate(-50%, -50%) scale(0.96); filter: drop-shadow(0 0 14px rgba(217, 119, 6, 0.4)); }
          76% { opacity: 0.94; transform: translate(-50%, -50%) scale(1.04); filter: drop-shadow(0 0 24px rgba(245, 158, 11, 0.7)); }
        }
        @keyframes lantern-flicker-right {
          0%, 100% { opacity: 0.88; transform: translate(-50%, -50%) scale(1.02); filter: drop-shadow(0 0 22px rgba(245, 158, 11, 0.6)); }
          32% { opacity: 0.74; transform: translate(-50%, -50%) scale(0.95); filter: drop-shadow(0 0 14px rgba(217, 119, 6, 0.4)); }
          60% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); filter: drop-shadow(0 0 30px rgba(251, 191, 36, 0.85)); }
          84% { opacity: 0.84; transform: translate(-50%, -50%) scale(0.98); filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.55)); }
        }
        @keyframes vacuum-filament-pulse {
          0%, 100% { opacity: 0.75; filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.5)); transform: translate(-50%, -50%) scale(0.98); }
          50% { opacity: 1; filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.9)); transform: translate(-50%, -50%) scale(1.03); }
        }
        @keyframes steam-plume-rise {
          0% {
            opacity: 0;
            transform: translate(-50%, 0) scale(0.6);
          }
          15% {
            opacity: 0.65;
          }
          65% {
            opacity: 0.35;
            transform: translate(-50%, -48px) scale(1.4);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -85px) scale(2.0);
          }
        }
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.25; transform: translate(-50%, -50%) scale(0.85); }
          30% { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
          70% { opacity: 0.45; transform: translate(-50%, -50%) scale(0.95); }
        }
        @keyframes chrono-meteor-path {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0.6);
          }
          18% {
            opacity: 1;
          }
          85% {
            opacity: 0.85;
          }
          100% {
            opacity: 0;
            transform: translate(-160px, 95px) scale(1.1);
          }
        }
        @keyframes chrono-mote-float {
          0% {
            opacity: 0;
            transform: translateY(100vh) translateX(0) scale(0.6);
          }
          15% {
            opacity: 0.8;
          }
          85% {
            opacity: 0.5;
          }
          100% {
            opacity: 0;
            transform: translateY(-20px) translateX(35px) scale(1.2);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .chrono-animated {
            animation: none !important;
          }
        }
      `}</style>

      {/* ========================================================= */}
      {/* 1. MASTER 16-BIT PIXEL SANCTUARY ARTWORK                  */}
      {/* ========================================================= */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
        style={{
          backgroundImage: "url('/backgrounds/clockwork_sanctuary_pixel.jpg')",
          imageRendering: "pixelated",
          filter: "brightness(0.92) contrast(1.18) saturate(1.15)",
        }}
      />

      {/* ========================================================= */}
      {/* 2. CELESTIAL OBSERVATORY WINDOW (Stars & Nebula Drift)     */}
      {/* ========================================================= */}
      {mounted && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[36%] h-[34%] pointer-events-none overflow-hidden z-[2]">
          {/* Deep Space Nebula Breath Glow */}
          <div
            className="absolute inset-0 opacity-45 mix-blend-screen chrono-animated animate-pulse"
            style={{
              background:
                "radial-gradient(circle at 50% 55%, rgba(56, 189, 248, 0.4) 0%, rgba(129, 140, 248, 0.25) 45%, transparent 75%)",
              animationDuration: "5.5s",
            }}
          />

          {/* Twinkling 16-Bit Stars */}
          <ObservatoryStar x={42} y={30} size={1.2} delay={0.2} duration={2.6} color="#FFFFFF" />
          <ObservatoryStar x={58} y={26} size={1.0} delay={1.1} duration={3.2} color="#BAE6FD" />
          <ObservatoryStar x={50} y={42} size={1.3} delay={2.0} duration={2.4} color="#FEF08A" />
          <ObservatoryStar x={34} y={50} size={0.9} delay={0.7} duration={3.6} color="#FFFFFF" />
          <ObservatoryStar x={66} y={48} size={1.1} delay={1.8} duration={3.0} color="#E0F2FE" />
          <ObservatoryStar x={48} y={18} size={1.0} delay={2.4} duration={3.4} color="#FDE047" />
          <ObservatoryStar x={53} y={60} size={0.9} delay={1.4} duration={2.8} color="#FFFFFF" />
          <ObservatoryStar x={38} y={66} size={0.8} delay={0.5} duration={4.0} color="#BAE6FD" />
          <ObservatoryStar x={62} y={66} size={0.8} delay={2.2} duration={3.1} color="#FFFFFF" />
          <ObservatoryStar x={45} y={54} size={0.9} delay={1.6} duration={2.7} color="#FEF08A" />

          {/* Periodic Chrono-Meteor Streak */}
          <div
            key={meteorTrigger}
            className="absolute top-[10%] right-[12%] w-20 h-[2.5px] pointer-events-none opacity-0 chrono-animated"
            style={{
              background: "linear-gradient(90deg, rgba(254, 240, 138, 1), rgba(56, 189, 248, 0.7), transparent)",
              transformOrigin: "right center",
              rotate: "30deg",
              animation: "chrono-meteor-path 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              filter: "drop-shadow(0 0 4px #fef08a)",
            }}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. SYNCHRONIZED ROTATING CLOCKWORK GEAR TRAINS            */}
      {/* ========================================================= */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none z-[3]">
          {/* --- LEFT ARCHWAY MACHINERY TOWER COGS (Prominently visible on side) --- */}
          <div
            className="absolute pointer-events-none opacity-75 chrono-animated drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]"
            style={{
              left: "7.5%",
              top: "34%",
              width: "120px",
              height: "120px",
              animation: "chrono-gear-ccw 20s linear infinite",
            }}
          >
            <SteampunkCog size={120} teeth={16} variant="brass" />
          </div>

          <div
            className="absolute pointer-events-none opacity-80 chrono-animated drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)]"
            style={{
              left: "12.5%",
              top: "47%",
              width: "82px",
              height: "82px",
              animation: "chrono-gear-cw 13s linear infinite",
            }}
          >
            <SteampunkCog size={82} teeth={12} variant="copper" />
          </div>

          <div
            className="absolute pointer-events-none opacity-75 chrono-animated drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)]"
            style={{
              left: "6.5%",
              top: "60%",
              width: "92px",
              height: "92px",
              animation: "chrono-gear-ccw 16s linear infinite",
            }}
          >
            <SteampunkCog size={92} teeth={12} variant="iron" />
          </div>

          {/* --- RIGHT ARCHWAY MACHINERY TOWER COGS (Prominently visible on side) --- */}
          <div
            className="absolute pointer-events-none opacity-75 chrono-animated drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]"
            style={{
              left: "92.5%",
              top: "34%",
              width: "120px",
              height: "120px",
              animation: "chrono-gear-cw 20s linear infinite",
            }}
          >
            <SteampunkCog size={120} teeth={16} variant="gold" />
          </div>

          <div
            className="absolute pointer-events-none opacity-80 chrono-animated drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)]"
            style={{
              left: "87.5%",
              top: "47%",
              width: "82px",
              height: "82px",
              animation: "chrono-gear-ccw 13s linear infinite",
            }}
          >
            <SteampunkCog size={82} teeth={12} variant="brass" />
          </div>

          <div
            className="absolute pointer-events-none opacity-75 chrono-animated drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)]"
            style={{
              left: "93.5%",
              top: "60%",
              width: "92px",
              height: "92px",
              animation: "chrono-gear-cw 16s linear infinite",
            }}
          >
            <SteampunkCog size={92} teeth={12} variant="copper" />
          </div>

          {/* --- CENTRAL MAIN DRIVING COGS (Flanking the astronomical clock) --- */}
          <div
            className="absolute pointer-events-none opacity-60 mix-blend-screen chrono-animated"
            style={{
              left: "38.2%",
              top: "42.0%",
              width: "110px",
              height: "110px",
              animation: "chrono-gear-ccw 24s linear infinite",
            }}
          >
            <SteampunkCog size={110} teeth={16} variant="brass" />
          </div>

          <div
            className="absolute pointer-events-none opacity-60 mix-blend-screen chrono-animated"
            style={{
              left: "62.8%",
              top: "42.0%",
              width: "110px",
              height: "110px",
              animation: "chrono-gear-cw 24s linear infinite",
            }}
          >
            <SteampunkCog size={110} teeth={16} variant="gold" />
          </div>

          {/* --- CENTRAL ASTRONOMICAL CLOCK HANDS & LUNAR RETICLE --- */}
          <div
            className="absolute pointer-events-none opacity-70 mix-blend-screen chrono-animated"
            style={{
              left: "50%",
              top: "56.5%",
              width: "190px",
              height: "190px",
              animation: "chrono-gear-cw 60s linear infinite",
            }}
          >
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              style={{ imageRendering: "pixelated" }}
            >
              {/* Slender Astrolabe Pointer Hand */}
              <line x1="50" y1="50" x2="50" y2="10" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
              <circle cx="50" cy="10" r="3.5" fill="#f59e0b" stroke="#fef08a" strokeWidth="1" />
              {/* Counter-Weight Diamond */}
              <polygon points="50,58 54,69 50,78 46,69" fill="#ca8a04" stroke="#fef08a" strokeWidth="1" />
              <circle cx="50" cy="50" r="5" fill="#fbbf24" stroke="#78350f" strokeWidth="1.2" />
            </svg>
          </div>

          {/* Counter-Rotating Celestial Lunar Ring */}
          <div
            className="absolute pointer-events-none opacity-50 mix-blend-screen chrono-animated"
            style={{
              left: "50%",
              top: "56.5%",
              width: "240px",
              height: "240px",
              animation: "chrono-gear-ccw 120s linear infinite",
            }}
          >
            <svg
              viewBox="0 0 120 120"
              className="w-full h-full"
              style={{ imageRendering: "pixelated" }}
            >
              <circle cx="60" cy="60" r="54" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="5 7" fill="none" opacity="0.85" />
              <circle cx="60" cy="6" r="3" fill="#fde047" stroke="#78350f" strokeWidth="0.8" />
              <circle cx="60" cy="114" r="3" fill="#fde047" stroke="#78350f" strokeWidth="0.8" />
            </svg>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. AMBIENT STEAM VENT PLUMES & BOILER EXHAUST             */}
      {/* ========================================================= */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none z-[4]">
          {/* Left Boiler Pipe Plumes */}
          <div
            className="absolute w-10 h-10 rounded-full bg-amber-100/45 blur-[4px] pointer-events-none chrono-animated"
            style={{
              left: "26.6%",
              top: "45.8%",
              animation: "steam-plume-rise 2.8s cubic-bezier(0.2, 0.8, 0.4, 1) infinite",
            }}
          />
          <div
            className="absolute w-8 h-8 rounded-full bg-amber-200/40 blur-[3px] pointer-events-none chrono-animated"
            style={{
              left: "25.8%",
              top: "46.2%",
              animation: "steam-plume-rise 3.0s cubic-bezier(0.2, 0.8, 0.4, 1) infinite",
              animationDelay: "1.4s",
            }}
          />

          {/* Right Boiler Pipe Plumes */}
          <div
            className="absolute w-10 h-10 rounded-full bg-amber-100/45 blur-[4px] pointer-events-none chrono-animated"
            style={{
              left: "73.4%",
              top: "45.8%",
              animation: "steam-plume-rise 2.9s cubic-bezier(0.2, 0.8, 0.4, 1) infinite",
              animationDelay: "0.7s",
            }}
          />
          <div
            className="absolute w-8 h-8 rounded-full bg-amber-200/40 blur-[3px] pointer-events-none chrono-animated"
            style={{
              left: "74.2%",
              top: "46.2%",
              animation: "steam-plume-rise 3.1s cubic-bezier(0.2, 0.8, 0.4, 1) infinite",
              animationDelay: "2.1s",
            }}
          />

          {/* Lower Stairway Wisps */}
          <div
            className="absolute w-12 h-12 rounded-full bg-amber-100/25 blur-[6px] pointer-events-none chrono-animated"
            style={{
              left: "17%",
              top: "68%",
              animation: "steam-plume-rise 3.8s ease-out infinite",
              animationDelay: "0.5s",
            }}
          />
          <div
            className="absolute w-12 h-12 rounded-full bg-amber-100/25 blur-[6px] pointer-events-none chrono-animated"
            style={{
              left: "83%",
              top: "68%",
              animation: "steam-plume-rise 4.0s ease-out infinite",
              animationDelay: "1.8s",
            }}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. LIVING GASLIGHT LANTERNS & VACUUM TUBE GLOWS           */}
      {/* ========================================================= */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none z-[5]">
          {/* Left Hanging Iron Wall Lantern Flicker (Vibrant Warm Gaslight) */}
          <div
            className="absolute w-36 h-44 rounded-full bg-gradient-radial from-amber-300/70 via-yellow-600/30 to-transparent blur-xl mix-blend-screen chrono-animated"
            style={{
              left: "6.8%",
              top: "47.5%",
              animation: "lantern-flicker-left 2.6s ease-in-out infinite",
            }}
          />

          {/* Right Hanging Iron Wall Lantern Flicker */}
          <div
            className="absolute w-36 h-44 rounded-full bg-gradient-radial from-amber-300/70 via-yellow-600/30 to-transparent blur-xl mix-blend-screen chrono-animated"
            style={{
              left: "93.2%",
              top: "47.5%",
              animation: "lantern-flicker-right 3.0s ease-in-out infinite",
            }}
          />

          {/* Left Console Glowing Vacuum Tube Bank */}
          <div
            className="absolute w-28 h-24 rounded-full bg-gradient-radial from-amber-400/60 via-orange-500/25 to-transparent blur-md mix-blend-screen chrono-animated"
            style={{
              left: "26.5%",
              top: "54.2%",
              transform: "translate(-50%, -50%)",
              animation: "vacuum-filament-pulse 3.4s ease-in-out infinite",
            }}
          />

          {/* Right Console Glowing Vacuum Tube Bank */}
          <div
            className="absolute w-28 h-24 rounded-full bg-gradient-radial from-amber-400/60 via-orange-500/25 to-transparent blur-md mix-blend-screen chrono-animated"
            style={{
              left: "73.5%",
              top: "54.2%",
              transform: "translate(-50%, -50%)",
              animation: "vacuum-filament-pulse 3.8s ease-in-out infinite",
              animationDelay: "1.1s",
            }}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. FLOATING GOLDEN CHRONOMETER BRASS MOTES & SPARKS       */}
      {/* ========================================================= */}
      {mounted && (
        <div className="absolute inset-0 pointer-events-none z-[6] overflow-hidden">
          {[
            { left: "10%", delay: "0.2s", duration: "8.5s", size: "2.5px" },
            { left: "16%", delay: "3.1s", duration: "10.0s", size: "3px" },
            { left: "22%", delay: "1.5s", duration: "9.2s", size: "2px" },
            { left: "30%", delay: "4.2s", duration: "11.5s", size: "3.5px" },
            { left: "38%", delay: "0.8s", duration: "8.0s", size: "2.5px" },
            { left: "46%", delay: "2.6s", duration: "10.2s", size: "3px" },
            { left: "54%", delay: "1.2s", duration: "9.0s", size: "2px" },
            { left: "62%", delay: "3.8s", duration: "11.0s", size: "3px" },
            { left: "70%", delay: "0.5s", duration: "8.8s", size: "2.5px" },
            { left: "78%", delay: "2.9s", duration: "10.5s", size: "3.5px" },
            { left: "85%", delay: "1.9s", duration: "9.5s", size: "2px" },
            { left: "92%", delay: "4.6s", duration: "12.0s", size: "3px" },
            { left: "5%", delay: "2.1s", duration: "9.8s", size: "2px" },
            { left: "95%", delay: "0.9s", duration: "10.4s", size: "2.5px" },
          ].map((mote, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[#fde047] pointer-events-none chrono-animated"
              style={{
                left: mote.left,
                width: mote.size,
                height: mote.size,
                boxShadow: "0 0 8px rgba(253, 224, 71, 0.85), 0 0 16px rgba(245, 158, 11, 0.4)",
                animation: `chrono-mote-float ${mote.duration} linear infinite`,
                animationDelay: mote.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. HIGH-CONTRAST VIGNETTE & READABILITY OVERLAYS          */}
      {/* ========================================================= */}
      {/* Soft atmospheric vignette for UI clarity */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0e0502]/40 via-transparent to-[#070201]/75 pointer-events-none z-[7]" />
      <div
        className="absolute inset-0 pointer-events-none z-[7]"
        style={{
          background:
            "radial-gradient(ellipse 92% 82% at 50% 40%, transparent 38%, rgba(10, 4, 2, 0.5) 75%, rgba(5, 2, 1, 0.85) 100%)",
        }}
      />

      {/* Machinist Blueprint Crosshatch Grid */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none z-[8]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(245, 158, 11, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(245, 158, 11, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Retro Pixel Scanline Texture Overlay */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none z-[9]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, #000 0px, #000 2px, transparent 2px, transparent 4px)",
        }}
      />

      {/* Top Steam Pipe Manifold Accent Shadow */}
      <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#78350f] via-[#fbbf24] to-[#78350f] opacity-35 shadow-[0_2px_8px_#000] z-[10]" />
    </div>
  );
}

export default SteampunkBackground;

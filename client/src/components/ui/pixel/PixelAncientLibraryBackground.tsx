"use client";

import React, { useEffect, useRef, useState } from "react";
import { useLearningStore } from "@/features/learning/store/useLearningStore";
import { cn } from "@/lib/utils";

/* 4-Point 8-Bit Cross Sparkle Star */
function PixelSparkle({
  x,
  y,
  size = 1,
  delay = 0,
}: {
  x: number;
  y: number;
  size?: number;
  delay?: number;
}) {
  return (
    <div
      className="absolute select-none pointer-events-none animate-pixel-star z-10"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        animationDelay: `${delay}s`,
        transform: `translate(-50%, -50%) scale(${size})`,
      }}
    >
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ imageRendering: "pixelated" }}>
        <rect x="6" y="6" width="3" height="3" fill="#FEF08A" />
        <rect x="6" y="3" width="3" height="3" fill="#FEF08A" fillOpacity="0.9" />
        <rect x="6" y="9" width="3" height="3" fill="#FEF08A" fillOpacity="0.9" />
        <rect x="3" y="6" width="3" height="3" fill="#FEF08A" fillOpacity="0.9" />
        <rect x="9" y="6" width="3" height="3" fill="#FEF08A" fillOpacity="0.9" />
        <rect x="7" y="0" width="1" height="3" fill="#FEF08A" fillOpacity="0.8" />
        <rect x="7" y="12" width="1" height="3" fill="#FEF08A" fillOpacity="0.8" />
        <rect x="0" y="7" width="3" height="1" fill="#FEF08A" fillOpacity="0.8" />
        <rect x="12" y="7" width="3" height="1" fill="#FEF08A" fillOpacity="0.8" />
      </svg>
    </div>
  );
}

export function PixelAncientLibraryBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const { status, isArchivistMode } = useLearningStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animated Dust Motes & Candle Flame Glow Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    interface Particle {
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      alpha: number;
      maxAlpha: number;
      color: string;
      life: number;
      maxLife: number;
      type: "dust" | "ember" | "moonbeam";
    }

    const particles: Particle[] = [];
    const maxParticles = 65;

    const spawnParticle = (): Particle => {
      const rand = Math.random();
      const isMoonbeam = rand < 0.45;
      const isEmber = rand >= 0.45 && rand < 0.75;

      if (isMoonbeam) {
        // Drifting down the cathedral window beam (center x: 35% - 65%)
        return {
          x: width * (0.35 + Math.random() * 0.3),
          y: height * (0.1 + Math.random() * 0.5),
          size: Math.random() < 0.8 ? 1.5 : 2.5,
          vx: (Math.random() - 0.5) * 0.25,
          vy: 0.15 + Math.random() * 0.35,
          alpha: 0.05,
          maxAlpha: 0.45 + Math.random() * 0.35,
          color: Math.random() < 0.7 ? "#fef08a" : "#93c5fd",
          life: 0,
          maxLife: 200 + Math.random() * 180,
          type: "moonbeam",
        };
      } else if (isEmber) {
        // Floating upwards from left or right candelabras
        const isLeft = Math.random() < 0.5;
        const startX = isLeft
          ? width * (0.05 + Math.random() * 0.1)
          : width * (0.82 + Math.random() * 0.1);
        return {
          x: startX,
          y: height * (0.22 + Math.random() * 0.2),
          size: Math.random() < 0.7 ? 2 : 3,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -(0.25 + Math.random() * 0.45),
          alpha: 0.1,
          maxAlpha: 0.65 + Math.random() * 0.3,
          color: Math.random() < 0.6 ? "#fbbf24" : "#f59e0b",
          life: 0,
          maxLife: 150 + Math.random() * 120,
          type: "ember",
        };
      } else {
        // General ambient floating golden dust motes across the room
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          size: 1.5,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          alpha: 0.05,
          maxAlpha: 0.35 + Math.random() * 0.25,
          color: "#fde68a",
          life: 0,
          maxLife: 220 + Math.random() * 140,
          type: "dust",
        };
      }
    };

    // Pre-populate particles
    for (let i = 0; i < maxParticles; i++) {
      const p = spawnParticle();
      p.life = Math.random() * p.maxLife;
      particles.push(p);
    }

    let candleFlickerTick = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      candleFlickerTick += 0.05;

      const isRunning = status === "RUNNING";
      const glowBoost = isRunning ? 0.08 : 0;

      // Draw subtle warm candlelight pulses on left and right candelabra zones
      const leftFlicker = Math.sin(candleFlickerTick * 1.8) * 0.04 + Math.cos(candleFlickerTick * 3.4) * 0.02;
      const rightFlicker = Math.cos(candleFlickerTick * 2.1) * 0.04 + Math.sin(candleFlickerTick * 4.1) * 0.02;

      // Left Candelabra Warm Glow
      const leftGrad = ctx.createRadialGradient(
        width * 0.09,
        height * 0.32,
        10,
        width * 0.09,
        height * 0.32,
        width * 0.25
      );
      leftGrad.addColorStop(0, `rgba(245, 158, 11, ${0.16 + leftFlicker + glowBoost})`);
      leftGrad.addColorStop(0.6, `rgba(217, 119, 6, ${0.06 + leftFlicker * 0.5 + glowBoost * 0.5})`);
      leftGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = leftGrad;
      ctx.fillRect(0, 0, width * 0.45, height * 0.7);

      // Right Candelabra Warm Glow
      const rightGrad = ctx.createRadialGradient(
        width * 0.88,
        height * 0.32,
        10,
        width * 0.88,
        height * 0.32,
        width * 0.25
      );
      rightGrad.addColorStop(0, `rgba(245, 158, 11, ${0.16 + rightFlicker + glowBoost})`);
      rightGrad.addColorStop(0.6, `rgba(217, 119, 6, ${0.06 + rightFlicker * 0.5 + glowBoost * 0.5})`);
      rightGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = rightGrad;
      ctx.fillRect(width * 0.55, 0, width * 0.45, height * 0.7);

      // Center Desk Active Focus Amber Aura (when timer is running)
      if (isRunning) {
        const centerGrad = ctx.createRadialGradient(
          width * 0.5,
          height * 0.45,
          20,
          width * 0.5,
          height * 0.45,
          width * 0.4
        );
        const centerPulse = Math.sin(candleFlickerTick * 1.5) * 0.03;
        centerGrad.addColorStop(0, `rgba(245, 158, 11, ${0.12 + centerPulse})`);
        centerGrad.addColorStop(0.5, `rgba(217, 119, 6, ${0.05 + centerPulse * 0.5})`);
        centerGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = centerGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw particles with pixel rendering
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        const progress = p.life / p.maxLife;
        if (progress < 0.2) {
          p.alpha = (progress / 0.2) * p.maxAlpha;
        } else if (progress > 0.8) {
          p.alpha = ((1 - progress) / 0.2) * p.maxAlpha;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
        
        // Pixel block shape
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);

        // Respawn if dead or offscreen
        if (p.life >= p.maxLife || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
          particles[i] = spawnParticle();
        }
      }

      ctx.globalAlpha = 1;
      animFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animFrame);
    };
  }, [status]);

  return (
    <div
      className="fixed inset-0 w-full h-full min-h-screen h-[100dvh] bg-[#0a0503] pointer-events-none select-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* 1. Base Pixel Art Image */}
      <img
        src="/ancient_library_pixel.png"
        alt="Ancient Fantasy Library Background"
        className="w-full h-full object-cover object-center absolute inset-0 transform scale-100"
        style={{
          imageRendering: "pixelated",
          filter: "brightness(0.72) contrast(1.1)",
        }}
      />

      {/* 2. Scholastic Darkening Tint for High Contrast Readability */}
      <div
        className={cn(
          "absolute inset-0 bg-[#0f0704]/60 mix-blend-multiply pointer-events-none transition-opacity duration-500",
          isArchivistMode && "bg-[#050201]/85"
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0503] via-transparent to-[#0a0503]/80 pointer-events-none" />

      {/* 3. Realtime Canvas Particle & Candle Flame Engine */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ imageRendering: "pixelated" }}
      />

      {/* 4. Magical Sparkles on Alchemical Potions & Relics */}
      {mounted && (
        <>
          <PixelSparkle x={13.5} y={67} size={0.8} delay={0.2} />
          <PixelSparkle x={79.2} y={67.5} size={0.8} delay={1.4} />
          <PixelSparkle x={83.8} y={75} size={0.9} delay={0.7} />
          <PixelSparkle x={50} y={15} size={1.0} delay={2.1} />
        </>
      )}

      {/* 5. Retro CRT Scanline Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] pointer-events-none opacity-35" />
    </div>
  );
}

export default PixelAncientLibraryBackground;

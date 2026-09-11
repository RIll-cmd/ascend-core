"use client";

import React, { useEffect, useRef } from "react";

/* =========================================================================
   8-BIT PIXEL FALLING STARS & SHOOTING STAR STARDUST ENGINE
   Authentic retro pixel art celestial shower:
   - High-velocity diagonal shooting stars with stepped pixel tails
   - Multi-spectrum astral palettes (Diamond Gold, Cyan Tempest, Rose Monarch)
   - Falling stardust glints and 4-point cross pixel sparkles
   - Designed to float at z-30 in front of starchart bento boxes
   - Zero-layout-thrashing 60fps canvas engine with imageRendering: pixelated
   ========================================================================= */

interface PixelFallingStarsProps {
  /** Frequency of major shooting stars (default: active celestial shower) */
  density?: "gentle" | "normal" | "shower";
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  headSize: number;
  color: string;
  tailGradient: [string, string, string];
  sparkleColor: string;
  life: number;
  maxLife: number;
  trail: { x: number; y: number; alpha: number; size: number }[];
}

interface StarDust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  pulseSpeed: number;
  color: string;
  type: "dot" | "cross";
}

const STAR_PALETTES = [
  {
    color: "#ffffff",
    tail: ["#ffffff", "#fef08a", "#f59e0b"] as [string, string, string],
    sparkle: "#fef08a",
  }, // Celestial Gold / Sunfire
  {
    color: "#e0f2fe",
    tail: ["#ffffff", "#38bdf8", "#0284c7"] as [string, string, string],
    sparkle: "#38bdf8",
  }, // Tempest Cyan / Astral Lightning
  {
    color: "#fff1f2",
    tail: ["#ffffff", "#f43f5e", "#9f1239"] as [string, string, string],
    sparkle: "#fb7185",
  }, // Sovereign Rose / Ascension Starlight
  {
    color: "#fdf4ff",
    tail: ["#ffffff", "#c084fc", "#6b21a8"] as [string, string, string],
    sparkle: "#e879f9",
  }, // Monarch Amethyst / Cosmic Void
];

export function PixelFallingStars({ density = "normal" }: PixelFallingStarsProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    const shootingStars: ShootingStar[] = [];
    const dustParticles: StarDust[] = [];

    // Continuous diagonal falling stars (glide gracefully in front of boxes)
    interface FallingStar {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      tailLength: number;
      color: string;
      tailColor: string;
      sparkleColor: string;
      alpha: number;
      pulse: number;
    }

    const fallingStarsCount = 14;
    const fallingStars: FallingStar[] = Array.from({ length: fallingStarsCount }, () => {
      const pal = STAR_PALETTES[Math.floor(Math.random() * STAR_PALETTES.length)];
      const speed = 1.6 + Math.random() * 2.0;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: -speed * 1.3, // strong drift left
        vy: speed * 1.0,  // drift down
        size: Math.random() < 0.4 ? 4 : 3,
        tailLength: 14 + Math.floor(Math.random() * 12),
        color: "#ffffff",
        tailColor: pal.tail[1],
        sparkleColor: pal.sparkle,
        alpha: 0.8 + Math.random() * 0.2,
        pulse: Math.random() * Math.PI * 2,
      };
    });

    const spawnShootingStar = (customX?: number, customY?: number) => {
      const pal = STAR_PALETTES[Math.floor(Math.random() * STAR_PALETTES.length)];
      // Spawn from top or right boundary if not specified
      const spawnOnTop = Math.random() < 0.65;
      const startX = customX !== undefined
        ? customX
        : spawnOnTop
        ? width * 0.1 + Math.random() * (width * 0.9)
        : width + 20;
      const startY = customY !== undefined
        ? customY
        : spawnOnTop
        ? -30
        : Math.random() * (height * 0.6);

      // Trajectory: downwards and to the left across the screen
      const speed = 4.5 + Math.random() * 3.5;
      const vx = -speed * (0.9 + Math.random() * 0.3); // strong drift to the left
      const vy = speed * (0.65 + Math.random() * 0.3); // gentle drift downward

      const star: ShootingStar = {
        x: startX,
        y: startY,
        vx,
        vy,
        length: 45 + Math.random() * 30, // Bold, vibrant 8-bit tail
        headSize: Math.random() < 0.4 ? 5 : 4,
        color: pal.color,
        tailGradient: pal.tail,
        sparkleColor: pal.sparkle,
        life: 0,
        maxLife: 120 + Math.random() * 60,
        trail: [],
      };

      // Pre-populate initial tail points along the incoming trajectory so tail is instantly visible
      const initialTailSteps = 20;
      for (let s = 1; s <= initialTailSteps; s++) {
        star.trail.push({
          x: startX - vx * s * 0.8,
          y: startY - vy * s * 0.8,
          alpha: 1.0,
          size: star.headSize,
        });
      }

      shootingStars.push(star);
    };

    // Frequency of shooting stars - active celestial shower pace
    let spawnTimer = 0;
    const spawnIntervalBase = density === "gentle" ? 90 : density === "shower" ? 22 : 32;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.imageSmoothingEnabled = false;

      // 1. Render Ambient Falling Stardust & Cross Sparkles
      for (let i = 0; i < dustParticles.length; i++) {
        const d = dustParticles[i];
        d.x += d.vx;
        d.y += d.vy;
        d.alpha += d.pulseSpeed;

        // Wrap around boundaries
        if (d.x < -10) d.x = width + 10;
        if (d.y > height + 10) {
          d.y = -10;
          d.x = Math.random() * width;
        }

        const currentAlpha = Math.max(
          0.15,
          ((Math.sin(d.alpha) + 1) / 2) * d.maxAlpha
        );

        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = d.color;

        const px = Math.floor(d.x);
        const py = Math.floor(d.y);

        if (d.type === "cross") {
          // Pixelated 3x3 diamond/cross sparkle with glowing core
          ctx.fillRect(px, py - 1, 1, 3);
          ctx.fillRect(px - 1, py, 3, 1);
          // Highlight core
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(px, py, 1, 1);
        } else {
          // Sharp pixel block
          ctx.fillRect(px, py, d.size, d.size);
        }
      }

      // 2. Render Continuous Diagonal Falling Stars (Gliding gracefully in front of bento boxes)
      for (let i = 0; i < fallingStars.length; i++) {
        const fs = fallingStars[i];
        fs.pulse += 0.04;
        fs.x += fs.vx;
        fs.y += fs.vy;

        // Wrap around boundaries
        if (fs.x < -60 || fs.y > height + 60) {
          fs.x = width * (0.2 + Math.random() * 0.9);
          fs.y = -40;
        }

        const currentAlpha = Math.max(0.55, ((Math.sin(fs.pulse) + 1) / 2) * fs.alpha);
        const fx = Math.floor(fs.x);
        const fy = Math.floor(fs.y);

        // Stepped diagonal tail (extending backward up and to the right)
        for (let t = 1; t <= fs.tailLength; t++) {
          const tailAlpha = currentAlpha * (1 - t / fs.tailLength) * 0.9;
          ctx.globalAlpha = tailAlpha;
          ctx.fillStyle = fs.tailColor;

          // Step backwards along direction: since vx < 0, backward is +x; vy > 0, backward is -y
          const tx = fx + t * 2.5;
          const ty = fy - t * 2.5;
          const tailWidth = Math.max(2, Math.round(fs.size * (1 - (t / fs.tailLength) * 0.5)));
          ctx.fillRect(Math.floor(tx), Math.floor(ty), tailWidth, tailWidth);
        }

        // Star Head (Bold 8-Bit 4-point pixel diamond sparkle)
        ctx.globalAlpha = 1.0;
        // Outer halo
        ctx.fillStyle = fs.sparkleColor;
        ctx.fillRect(fx - 4, fy - 1, 9, 3);
        ctx.fillRect(fx - 1, fy - 4, 3, 9);
        // Diamond Core
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(fx - 2, fy - 2, 5, 5);
      }

      // 3. Render High-Speed Diagonal Meteors & Shooting Stars
      spawnTimer++;
      if (spawnTimer >= spawnIntervalBase) {
        spawnShootingStar();
        // Occasional double star burst
        if (density !== "gentle" && Math.random() < 0.4) {
          setTimeout(() => spawnShootingStar(), 80 + Math.random() * 150);
        }
        spawnTimer = 0;
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const star = shootingStars[i];
        star.life++;

        // Add current head position to trail
        star.trail.unshift({
          x: star.x,
          y: star.y,
          alpha: 1.0,
          size: star.headSize,
        });

        // Limit trail length
        if (star.trail.length > star.length) {
          star.trail.pop();
        }

        star.x += star.vx;
        star.y += star.vy;

        // Draw stepped retro pixel tail
        const trailLen = star.trail.length;
        for (let t = 0; t < trailLen; t++) {
          const point = star.trail[t];
          const progress = t / trailLen; // 0 = head, 1 = tail end
          const tailAlpha = (1 - progress) * 0.9;

          // Interpolate color along 3-stop gradient
          let col = star.tailGradient[0];
          if (progress > 0.6) {
            col = star.tailGradient[2];
          } else if (progress > 0.25) {
            col = star.tailGradient[1];
          }

          ctx.globalAlpha = tailAlpha;
          ctx.fillStyle = col;

          const stepSize = Math.max(2, Math.round(star.headSize * (1 - progress * 0.6)));
          const tx = Math.floor(point.x);
          const ty = Math.floor(point.y);

          // Render stepped pixel block along path with halo glow
          ctx.fillRect(tx - Math.floor(stepSize / 2), ty - Math.floor(stepSize / 2), stepSize, stepSize);

          // Periodic pixel stardust glints scattering off the tail
          if (t % 5 === 0 && Math.random() < 0.25) {
            ctx.fillStyle = star.sparkleColor;
            ctx.fillRect(
              tx + (Math.random() * 6 - 3),
              ty + (Math.random() * 6 - 3),
              2,
              2
            );
          }
        }

        // Draw Blazing 8-Bit Pixel Star Head (Bold Diamond Cross with Multi-Layer Glow)
        const hx = Math.floor(star.x);
        const hy = Math.floor(star.y);
        ctx.globalAlpha = 1.0;

        // Outer starlight halo
        ctx.fillStyle = star.sparkleColor;
        ctx.fillRect(hx - 4, hy - 1, 9, 3);
        ctx.fillRect(hx - 1, hy - 4, 3, 9);

        // Core 4-point pixel spikes
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(hx - 6, hy, 13, 1);
        ctx.fillRect(hx, hy - 6, 1, 13);

        // Radiant white diamond center
        ctx.fillRect(hx - 2, hy - 2, 5, 5);

        // Remove expired stars only when they have fully crossed past the screen boundary or exceeded max flight
        if (
          star.x < -200 ||
          star.y > height + 200 ||
          star.life >= 300
        ) {
          shootingStars.splice(i, 1);
        }
      }

      ctx.globalAlpha = 1.0;
      animFrame = requestAnimationFrame(render);
    };

    // Spawn initial shooting stars across different points on screen for immediate visual impact
    spawnShootingStar(width * 0.75, height * 0.1);
    spawnShootingStar(width * 0.45, height * 0.25);
    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animFrame);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30"
      style={{ imageRendering: "pixelated" }}
      aria-hidden="true"
    />
  );
}

export default PixelFallingStars;

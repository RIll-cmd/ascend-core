"use client";

import React, { useEffect, useRef } from "react";

interface PixelFirefliesProps {
  count?: number;
}

export function PixelFireflies({ count = 22 }: PixelFirefliesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    interface Firefly {
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      pulse: number;
      pulseSpeed: number;
      color: string;
      glowColor: string;
      maxAlpha: number;
    }

    const colorPalettes = [
      { color: "#fef08a", glow: "rgba(254, 240, 138, 0.45)" }, // Warm yellow-gold
      { color: "#6ee7b7", glow: "rgba(110, 231, 183, 0.45)" }, // Soft mystical mint emerald
      { color: "#38bdf8", glow: "rgba(56, 189, 248, 0.45)" },  // Waterfall cyan spark
      { color: "#fde047", glow: "rgba(253, 224, 71, 0.5)" },   // Radiant ember gold
    ];

    const fireflies: Firefly[] = Array.from({ length: count }, () => {
      const pal = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() < 0.7 ? 2 : 3, // Crisp pixel dots
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.35,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        color: pal.color,
        glowColor: pal.glow,
        maxAlpha: 0.6 + Math.random() * 0.35,
      };
    });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Disable anti-aliasing for true retro pixel sharpness
      ctx.imageSmoothingEnabled = false;

      for (let i = 0; i < fireflies.length; i++) {
        const f = fireflies[i];
        f.pulse += f.pulseSpeed;
        f.x += f.vx;
        f.y += f.vy;

        // Gentle wandering velocity
        if (Math.random() < 0.02) {
          f.vx += (Math.random() - 0.5) * 0.15;
          f.vy += (Math.random() - 0.5) * 0.15;
          // Clamp speed
          f.vx = Math.max(-0.6, Math.min(0.6, f.vx));
          f.vy = Math.max(-0.5, Math.min(0.5, f.vy));
        }

        // Wrap edges smoothly
        if (f.x < -10) f.x = width + 10;
        if (f.x > width + 10) f.x = -10;
        if (f.y < -10) f.y = height + 10;
        if (f.y > height + 10) f.y = -10;

        const currentAlpha = Math.max(0.15, ((Math.sin(f.pulse) + 1) / 2) * f.maxAlpha);

        // Soft outer ambient halo
        ctx.fillStyle = f.glowColor;
        ctx.globalAlpha = currentAlpha * 0.6;
        ctx.fillRect(
          Math.floor(f.x) - f.size,
          Math.floor(f.y) - f.size,
          f.size * 3,
          f.size * 3
        );

        // Crisp pixel core
        ctx.fillStyle = f.color;
        ctx.globalAlpha = currentAlpha;
        ctx.fillRect(Math.floor(f.x), Math.floor(f.y), f.size, f.size);
      }

      ctx.globalAlpha = 1.0;
      animFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animFrame);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

export default PixelFireflies;

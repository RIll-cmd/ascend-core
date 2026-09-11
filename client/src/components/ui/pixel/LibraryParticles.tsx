"use client";

import React, { useEffect, useRef } from "react";
import { useLearningStore } from "@/features/learning/store/useLearningStore";

interface LibraryParticlesProps {
  count?: number;
}

export function LibraryParticles({ count = 55 }: LibraryParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { status } = useLearningStore();

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
          maxAlpha: 0.5 + Math.random() * 0.35,
          color: Math.random() < 0.7 ? "#fef08a" : "#93c5fd",
          life: 0,
          maxLife: 200 + Math.random() * 180,
          type: "moonbeam",
        };
      } else if (isEmber) {
        // Floating upwards from left or right candelabras
        const isLeft = Math.random() < 0.5;
        const startX = isLeft
          ? width * (0.05 + Math.random() * 0.15)
          : width * (0.8 + Math.random() * 0.15);
        return {
          x: startX,
          y: height * (0.2 + Math.random() * 0.3),
          size: Math.random() < 0.7 ? 2 : 3,
          vx: (Math.random() - 0.5) * 0.35,
          vy: -(0.3 + Math.random() * 0.5),
          alpha: 0.1,
          maxAlpha: 0.7 + Math.random() * 0.3,
          color: Math.random() < 0.6 ? "#fbbf24" : "#f59e0b",
          life: 0,
          maxLife: 160 + Math.random() * 120,
          type: "ember",
        };
      } else {
        // General ambient floating golden dust motes across the room
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          size: 1.5,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          alpha: 0.05,
          maxAlpha: 0.4 + Math.random() * 0.25,
          color: "#fde68a",
          life: 0,
          maxLife: 220 + Math.random() * 140,
          type: "dust",
        };
      }
    };

    // Pre-populate particles
    for (let i = 0; i < count; i++) {
      const p = spawnParticle();
      p.life = Math.random() * p.maxLife;
      particles.push(p);
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Disable anti-aliasing for true retro pixel sharpness
      ctx.imageSmoothingEnabled = false;

      // Draw particles with crisp pixel rendering
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
        } else {
          p.alpha = p.maxAlpha;
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
  }, [count, status]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

export default LibraryParticles;

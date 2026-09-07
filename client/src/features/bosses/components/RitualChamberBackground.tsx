"use client";

import React, { useEffect, useRef } from "react";
import "../styles/ritual-animations.css";

interface RitualChamberBackgroundProps {
  isSummonActive?: boolean;
}

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  vy: number;
  vx: number;
  alpha: number;
  targetAlpha: number;
  pulsePhase: number;
  pulseSpeed: number;
}

export const RitualChamberBackground: React.FC<RitualChamberBackgroundProps> = ({
  isSummonActive = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // High-performance mana spores / floating occult embers canvas particle system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Occult particle palette
    const colors = [
      "rgba(45, 212, 191,",  // Glowing Teal
      "rgba(56, 189, 248,",  // Astral Cyan
      "rgba(168, 85, 247,",  // Violet Aether
      "rgba(245, 158, 11,",  // Amber Sigil Ember
      "rgba(99, 102, 241,",  // Indigo Resonance
    ];

    const particleCount = 36;
    const particles: Particle[] = [];

    // Originates predominantly from lower circle
    const createParticle = (spawnInitial = false): Particle => {
      const circleCenterX = width * 0.5;
      const circleCenterY = height * 0.76;
      const spreadX = width * 0.38;
      const spreadY = height * 0.18;

      const x = circleCenterX + (Math.random() - 0.5) * spreadX;
      const y = spawnInitial
        ? circleCenterY - Math.random() * (height * 0.45)
        : circleCenterY + (Math.random() - 0.5) * spreadY;

      const baseColor = colors[Math.floor(Math.random() * colors.length)];
      const radius = Math.random() * 1.8 + 0.8;
      const vy = -(Math.random() * 0.65 + 0.35); // Float upward
      const vx = (Math.random() - 0.5) * 0.4;
      const targetAlpha = Math.random() * 0.75 + 0.25;

      return {
        x,
        y,
        radius,
        color: baseColor,
        vy,
        vx,
        alpha: spawnInitial ? targetAlpha * Math.random() : 0,
        targetAlpha,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.04 + 0.02,
      };
    };

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(true));
    }

    let time = 0;

    const render = () => {
      time += 0.018;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Motion and sine-wave horizontal drift
        p.y += p.vy;
        p.x += p.vx + Math.sin(time + p.pulsePhase) * 0.32;
        p.pulsePhase += p.pulseSpeed;

        // Alpha fade-in / fade-out
        if (p.alpha < p.targetAlpha && p.y > height * 0.5) {
          p.alpha += 0.015;
        } else if (p.y < height * 0.35) {
          p.alpha -= 0.012;
        }

        // Render soft glowing circle
        if (p.alpha > 0.01) {
          const currentAlpha = Math.max(0, Math.min(1, p.alpha * (0.85 + 0.15 * Math.sin(p.pulsePhase))));
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${currentAlpha})`;
          ctx.shadowColor = `${p.color}0.8)`;
          ctx.shadowBlur = p.radius * 6;
          ctx.fill();
        }

        // Reset particle when floated too high or faded
        if (p.y < height * 0.15 || p.alpha <= 0.01) {
          particles[i] = createParticle(false);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-30 w-full h-full overflow-hidden pointer-events-none select-none">
      {/* 1. Base Subterranean Ritual Crypt Background Image */}
      <img
        src="/backgrounds/subterranean-ritual-chamber.png"
        alt="Subterranean Ritual Crypt"
        className="w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.12]"
      />

      {/* 2. Upper Astral Blue Portal Luminescence Bloom */}
      <div
        className="portal-pulse absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-[48vw] max-w-[620px] aspect-[1.8/1] rounded-full pointer-events-none mix-blend-screen opacity-75"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.45) 0%, rgba(139, 92, 246, 0.25) 45%, rgba(56, 189, 248, 0.12) 65%, transparent 78%)",
          filter: "drop-shadow(0 0 24px rgba(99, 102, 241, 0.65))",
        }}
      />

      {/* 3. Lower Foreground Teal Summoning Seal Luminescence Bloom */}
      <div
        className={`absolute left-1/2 top-[76%] -translate-x-1/2 -translate-y-1/2 w-[58vw] max-w-[760px] aspect-[1.9/1] rounded-full pointer-events-none mix-blend-screen transition-all duration-700 ${
          isSummonActive
            ? "scale-105 brightness-150 drop-shadow-[0_0_38px_rgba(45,212,191,0.95)] opacity-95"
            : "rune-pulse opacity-75"
        }`}
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(45, 212, 191, 0.42) 0%, rgba(6, 182, 212, 0.24) 48%, rgba(20, 184, 166, 0.1) 68%, transparent 80%)",
        }}
      />

      {/* 4. Canvas Particle Emitter for Drifting Mana Spores */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen"
      />

      {/* 5. Subterranean Torchlight Vignette & Atmospheric Shadow Mist */}
      <div
        className="torchlight-flicker absolute inset-0 w-full h-full pointer-events-none"
        style={{
          boxShadow: "inset 0 0 160px rgba(0, 0, 0, 0.9), inset 0 0 80px rgba(3, 7, 18, 0.75)",
          background: "radial-gradient(circle at 50% 45%, transparent 35%, rgba(2, 6, 17, 0.62) 95%)",
        }}
      />
    </div>
  );
};

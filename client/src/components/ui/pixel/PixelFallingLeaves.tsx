"use client";

import React, { useEffect, useRef } from "react";

interface PixelFallingLeavesProps {
  count?: number;
  className?: string;
}

type SakuraPetalType = "classic" | "slender" | "twin" | "blossom";

interface SakuraParticle {
  x: number;
  y: number;
  type: SakuraPetalType;
  size: number;
  speedY: number;
  speedX: number;
  swing: number;
  swingSpeed: number;
  angle: number;
  angularSpeed: number;
  colorMain: string;
  colorShadow: string;
  colorHighlight: string;
  colorOutline: string;
  opacity: number;
}

export function PixelFallingLeaves({ count = 36, className = "" }: PixelFallingLeavesProps) {
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

    const petalTypes: SakuraPetalType[] = ["classic", "slender", "twin", "blossom"];

    // Lush Emerald & Fantasy Woodland Green Leaf Palettes
    const palettes = [
      {
        main: "#4ade80", // Lush leaf green
        shadow: "#15803d", // Deep forest shadow
        highlight: "#dcfce7", // Sunlit dewy crest
        outline: "rgba(20, 83, 45, 0.45)",
      },
      {
        main: "#22c55e", // Radiant emerald green
        shadow: "#166534", // Shaded moss tone
        highlight: "#bbf7d0", // Spring leaf highlight
        outline: "rgba(21, 128, 61, 0.5)",
      },
      {
        main: "#86efac", // Tender spring foliage / pale mint
        shadow: "#15803d", // Vibrant contrast shadow
        highlight: "#f0fdf4", // Crisp morning dew
        outline: "rgba(6, 78, 59, 0.35)",
      },
      {
        main: "#a3e635", // Sun-dappled lime green
        shadow: "#4d7c0f", // Warm woodland olive shadow
        highlight: "#f7fee7", // Golden sunlight crest
        outline: "rgba(77, 124, 15, 0.4)",
      },
    ];

    // Initialize sakura petals distributed across the entire viewport
    const petals: SakuraParticle[] = Array.from({ length: count }, () => {
      const type = petalTypes[Math.floor(Math.random() * petalTypes.length)];
      const pal = palettes[Math.floor(Math.random() * palettes.length)];

      return {
        x: Math.random() * width,
        y: Math.random() * height,
        type,
        size: Math.floor(Math.random() * 2) + 2.5, // 2.5 to 3.5px per block
        speedY: Math.random() * 0.45 + 0.38, // Gentle floating descent
        speedX: Math.random() * 0.35 + 0.18, // Gentle eastward breeze
        swing: Math.random() * Math.PI * 2,
        swingSpeed: Math.random() * 0.022 + 0.012,
        angle: Math.random() * Math.PI * 2,
        angularSpeed: (Math.random() - 0.5) * 0.02,
        colorMain: pal.main,
        colorShadow: pal.shadow,
        colorHighlight: pal.highlight,
        colorOutline: pal.outline,
        opacity: Math.random() * 0.35 + 0.65,
      };
    });

    // 1. Classic Notched Sakura Petal (Heart-shaped top notch)
    const drawClassicSakuraPetal = (
      pCtx: CanvasRenderingContext2D,
      s: number,
      main: string,
      shadow: string,
      highlight: string,
      outline: string
    ) => {
      pCtx.fillStyle = outline;
      pCtx.fillRect(-s * 1.8, -s * 2.2, s * 3.6, s * 4.4);

      pCtx.fillStyle = main;
      pCtx.fillRect(-s * 1.5, -s * 1.8, s * 3, s * 3.8);

      // Sakura Heart Notch at the top
      pCtx.clearRect(-s * 0.4, -s * 2.4, s * 0.8, s * 0.8);

      pCtx.fillStyle = highlight;
      pCtx.fillRect(-s * 1.2, -s * 1.4, s * 0.9, s * 1.8);
      pCtx.fillRect(-s * 0.9, -s * 1.7, s * 0.6, s * 0.6);

      pCtx.fillStyle = shadow;
      pCtx.fillRect(-s * 0.5, s * 1.2, s, s * 0.8);
      pCtx.fillRect(s * 0.3, -s * 0.5, s * 0.8, s * 1.8);
    };

    // 2. Slender Curved Petal (Caught mid-twirl)
    const drawSlenderSakuraPetal = (
      pCtx: CanvasRenderingContext2D,
      s: number,
      main: string,
      shadow: string,
      highlight: string,
      outline: string
    ) => {
      pCtx.fillStyle = outline;
      pCtx.fillRect(-s * 1.2, -s * 2.5, s * 2.4, s * 5);

      pCtx.fillStyle = main;
      pCtx.fillRect(-s * 0.9, -s * 2.2, s * 1.8, s * 4.4);

      pCtx.clearRect(-s * 0.3, -s * 2.6, s * 0.6, s * 0.6);

      pCtx.fillStyle = highlight;
      pCtx.fillRect(-s * 0.6, -s * 1.8, s * 0.6, s * 2.6);

      pCtx.fillStyle = shadow;
      pCtx.fillRect(0, 0, s * 0.8, s * 2);
    };

    // 3. Twin Overlapping Sakura Petals
    const drawTwinSakuraPetals = (
      pCtx: CanvasRenderingContext2D,
      s: number,
      main: string,
      shadow: string,
      highlight: string,
      outline: string
    ) => {
      pCtx.fillStyle = outline;
      pCtx.fillRect(-s * 0.8, -s * 2.2, s * 2.4, s * 3.4);
      pCtx.fillStyle = shadow;
      pCtx.fillRect(-s * 0.6, -s * 2, s * 2, s * 3);

      pCtx.fillStyle = outline;
      pCtx.fillRect(-s * 1.8, -s * 1.2, s * 2.6, s * 3.6);
      pCtx.fillStyle = main;
      pCtx.fillRect(-s * 1.5, -s, s * 2.2, s * 3.2);

      pCtx.clearRect(-s * 0.8, -s * 1.4, s * 0.6, s * 0.6);

      pCtx.fillStyle = highlight;
      pCtx.fillRect(-s * 1.2, -s * 0.7, s * 0.8, s * 1.6);
    };

    // 4. Tiny Sakura Blossom Floret
    const drawSakuraFloret = (
      pCtx: CanvasRenderingContext2D,
      s: number,
      main: string,
      shadow: string,
      highlight: string,
      outline: string
    ) => {
      pCtx.fillStyle = outline;
      pCtx.fillRect(-s * 2, -s * 2, s * 4, s * 4);

      pCtx.fillStyle = main;
      pCtx.fillRect(-s * 1.6, -s * 0.8, s * 3.2, s * 1.6);
      pCtx.fillRect(-s * 0.8, -s * 1.6, s * 1.6, s * 3.2);

      pCtx.fillStyle = highlight;
      pCtx.fillRect(-s * 1.4, -s * 0.5, s * 0.6, s);
      pCtx.fillRect(-s * 0.5, -s * 1.4, s, s * 0.6);

      pCtx.fillStyle = shadow;
      pCtx.fillRect(s * 0.7, -s * 0.5, s * 0.6, s);
      pCtx.fillRect(-s * 0.5, s * 0.7, s, s * 0.6);

      // Golden pollen pistil center
      pCtx.fillStyle = "#fef08a";
      pCtx.fillRect(-s * 0.4, -s * 0.4, s * 0.8, s * 0.8);
      pCtx.fillStyle = "#d97706";
      pCtx.fillRect(-s * 0.2, -s * 0.2, s * 0.4, s * 0.4);
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      petals.forEach((p) => {
        p.swing += p.swingSpeed;
        const currentX = p.x + Math.sin(p.swing) * 24;
        p.y += p.speedY;
        p.x += p.speedX;
        p.angle += p.angularSpeed;

        ctx.save();
        ctx.translate(currentX, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.opacity;

        switch (p.type) {
          case "classic":
            drawClassicSakuraPetal(ctx, p.size, p.colorMain, p.colorShadow, p.colorHighlight, p.colorOutline);
            break;
          case "slender":
            drawSlenderSakuraPetal(ctx, p.size, p.colorMain, p.colorShadow, p.colorHighlight, p.colorOutline);
            break;
          case "twin":
            drawTwinSakuraPetals(ctx, p.size, p.colorMain, p.colorShadow, p.colorHighlight, p.colorOutline);
            break;
          case "blossom":
            drawSakuraFloret(ctx, p.size, p.colorMain, p.colorShadow, p.colorHighlight, p.colorOutline);
            break;
        }

        ctx.restore();

        // Wrap around screen smoothly
        if (p.y > height + 25) {
          p.y = -25;
          p.x = Math.random() * width;
        }
        if (p.x > width + 25) {
          p.x = -25;
        } else if (p.x < -25) {
          p.x = width + 25;
        }
      });

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
      className={`fixed inset-0 pointer-events-none z-[60] ${className}`}
      style={{ imageRendering: "pixelated" }}
      aria-hidden="true"
    />
  );
}

export default PixelFallingLeaves;

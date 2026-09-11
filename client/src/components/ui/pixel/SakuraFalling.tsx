"use client";

import React, { useEffect, useRef } from "react";

interface SakuraFallingProps {
  count?: number;
}

export function SakuraFalling({ count = 12 }: SakuraFallingProps) {
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

    // Pixel petal definition
    interface Petal {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      swing: number;
      swingSpeed: number;
      angle: number;
      color: string;
      colorShadow: string;
      opacity: number;
    }

    const colors = [
      { main: "#fda4af", shadow: "#f43f5e" }, // Rose pink
      { main: "#fce7f3", shadow: "#f472b6" }, // Light sakura pink
      { main: "#fbcfe8", shadow: "#fb7185" }, // Muted cherry
      { main: "#fba170", shadow: "#e05344" }, // Dusk apricot touch
    ];

    const petals: Petal[] = Array.from({ length: count }, () => {
      const col = colors[Math.floor(Math.random() * colors.length)];
      return {
        x: Math.random() * width,
        y: Math.random() * height - height,
        size: Math.floor(Math.random() * 2) + 3, // 3 to 4 pixel block size
        speedY: Math.random() * 0.4 + 0.35, // slow gentle drift downward
        speedX: Math.random() * 0.3 + 0.15, // gentle drift to the right
        swing: 0,
        swingSpeed: Math.random() * 0.02 + 0.01,
        angle: Math.random() * Math.PI * 2,
        color: col.main,
        colorShadow: col.shadow,
        opacity: Math.random() * 0.45 + 0.5,
      };
    });

    const drawPixelPetal = (
      pCtx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      mainCol: string,
      shadowCol: string,
      opacity: number,
      rotation: number
    ) => {
      pCtx.save();
      pCtx.translate(x, y);
      pCtx.rotate(rotation);
      pCtx.globalAlpha = opacity;

      // Authentic 3x3 / 4x4 pixel petal shape
      // Top tip
      pCtx.fillStyle = mainCol;
      pCtx.fillRect(0, -size, size, size);
      // Body
      pCtx.fillRect(-size, 0, size * 2, size);
      // Notch / shadow base
      pCtx.fillStyle = shadowCol;
      pCtx.fillRect(0, size, size, size);

      pCtx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      petals.forEach((p) => {
        p.swing += p.swingSpeed;
        const currentX = p.x + Math.sin(p.swing) * 16;
        p.y += p.speedY;
        p.x += p.speedX;
        p.angle += 0.008;

        drawPixelPetal(
          ctx,
          currentX,
          p.y,
          p.size,
          p.color,
          p.colorShadow,
          p.opacity,
          p.angle
        );

        // Respawn when falling past viewport bottom or drift past right
        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width * 0.9;
        }
        if (p.x > width + 20) {
          p.x = -20;
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
      className="fixed inset-0 pointer-events-none z-30"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

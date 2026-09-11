"use client";

import React, { type ReactNode } from "react";

export interface BaseParticle {
  element: HTMLElement | SVGSVGElement;
  left: number;
  size: number;
  top: number;
}

export interface BaseParticleOptions {
  particle?: string;
  size?: number;
}

export interface CoolParticle extends BaseParticle {
  direction: number;
  speedHorz: number;
  speedUp: number;
  spinSpeed: number;
  spinVal: number;
}

export interface CoolParticleOptions extends BaseParticleOptions {
  particleCount?: number;
  speedHorz?: number;
  speedUp?: number;
}

interface CoolModeProps {
  children: ReactNode;
  options?: CoolParticleOptions;
  className?: string;
}

/**
 * CoolMode clicking animations disabled per user instruction.
 * Renders children cleanly as a React Fragment with zero event listeners,
 * zero DOM pollution, and zero layout shift.
 */
export const CoolMode: React.FC<CoolModeProps> = ({ children }) => {
  return <>{children}</>;
};

export default CoolMode;

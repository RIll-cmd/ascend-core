"use client";

import React from "react";

interface ShopIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

/**
 * ShopProvisionsIcon
 * Replaces modern shopping basket with an authentic medieval alchemy elixir flask.
 */
export function ShopProvisionsIcon({ size = 18, className = "", ...props }: ShopIconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Wooden Cork Stopper */}
      <rect x="8.5" y="1.2" width="3" height="2.2" rx="0.6" fill="currentColor" />
      
      {/* Bottle Lip Collar */}
      <path d="M7 3.4H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      
      {/* Flask Neck */}
      <path d="M8.2 4V6.5M11.8 4V6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      
      {/* Bulbous Flask Body */}
      <path
        d="M8.2 6.5L5.2 11.5C4.4 12.8 4.6 15.8 6.5 17.5C7.5 18.3 8.7 18.8 10 18.8C11.3 18.8 12.5 18.3 13.5 17.5C15.4 15.8 15.6 12.8 14.8 11.5L11.8 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.16"
      />
      
      {/* Liquid Fill Level */}
      <path
        d="M5.8 12.5C7 11.8 13 11.8 14.2 12.5C14.8 14.5 14.2 17 10 17.5C5.8 17 5.2 14.5 5.8 12.5Z"
        fill="currentColor"
        fillOpacity="0.3"
      />
      
      {/* Glass Highlight Glint */}
      <path d="M7 9.5C6.5 10.5 6.2 12 6.2 13.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.85" />
      <circle cx="12" cy="14.5" r="0.8" fill="currentColor" opacity="0.75" />
    </svg>
  );
}

/**
 * ShopArmsArmorIcon
 * Replaces wireframe shield with an authentic battle heater shield & crossed blade.
 */
export function ShopArmsArmorIcon({ size = 18, className = "", ...props }: ShopIconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Crossed Broadsword angled behind shield */}
      <path d="M16.5 2.5L13.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12.2 3.8L15.2 6.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="17.2" cy="1.8" r="0.8" fill="currentColor" />
      <path d="M7.5 11.5L4 15L2.8 16.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />

      {/* Forged Knightly Heater Shield */}
      <path
        d="M4.5 4.5C7.2 4 12.8 4 15.5 4.5C15.8 8.8 14.8 13.2 10 17.5C5.2 13.2 4.2 8.8 4.5 4.5Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Central Heraldic Steel Cross Boss */}
      <path d="M10 6.5V14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M6.8 9.2H13.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />

      {/* Shield Rivets */}
      <circle cx="6.2" cy="6.2" r="0.6" fill="currentColor" />
      <circle cx="13.8" cy="6.2" r="0.6" fill="currentColor" />
      <circle cx="10" cy="15" r="0.6" fill="currentColor" />
    </svg>
  );
}

/**
 * ShopCuriosRelicsIcon
 * Replaces generic book with an authentic multifaceted Arcane Relic Crystal & Celestial Sparkles.
 */
export function ShopCuriosRelicsIcon({ size = 18, className = "", ...props }: ShopIconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Outer Faceted Relic Gem Shape */}
      <path
        d="M10 2L15.5 5.5V12.8L10 17.5L4.5 12.8V5.5L10 2Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Geometric Facet Lines */}
      <path d="M10 2V17.5" stroke="currentColor" strokeWidth="1.1" opacity="0.8" />
      <path d="M4.5 5.5L10 8.5L15.5 5.5" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M4.5 12.8L10 11.2L15.5 12.8" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />

      {/* Top Center Celestial Rune Glint */}
      <path d="M10 0.5L10.4 1.4L11.3 1.8L10.4 2.2L10 3.1L9.6 2.2L8.7 1.8L9.6 1.4L10 0.5Z" fill="currentColor" />
      
      {/* Side Glints */}
      <circle cx="17.5" cy="4" r="0.75" fill="currentColor" />
      <circle cx="2.5" cy="14" r="0.75" fill="currentColor" />
    </svg>
  );
}

/**
 * ShopBlackMarketIcon
 * Replaces modern key with an authentic Dungeon Skull Skeleton Key.
 */
export function ShopBlackMarketIcon({ size = 18, className = "", ...props }: ShopIconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {/* Skull Key Bow (Head) */}
      <path
        d="M6.2 5.5C6.2 3.2 7.8 1.8 10 1.8C12.2 1.8 13.8 3.2 13.8 5.5C13.8 7 12.8 8.2 11.5 8.6V9.6H8.5V8.6C7.2 8.2 6.2 7 6.2 5.5Z"
        fill="currentColor"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Hollow Skull Eye Sockets */}
      <rect x="7.8" y="4.5" width="1.4" height="1.6" rx="0.5" fill="currentColor" />
      <rect x="10.8" y="4.5" width="1.4" height="1.6" rx="0.5" fill="currentColor" />

      {/* Key Shaft */}
      <path d="M10 9.6V18.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />

      {/* Collar Ring */}
      <path d="M8.5 10.8H11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />

      {/* Dungeon Gate Bit Teeth */}
      <path
        d="M10 14.2H13.6V15.8H11.8V17.2H13.6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

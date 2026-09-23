"use client";

import React from "react";
import { Star } from "lucide-react";

export function BrutstackTestimonials() {
  const testimonials = [
    {
      initial: "J",
      name: "Jin Woo",
      role: "S-Rank Shadow Monarch, Solo Levelers",
      quote:
        "Ascend Core replaced 4 apps. The Tower gauntlet makes skipping gym sets feel like losing a boss fight.",
      color: "#ffcc00",
    },
    {
      initial: "S",
      name: "Sarah Chen",
      role: "Staff Engineer & Competitive Powerlifter",
      quote:
        "The habit strength curve cured my perfectionism. Even on travel weeks, my momentum held.",
      color: "#38bdf8",
    },
    {
      initial: "M",
      name: "Marcus Vance",
      role: "Founder & Guild Lead, Iron Forge",
      quote:
        "Turning 90-min deep work blocks and sleep into raid damage is wildly addictive.",
      color: "#e63946",
    },
  ];

  return (
    <section id="testimonials" className="w-full bg-[#1a1a1a] px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-28 text-[#f9f4da]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4">
        {/* Badge */}
        <div className="mb-4 flex justify-center">
          <span className="retro font-bold inline-flex items-center py-2 bg-[#0ca95b] px-4 text-[9px] sm:text-[10px] text-[#1a1a1a] uppercase border-2 border-black shadow-[2px_2px_0_0_#000]">
            Hunter Transcripts
          </span>
        </div>

        {/* Heading */}
        <h2 className="retro text-2xl sm:text-3xl lg:text-4xl font-black mb-14 text-center uppercase tracking-tight">
          Loved by <span className="text-[#0ca95b]">Ascending Operatives</span>
          <br />
          worldwide
        </h2>

        {/* 3 Testimonial Cards */}
        <div className="grid w-full auto-rows-fr grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="group relative flex h-full w-full transform-gpu transition-transform duration-300 ease-in-out hover:-translate-x-1.5 hover:-translate-y-1.5"
            >
              {/* Bottom Color Layer */}
              <div
                className="pointer-events-none absolute inset-0 z-0 border-2 border-black transform-gpu transition-transform duration-300 ease-in-out translate-x-3.5 translate-y-3.5 group-hover:translate-x-4.5 group-hover:translate-y-4.5"
                style={{ backgroundColor: item.color }}
              />
              {/* Middle Cream Layer */}
              <div className="pointer-events-none absolute inset-0 z-10 border-2 border-black bg-[#f9f4da] transform-gpu transition-transform duration-300 ease-in-out translate-x-1.5 translate-y-1.5 group-hover:translate-x-2.5 group-hover:translate-y-2.5" />
              {/* Front Card */}
              <div className="relative z-20 flex h-full w-full flex-col border-2 border-black bg-[#1a1a1a] p-6 lg:p-7">
                <div className="space-y-6 flex flex-col h-full justify-between">
                  {/* Avatar */}
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-black retro text-base font-black text-black shadow-[2px_2px_0_0_#000]"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.initial}
                  </div>

                  {/* Quote */}
                  <p className="retro flex-1 text-[8px] sm:text-[9px] md:text-[10px] leading-relaxed text-[#f9f4da]/90">
                    &ldquo;{item.quote}&rdquo;
                  </p>

                  {/* Author Details & Stars */}
                  <div>
                    <h5 className="retro text-xs sm:text-sm font-bold tracking-wide">
                      {item.name}
                    </h5>
                    <p className="retro mb-3 text-[7px] sm:text-[8px] text-neutral-400">
                      {item.role}
                    </p>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className="h-4 w-4"
                          style={{
                            fill: item.color,
                            color: item.color,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

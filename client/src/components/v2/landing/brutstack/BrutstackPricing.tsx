"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";

interface BrutstackPricingProps {
  onSelectPlan?: (plan: string) => void;
}

export function BrutstackPricing({ onSelectPlan }: BrutstackPricingProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");

  const plans = [
    {
      id: "initiate",
      name: "INITIATE (E-RANK)",
      description: "Solo baseline habit tracking.",
      monthlyPrice: "$0",
      yearlyPrice: "$0",
      buttonText: "AWAKEN AS INITIATE",
      buttonVariant: "outline",
      color: "#f9f4da",
      popular: false,
      features: [
        "3 Daily Quests",
        "E-Rank Hunter License",
        "Volume Tracking",
        "1 Class Archetype",
        "Community Guilds",
      ],
    },
    {
      id: "monarch",
      name: "SHADOW MONARCH",
      description: "Full RPG power & biometric mastery.",
      monthlyPrice: "$12",
      yearlyPrice: "$9",
      buttonText: "START 14-DAY TRIAL",
      buttonVariant: "solid",
      color: "#ff3333",
      popular: true,
      features: [
        "Unlimited Quests & Lifts",
        "16-Muscle Heatmap",
        "20-Floor Tower Gauntlet",
        "Dragon Incubator System",
        "AIRA Neural Co-Pilot",
        "Streak Freeze Shield",
        "Boss Breakthrough Arena",
        "Priority Raid Access",
      ],
    },
    {
      id: "guildmaster",
      name: "GUILD MASTER",
      description: "Multiplayer syndicates & raid squads.",
      monthlyPrice: "$29",
      yearlyPrice: "$24",
      buttonText: "FOUND A GUILD",
      buttonVariant: "outline",
      color: "#fcba28",
      popular: false,
      features: [
        "All Shadow Monarch Perks",
        "Host Guild Raids",
        "Party Multipliers",
        "Custom Boss Encounters",
        "Infinite Data Retention",
        "Priority Compute Node",
        "Syndicate Emblems",
      ],
    },
    {
      id: "enterprise",
      name: "ACADEMY & TEAMS",
      description: "Collegiate squads & gym rosters.",
      monthlyPrice: "CUSTOM",
      yearlyPrice: "CUSTOM",
      buttonText: "CONTACT COMMAND",
      buttonVariant: "outline",
      color: "#22c55e",
      popular: false,
      features: [
        "All Guild Master Perks",
        "Multi-Roster Management",
        "Coach Command Console",
        "Biometric API Access",
        "Dedicated Officer",
        "Institutional SLA",
      ],
    },
  ];

  return (
    <section
      id="pricing"
      className="w-full bg-[#1a1a1a] px-4 py-16 lg:px-12 lg:py-28 text-[#f9f4da]"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4">
        {/* Badge */}
        <span className="retro font-bold inline-flex items-center py-2 mb-2 bg-[#ff3333] px-4 text-[9px] sm:text-[10px] text-[#1a1a1a] uppercase border-2 border-black shadow-[2px_2px_0_0_#000]">
          Hunter Licenses
        </span>

        {/* Heading */}
        <h2 className="retro text-2xl sm:text-3xl lg:text-4xl font-black text-center uppercase tracking-tight">
          Transparent Hunter <span className="text-[#ff3333]">Membership</span>
        </h2>
        <p className="retro mx-auto mb-4 max-w-2xl text-center text-[8px] sm:text-[9px] md:text-[10px] leading-relaxed text-neutral-400">
          Begin as an Initiate. Ascend to Shadow Monarch as you conquer your goals.
        </p>

        {/* Billing Switcher Toggle */}
        <div className="mb-14">
          <div className="relative inline-grid grid-cols-2 border-2 border-black bg-[#141414] shadow-[3px_3px_0_0_#000]">
            {/* Sliding background pill */}
            <div
              className={`absolute inset-y-0 w-1/2 bg-[#f9f4da] transition-transform duration-200 ease-in-out ${
                billingCycle === "yearly" ? "translate-x-full" : "translate-x-0"
              }`}
            />
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`retro relative z-10 flex items-center justify-center px-6 sm:px-8 py-3 text-[9px] sm:text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                billingCycle === "monthly" ? "text-black" : "text-[#f9f4da]"
              }`}
            >
              MONTHLY
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`retro relative z-10 flex items-center justify-center gap-2 px-6 sm:px-8 py-3 text-[9px] sm:text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                billingCycle === "yearly" ? "text-black" : "text-[#f9f4da]"
              }`}
            >
              YEARLY
              <span className="retro relative -top-px bg-[#0ca95b] px-1.5 py-0.5 text-[8px] font-bold whitespace-nowrap text-black border border-black shadow-[1px_1px_0_0_#000]">
                -25%
              </span>
            </button>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="flex h-min w-full flex-col items-stretch gap-8 overflow-visible lg:flex-row lg:items-stretch lg:gap-0 lg:-space-x-0.5">
          {plans.map((plan) => {
            const price =
              billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className="z-10 flex flex-1 basis-0 transition-transform duration-300 ease-in-out hover:-translate-x-2 hover:-translate-y-2"
              >
                <div className="group relative h-full w-full">
                  {/* Bottom Accent Layer */}
                  <div
                    className="absolute inset-0 z-0 border-2 border-black transform-gpu transition-transform duration-300 ease-out group-hover:translate-x-3.5 group-hover:translate-y-3.5"
                    style={{ backgroundColor: plan.color }}
                  />
                  {/* Middle Cream Layer */}
                  <div className="absolute inset-0 z-10 border-2 border-black bg-[#f9f4da] transform-gpu transition-transform duration-300 ease-out group-hover:translate-x-1.5 group-hover:translate-y-1.5" />
                  {/* Front Card */}
                  <div className="relative z-20 flex h-full flex-col border-2 border-black bg-[#1a1a1a] shadow-none">
                    {/* Most Popular Banner */}
                    {plan.popular ? (
                      <span className="retro block border-b-2 border-black bg-[#ff3333] py-2 text-center text-[8px] sm:text-[9px] font-black text-[#f9f4da] uppercase tracking-wider">
                        Most Popular Rank
                      </span>
                    ) : (
                      <div
                        className="h-1 w-full"
                        style={{ backgroundColor: plan.color }}
                      />
                    )}

                    <div className="flex grow flex-col gap-4 p-5 lg:p-6">
                      <h3 className="retro text-xs sm:text-sm font-black tracking-wider uppercase">
                        {plan.name}
                      </h3>
                      <p className="retro text-[8px] sm:text-[9px] leading-relaxed text-neutral-400 min-h-[2.5rem]">
                        {plan.description}
                      </p>

                      <div className="flex items-baseline gap-2 py-2">
                        <p className="retro text-2xl lg:text-3xl font-black">
                          {price}
                        </p>
                        {price !== "CUSTOM" && (
                          <p className="retro text-[8px] sm:text-[9px] text-neutral-400">/mo</p>
                        )}
                      </div>

                      {/* CTA Button */}
                      <button
                        type="button"
                        onClick={() => onSelectPlan?.(plan.id)}
                        className={`retro cursor-pointer flex items-center justify-center border-2 border-black px-4 lg:px-6 py-3.5 text-[9px] sm:text-[10px] font-black tracking-widest uppercase transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0.5 ${
                          plan.buttonVariant === "solid"
                            ? "bg-[#f9f4da] text-[#1a1a1a] hover:bg-white shadow-[2px_2px_0_0_#000]"
                            : "bg-transparent text-[#f9f4da] hover:bg-neutral-800"
                        }`}
                      >
                        {plan.buttonText}
                      </button>

                      {/* Feature Checklist */}
                      <ul className="grow space-y-3.5 pt-4 border-t-2 border-neutral-800">
                        {plan.features.map((feature, i) => (
                          <li
                            key={i}
                            className="retro flex items-center gap-2.5 text-[8px] sm:text-[9px] font-medium text-neutral-300 leading-normal"
                          >
                            <Check
                              className="h-4 w-4 shrink-0"
                              strokeWidth={3}
                              style={{ color: plan.color }}
                            />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

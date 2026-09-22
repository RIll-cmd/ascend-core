import React from "react";
import { cn } from "@/lib/utils";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/8bit/accordion";

import "@/components/ui/8bit/styles/retro.css";

export interface FAQItem {
  answer: string;
  question: string;
}

export interface FAQ1Props {
  className?: string;
  description?: string;
  items?: FAQItem[];
  title?: string;
  badge?: string;
}

const defaultAscendFAQItems: FAQItem[] = [
  {
    question: "How does Ascend Core convert workouts into RPG combat power?",
    answer:
      "Lifting tonnage, cardio volume, and sleep telemetry directly power your STR, AGI, and STA attributes to slay dungeon bosses.",
  },
  {
    question: "Is there a free tier for Solo Hunters?",
    answer:
      "Yes. The E-Rank Initiate license is free forever. Track habits, volume, and rank progression with zero credit card needed.",
  },
  {
    question: "How do Guild Dungeons and Boss Raids work?",
    answer:
      "Form 50-hunter syndicates. Shared streak momentum charges your Guild Artifact to battle weekly world bosses for legendary loot.",
  },
  {
    question: "What happens if I miss a daily habit or workout streak?",
    answer:
      "No brutal resets. Deploy Streak Shields or complete 48-hour penalty recovery trials to protect your rank multiplier.",
  },
  {
    question: "Can I export my telemetry and cancel anytime?",
    answer:
      "Always. Export full telemetry data in JSON anytime. Cancel memberships instantly with one click.",
  },
];

export function FAQ1({
  title = "FREQUENTLY ASKED QUESTIONS",
  description = "Key answers on combat power, hunter guilds, and system mechanics.",
  badge = "// HUNTER CODEX // INTEL",
  items = defaultAscendFAQItems,
  className,
}: FAQ1Props) {
  return (
    <section className={cn("w-full px-4 py-16 lg:py-24", className)}>
      <div className="mx-auto max-w-3xl">
        {(title || description || badge) && (
          <div className="mb-10 text-center">
            {badge && (
              <div className="retro mb-3 inline-flex items-center gap-1.5 border border-black bg-[#fcba28] px-3 py-0.5 text-[8px] sm:text-[9px] font-black uppercase text-black shadow-[1px_1px_0_0_#000]">
                {badge}
              </div>
            )}
            {title && (
              <h2 className="retro mb-3 font-bold text-xl tracking-tight text-white md:text-2xl lg:text-3xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="retro mx-auto max-w-xl text-[8px] sm:text-[9px] md:text-[10px] text-neutral-400 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}

        <Accordion type="single" collapsible className="w-full space-y-3">
          {items.map((item, idx) => (
            <AccordionItem
              key={item.question}
              value={`faq-${idx}`}
              className="border-2 border-black bg-[#141414] px-4 py-1 shadow-[4px_4px_0_0_#000] transition-colors hover:border-[#fcba28]"
            >
              <AccordionTrigger
                font="retro"
                className="retro text-left text-[9px] sm:text-[10px] md:text-xs text-white hover:no-underline hover:text-[#fcba28] transition-colors py-3"
              >
                {item.question}
              </AccordionTrigger>
              <AccordionContent
                font="retro"
                className="retro text-[8px] sm:text-[9px] md:text-[10px] leading-relaxed text-neutral-300 pb-3 pt-1 border-t border-neutral-800/80"
              >
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export default FAQ1;

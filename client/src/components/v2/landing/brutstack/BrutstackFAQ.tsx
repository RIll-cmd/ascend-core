"use client";

import React from "react";
import { FAQ1 } from "@/components/ui/8bit";

export function BrutstackFAQ() {
  return (
    <section
      id="faq"
      className="w-full border-t-2 border-black bg-[#161616] text-[#f9f4da] scroll-mt-20"
    >
      <FAQ1
        badge="// HUNTER CODEX // INTEL"
        title="FREQUENTLY ASKED QUESTIONS"
        description="Key answers on combat power, hunter guilds, and system mechanics."
        className="max-w-4xl mx-auto py-16 lg:py-24"
      />
    </section>
  );
}

export default BrutstackFAQ;

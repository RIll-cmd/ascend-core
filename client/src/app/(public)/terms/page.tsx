import React from "react";
import Link from "next/link";
import { ArrowLeft, Scale, ShieldAlert, Coins, BookOpen, FileCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Ascend OS",
  description: "Terms of service, user agreements, digital asset policies, and governing law for the Ascend OS platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen w-full bg-[#0B1020] text-white selection:bg-purple-500/30 selection:text-purple-200">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono font-medium text-slate-400 hover:text-purple-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO NEXUS</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 bg-purple-950/40 border border-purple-500/30 px-3 py-1 rounded-full">
            <Scale className="w-3.5 h-3.5" />
            <span>BINDING USER COVENANT</span>
          </div>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-slate-400 text-xs font-mono mb-4">
            <FileCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>SERVICE AGREEMENT // VERSION 2.0</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white font-heading">
            TERMS OF SERVICE
          </h1>
          <p className="text-sm md:text-base text-slate-400 mt-3 font-sans leading-relaxed">
            By accessing or operating the Ascend OS platform, you agree to be bound by these Terms of Service. Please read them thoroughly before initializing your character journey.
          </p>
        </div>

        {/* Policy Body */}
        <div className="space-y-10 text-sm text-slate-300 leading-relaxed font-sans">
          {/* Section 1 */}
          <section className="p-6 rounded-2xl bg-[#12182E]/80 border border-white/10 shadow-xl backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2.5 mb-3">
              <BookOpen className="w-5 h-5 text-purple-400" />
              1. Acceptance of Terms & Eligibility
            </h2>
            <p className="mb-3">
              Ascend OS provides a gamified habit tracking, cognitive discipline, and physical progression environment. You must be at least 13 years of age (or the age of legal majority in your territory) to operate an account.
            </p>
            <p>
              By registering an account or initiating guest session telemetry, you certify that all information provided is accurate and that your use adheres to all applicable regional laws.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-6 rounded-2xl bg-[#12182E]/80 border border-white/10 shadow-xl backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2.5 mb-3">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              2. Acceptable Conduct & System Integrity
            </h2>
            <p className="mb-3">
              Users agree to engage with the Ascend OS community and systems in good faith. You must not:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400 ml-2">
              <li>Deploy automated bots, scrapers, or exploits targeting our API endpoints or serverless boundaries.</li>
              <li>Attempt to reverse-engineer, decompile, or tamper with server-side stat calculations or progression engines.</li>
              <li>Engage in prompt injection, adversarial poisoning, or abuse of the AIRA tactical companion.</li>
              <li>Impersonate administrators, staff, or system identifiers.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="p-6 rounded-2xl bg-[#12182E]/80 border border-white/10 shadow-xl backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2.5 mb-3">
              <Coins className="w-5 h-5 text-amber-400" />
              3. Virtual Currencies, Items & Digital Progression
            </h2>
            <p className="mb-3">
              In-game currencies (Gold, Gems, Tower Tokens) and digital assets (Armor, Weapons, Beasts, Constellations) are non-transferable, virtual tokens of account progression with zero real-world cash equivalency:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400 ml-2">
              <li>Virtual currencies and items cannot be redeemed, sold, traded, or converted for real legal tender.</li>
              <li>Ascend OS retains full authority to adjust virtual economy balance coefficients, stat mechanics, and item stats to preserve gameplay integrity.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="p-6 rounded-2xl bg-[#12182E]/80 border border-white/10 shadow-xl backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2.5 mb-3">
              <Scale className="w-5 h-5 text-cyan-400" />
              4. Governing Law & Binding Arbitration
            </h2>
            <p className="mb-3">
              These Terms shall be governed by and construed in accordance with standard legal principles of corporate venue, without regard to conflicts of law provisions.
            </p>
            <p className="text-slate-400">
              Any dispute arising from these Terms or your use of the platform shall be resolved through binding, individual arbitration rather than court proceedings, waiving any right to participate in class-action lawsuits.
            </p>
          </section>

          {/* Section 5 */}
          <section className="p-6 rounded-2xl bg-[#12182E]/80 border border-white/10 shadow-xl backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white font-heading mb-2">
              5. Termination and Amendments
            </h2>
            <p className="text-slate-400">
              We reserve the right to suspend or terminate accounts in violation of these Terms. Updates to this agreement will be published with an updated revision date. Continued usage constitutes acceptance of modified terms.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-4">
          <div>© {new Date().getFullYear()} ASCEND OS ARCHITECTURE. ALL RIGHTS RESERVED.</div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">PRIVACY POLICY</Link>
            <Link href="/refund" className="hover:text-slate-300 transition-colors">REFUND POLICY</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

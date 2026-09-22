import React from "react";
import Link from "next/link";
import { ArrowLeft, Receipt, CheckCircle, AlertTriangle, HelpCircle, FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Ascend OS",
  description: "Official refund terms, digital goods delivery policies, and cancellation procedures for Ascend OS.",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen w-full bg-[#0B1020] text-white selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -left-40 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono font-medium text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO NEXUS</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-950/40 border border-amber-500/30 px-3 py-1 rounded-full">
            <Receipt className="w-3.5 h-3.5" />
            <span>COMMERCE GUARANTEE</span>
          </div>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-slate-400 text-xs font-mono mb-4">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>BILLING DEFENSE // PROTOCOL 1.8</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white font-heading">
            REFUND & CANCELLATION POLICY
          </h1>
          <p className="text-sm md:text-base text-slate-400 mt-3 font-sans leading-relaxed">
            Transparent, straightforward commerce terms governing digital goods, season pass subscriptions, and payment dispute procedures.
          </p>
        </div>

        {/* Policy Body */}
        <div className="space-y-10 text-sm text-slate-300 leading-relaxed font-sans">
          {/* Section 1 */}
          <section className="p-6 rounded-2xl bg-[#12182E]/80 border border-white/10 shadow-xl backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2.5 mb-3">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              1. 14-Day Money-Back Guarantee for Subscriptions
            </h2>
            <p className="mb-3">
              We stand behind the craftsmanship of Ascend OS. If you purchase an Ascend OS Premium Tier or Season Pass subscription and find it unsuitable for your discipline regimen:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400 ml-2">
              <li>You may request a full, no-questions-asked refund within <strong className="text-white">14 days</strong> of your initial subscription purchase.</li>
              <li>Refund requests processed within the 14-day window will be credited back to your original payment method within 5 to 7 business days.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="p-6 rounded-2xl bg-[#12182E]/80 border border-white/10 shadow-xl backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2.5 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              2. Digital Consumables & In-Game Goods
            </h2>
            <p className="mb-3">
              Due to the immediate delivery and immutable nature of in-game consumable items:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400 ml-2">
              <li>Purchases of virtual currency bundles (e.g. Gems) or consumable buffs that have already been expended or allocated in gameplay are non-refundable.</li>
              <li>If an item purchase fails to credit to your account inventory due to a technical anomaly, our support team will manually reconcile the transaction or refund the charge immediately.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="p-6 rounded-2xl bg-[#12182E]/80 border border-white/10 shadow-xl backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2.5 mb-3">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
              3. Cancellation Procedures
            </h2>
            <p className="mb-3">
              You can cancel recurring subscriptions at any time directly through your Account Settings with zero cancellation fees:
            </p>
            <p className="text-slate-400">
              Upon cancellation, your premium tier features remain active through the end of the current paid billing cycle. You will not be billed for subsequent renewal intervals.
            </p>
          </section>

          {/* Section 4 */}
          <section className="p-6 rounded-2xl bg-[#12182E]/80 border border-white/10 shadow-xl backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white font-heading mb-2">
              4. How to Submit a Refund Request
            </h2>
            <p className="text-slate-400">
              To request a refund, transmit your account identifier, email address, and order receipt reference to:{" "}
              <a href="mailto:billing@ascend-os.neural" className="text-amber-400 underline hover:text-amber-300">
                billing@ascend-os.neural
              </a>
              . All requests receive an audited response within 24 operational hours.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-4">
          <div>© {new Date().getFullYear()} ASCEND OS ARCHITECTURE. ALL RIGHTS RESERVED.</div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">PRIVACY POLICY</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">TERMS OF SERVICE</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

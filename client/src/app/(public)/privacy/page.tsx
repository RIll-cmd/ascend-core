import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Database, Lock, Eye, RefreshCw, FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Ascend OS",
  description: "Comprehensive privacy policy, data collection standards, subprocessors, and GDPR/CCPA data rights for Ascend OS.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen w-full bg-[#0B1020] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -left-40 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[160px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono font-medium text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO NEXUS</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>GDPR & CCPA COMPLIANT</span>
          </div>
        </div>

        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-slate-400 text-xs font-mono mb-4">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>LEGAL PROTOCOL SPECIFICATION // REV 2.4</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white font-heading">
            PRIVACY POLICY
          </h1>
          <p className="text-sm md:text-base text-slate-400 mt-3 font-sans leading-relaxed">
            Effective Date: September 2026. This Privacy Policy governs your use of the Ascend OS platform, detailing our data minimization practices, subprocessor ecosystem, and your statutory data protection rights.
          </p>
        </div>

        {/* Policy Body */}
        <div className="space-y-10 text-sm text-slate-300 leading-relaxed font-sans">
          {/* Section 1 */}
          <section className="p-6 rounded-2xl bg-[#12182E]/80 border border-white/10 shadow-xl backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2.5 mb-3">
              <Database className="w-5 h-5 text-cyan-400" />
              1. Information We Collect (Data Minimization)
            </h2>
            <p className="mb-3">
              Ascend OS practices strict data minimization. We only collect information essential to providing progression telemetry and securing your account:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400 ml-2">
              <li><strong className="text-slate-200">Account Credentials:</strong> Username, email address (optional for guest tier), and securely salted password hashes. We never store plain-text passwords.</li>
              <li><strong className="text-slate-200">Progression & Gameplay State:</strong> Character level, habits, workout telemetry, skill constellation allocations, and in-game inventory logs.</li>
              <li><strong className="text-slate-200">Technical Diagnostics:</strong> IP address (utilized strictly for rate limiting and fraud deterrence via SlowAPI), browser user-agent, and error crash logs.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="p-6 rounded-2xl bg-[#12182E]/80 border border-white/10 shadow-xl backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2.5 mb-3">
              <Eye className="w-5 h-5 text-purple-400" />
              2. Cookies and Tracking Mechanisms
            </h2>
            <p className="mb-3">
              We employ strictly essential and operational cookies. We do not sell your personal data or utilize intrusive third-party cross-site advertising trackers:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400 ml-2">
              <li><strong className="text-slate-200">ascend_session:</strong> An encrypted, HttpOnly, SameSite=Lax session token used exclusively to maintain your authenticated status across page requests.</li>
              <li><strong className="text-slate-200">ascend_cookie_consent:</strong> A client-side preference record storing your consent selection for analytics telemetry.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="p-6 rounded-2xl bg-[#12182E]/80 border border-white/10 shadow-xl backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2.5 mb-3">
              <Lock className="w-5 h-5 text-emerald-400" />
              3. Subprocessors & Infrastructure Disclosures
            </h2>
            <p className="mb-3">
              Your data is processed and stored across hardened, enterprise-grade cloud infrastructure:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                <div className="font-bold text-white font-heading">Vercel Inc.</div>
                <div className="text-xs text-slate-400 mt-1">Hosting provider for frontend static assets and serverless execution (Region: sin1).</div>
              </div>
              <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                <div className="font-bold text-white font-heading">Neon Inc.</div>
                <div className="text-xs text-slate-400 mt-1">Serverless PostgreSQL persistence provider with connection pooling (AWS ap-southeast-1).</div>
              </div>
              <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                <div className="font-bold text-white font-heading">Google Cloud / Gemini</div>
                <div className="text-xs text-slate-400 mt-1">AI engine for the AIRA Tactical Companion assistant. User prompts are stateless and not used for model retraining.</div>
              </div>
              <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                <div className="font-bold text-white font-heading">Resend Inc.</div>
                <div className="text-xs text-slate-400 mt-1">Transactional email delivery for 6-digit authentication verification ciphers (OTP).</div>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="p-6 rounded-2xl bg-[#12182E]/80 border border-white/10 shadow-xl backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2.5 mb-3">
              <RefreshCw className="w-5 h-5 text-amber-400" />
              4. Your Data Rights (GDPR & CCPA Enforcement)
            </h2>
            <p className="mb-3">
              Regardless of your jurisdiction, Ascend OS affords you complete sovereignty over your records:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400 ml-2">
              <li><strong className="text-slate-200">Right to Portability:</strong> You may download an automated, machine-readable JSON archive of all your personal records via <code className="text-xs font-mono bg-black/40 px-2 py-0.5 rounded text-cyan-300">GET /api/auth/export-data</code>.</li>
              <li><strong className="text-slate-200">Right to Erasure:</strong> You can permanently delete your account and all associated characters, habits, and telemetry at any time via your Account Settings or <code className="text-xs font-mono bg-black/40 px-2 py-0.5 rounded text-rose-300">DELETE /api/auth/account</code>.</li>
              <li><strong className="text-slate-200">Minors' Protection (COPPA):</strong> Ascend OS is not intended for individuals under 13 years of age. We do not knowingly collect records from minors.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="p-6 rounded-2xl bg-[#12182E]/80 border border-white/10 shadow-xl backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white font-heading mb-2">
              5. Contact & Data Protection Inquiries
            </h2>
            <p className="text-slate-400">
              For questions, privacy escalations, or data protection officer inquiries, contact our security gateway at:{" "}
              <a href="mailto:privacy@ascend-os.neural" className="text-cyan-400 underline hover:text-cyan-300">
                privacy@ascend-os.neural
              </a>
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-4">
          <div>© {new Date().getFullYear()} ASCEND OS ARCHITECTURE. ALL RIGHTS RESERVED.</div>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-slate-300 transition-colors">TERMS OF SERVICE</Link>
            <Link href="/refund" className="hover:text-slate-300 transition-colors">REFUND POLICY</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

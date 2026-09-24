"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type ComponentType, type CSSProperties } from "react";
import { ArrowRight, Check, Sparkles, Swords } from "lucide-react";
import {
  BrutstackFAQ,
  BrutstackFeatures,
  BrutstackFooter,
  BrutstackHero,
  BrutstackNavbar,
} from "@/components/v2/landing/brutstack";
import { AuthSection } from "@/components/v2/landing/AuthSection";
import type { AuthTabState } from "@/components/v2/auth/AuthCard";
import {
  FeatureModal,
  type FeatureType,
} from "@/components/v2/landing/FeatureModal";
import ChapterIntro from "@/components/ui/8bit/blocks/chapter-intro";
import DuelBlock, {
  type Fighter,
} from "@/components/ui/8bit/blocks/duel-block";
import Feature1 from "@/components/ui/8bit/blocks/feature1";
import PortalTransition from "@/components/ui/8bit/blocks/portal-transition";
import { GuestAccessDialog } from "@/components/auth/GuestAccessDialog";
import styles from "./landing.module.css";

type TimelineStep = {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  accent: string;
  icon: ComponentType<{ className?: string; style?: CSSProperties }>;
};

const ASCENSION_STEPS: TimelineStep[] = [
  {
    number: "01",
    eyebrow: "CAPTURE",
    title: "LOG THE REAL WORK",
    description:
      "Record training volume, deep-work sessions, recovery, and the habits that keep the chain alive.",
    accent: "#14b6e5",
    icon: Swords,
  },
  {
    number: "02",
    eyebrow: "CONVERT",
    title: "REALITY BECOMES XP",
    description:
      "Every verified action feeds your attributes, streaks, hunter rank, and progression economy.",
    accent: "#00ff88",
    icon: Check,
  },
  {
    number: "03",
    eyebrow: "CHALLENGE",
    title: "FACE THE NEXT GATE",
    description:
      "Use your earned power against tower floors, world bosses, quests, and personal benchmarks.",
    accent: "#ff3344",
    icon: Swords,
  },
  {
    number: "04",
    eyebrow: "ASCEND",
    title: "AWAKEN A NEW RANK",
    description:
      "Review the signal, sharpen the system, and begin the next campaign stronger than before.",
    accent: "#fcba28",
    icon: Sparkles,
  },
];

const HUNTER_FIGHTER = {
  name: "Ascend Hunter",
  subtitle: "Rank E // Awakening",
  image: "/avatars/player-front.png",
  hp: 140,
  maxHp: 140,
} satisfies Fighter;

const BOSS_FIGHTER = {
  name: "Nightborne Lord",
  subtitle: "Tower Gatekeeper // Floor 20",
  image: "/sprites/static/nightborne.png",
  hp: 240,
  maxHp: 240,
  isBoss: true,
} satisfies Fighter;

function AscensionTimeline() {
  return (
    <section
      id="how-it-works"
      data-landing-block="timeline"
      className="border-y-2 border-black bg-[#101010] px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className={styles.sectionBadge}>{"// ASCENSION LOOP"}</span>
          <h2 className="mt-5 text-4xl leading-[0.9] text-[#f9f4da] sm:text-6xl lg:text-7xl">
            TURN YOUR DAY INTO A CAMPAIGN
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-neutral-400 sm:text-lg">
            One clear loop connects the work you do in reality to the hunter you
            build inside Ascend Core.
          </p>
        </div>

        <ol className={styles.timeline}>
          {ASCENSION_STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li className={styles.timelineStep} key={step.number}>
                <div
                  className={styles.timelineNode}
                  style={{ "--step-accent": step.accent } as CSSProperties}
                  aria-hidden="true"
                >
                  {step.number}
                </div>
                <article
                  className={styles.timelineCard}
                  style={{ "--step-accent": step.accent } as CSSProperties}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[9px] tracking-[0.18em]" style={{ color: step.accent }}>
                      {step.eyebrow}
                    </span>
                    <Icon className="h-5 w-5" style={{ color: step.accent }} />
                  </div>
                  <h3 className="mt-4 text-2xl text-[#f9f4da] sm:text-3xl">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-400 sm:text-base">
                    {step.description}
                  </p>
                  <span className="mt-5 block text-[8px] text-neutral-600">
                    PROTOCOL {index + 1}/4 // VERIFIED
                  </span>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function BossShowcase({ onExploreSystems }: { onExploreSystems: () => void }) {
  return (
    <section
      data-landing-block="boss-duel"
      className="bg-[#181818] px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24"
    >
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div>
          <span className={styles.sectionBadge}>{"// LIVE COMBAT INSTANCE"}</span>
          <h2 className="mt-5 text-4xl leading-[0.92] text-[#f9f4da] sm:text-6xl">
            YOUR DISCIPLINE HAS TEETH
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-400 sm:text-lg">
            Habits are not decorative checkmarks. They become combat power for
            tower climbs, boss raids, and the benchmarks that prove your build.
          </p>

          <div data-mobile-stack-grid className="mt-8 grid grid-cols-3 gap-3">
            {[
              ["20+", "TOWER FLOORS", "#14b6e5"],
              ["19", "LINKED SYSTEMS", "#00ff88"],
              ["∞", "BOSS ATTEMPTS", "#fcba28"],
            ].map(([value, label, accent]) => (
              <div className={styles.metricTile} key={label}>
                <strong style={{ color: accent }}>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <button className={styles.textAction} type="button" onClick={onExploreSystems}>
            INSPECT THE FULL ARSENAL <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className={styles.duelFrame}>
          <DuelBlock
            leftFighter={HUNTER_FIGHTER}
            rightFighter={BOSS_FIGHTER}
            interactive
            className="border-black bg-[#130f0b] shadow-none"
          />
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [selectedFeature, setSelectedFeature] = useState<FeatureType>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGuestDialogOpen, setIsGuestDialogOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"specs" | "preview">("specs");
  const [authTab, setAuthTab] = useState<AuthTabState>("login");

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
    element.scrollIntoView({ behavior, block: "start" });
  };

  const scrollToAuth = (tab: AuthTabState = "login") => {
    setAuthTab(tab);
    const element = document.getElementById("auth-section");
    if (element) {
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth";
      element.scrollIntoView({ behavior, block: "start" });
      return;
    }
    router.push(tab === "register" ? "/register" : "/login");
  };

  const openFeature = (feature: string | FeatureType) => {
    setSelectedFeature(feature as FeatureType);
    setModalTab("specs");
    setIsModalOpen(true);
  };

  const previewFeature = (feature: string | FeatureType) => {
    setSelectedFeature(feature as FeatureType);
    setModalTab("preview");
    setIsModalOpen(true);
  };

  const handleGuestAccess = () => {
    setIsGuestDialogOpen(true);
  };

  return (
    <div
      suppressHydrationWarning
      data-landing-fonts="8bitcn"
      className={`${styles.landing} relative flex min-h-screen w-full flex-col overflow-x-clip bg-[#1a1a1a] text-[#f9f4da] selection:bg-[#14b6e5] selection:text-black`}
    >
      <BrutstackNavbar
        onSignInClick={() => scrollToAuth("login")}
        onGetStartedClick={() => scrollToAuth("register")}
        onGuestClick={handleGuestAccess}
      />

      <div data-landing-block="hero">
        <BrutstackHero
          onStartBuilding={() => scrollToAuth("register")}
          onReadDocs={() => scrollTo("how-it-works")}
          onGuestClick={handleGuestAccess}
        />
      </div>

      <div data-landing-block="chapter-intro" className="bg-[#111] px-4 py-10 sm:px-6 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <ChapterIntro
            floorNumber={1}
            title="THE HUNTER PROTOCOL"
            subtitle="Your physical training, daily discipline, recovery, and focused work now belong to one living progression system."
            backgroundSrc="/backgrounds/stone_arena_diorama.jpg"
            align="left"
            height="sm"
            darken={0.78}
            className="border-black shadow-[6px_6px_0_0_#000]"
          />
        </div>
      </div>

      <BrutstackFeatures onSelectFeature={openFeature} />

      <div id="engine" data-landing-block="all-systems" className="scroll-mt-20">
        <Feature1
          onSelectFeature={openFeature}
          onPreviewFeature={previewFeature}
        />
      </div>

      <BossShowcase onExploreSystems={() => scrollTo("engine")} />
      <AscensionTimeline />

      <div data-landing-block="faq">
        <BrutstackFAQ />
      </div>

      <section id="cta" data-landing-block="portal" className="bg-[#0d0d0d] px-4 py-16 sm:px-6 sm:py-20 lg:px-12 lg:py-24">
        <div className={`${styles.portalStage} mx-auto max-w-5xl`}>
          <PortalTransition
            badge="ASCENSION GATE ONLINE"
            title="ENTER THE WORLD BEYOND YOUR CURRENT RANK"
            description="Create your hunter profile, connect the habits you already fight for, and begin your first tower campaign."
            primaryLabel="AWAKEN YOUR HUNTER"
            secondaryLabel="REVIEW ALL SYSTEMS"
            travelingText="OPENING COMMAND DECK..."
            realmName="ASCEND CORE"
            floorLevel={1}
            onEnter={() => scrollToAuth("register")}
            onChooseDestination={() => scrollTo("engine")}
            className={`${styles.portalBlock} border-black bg-[#151515] shadow-[7px_7px_0_0_#000]`}
          />
          <Image
            src="/landing/ascension-portal.png"
            alt="Blue crystal ascension portal"
            width={640}
            height={640}
            sizes="(max-width: 639px) 176px, 224px"
            draggable={false}
            data-portal-artwork="ascension-gate"
            className={styles.portalArtwork}
          />
        </div>
      </section>

      <div className="border-t-2 border-black bg-[#141414]">
        <AuthSection initialTab={authTab} onGuestEntry={handleGuestAccess} />
      </div>

      <div data-landing-block="footer">
        <BrutstackFooter />
      </div>

      <FeatureModal
        feature={selectedFeature}
        isOpen={isModalOpen}
        initialTab={modalTab}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedFeature(null);
        }}
      />

      <GuestAccessDialog open={isGuestDialogOpen} onOpenChange={setIsGuestDialogOpen} />
    </div>
  );
}

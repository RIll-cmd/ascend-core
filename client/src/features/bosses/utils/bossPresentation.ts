import type { Boss } from "../store/useBossStore";

export type BossThreatTone = "SILVER" | "STEEL" | "AMBER" | "GOLD" | "MONARCH";

export interface BossThreatPresentation {
  rank: "B" | "B+" | "A" | "A+" | "S";
  title: string;
  tone: BossThreatTone;
}

export interface BossArchetypePresentation {
  id: "LICH" | "COLOSSUS" | "LEVIATHAN" | "SHADE";
  title: string;
  domain: string;
}

const THREATS: Record<string, BossThreatPresentation> = {
  EASY: { rank: "B", title: "Lesser Demon", tone: "SILVER" },
  NORMAL: { rank: "B+", title: "Greater Demon", tone: "STEEL" },
  HARD: { rank: "A", title: "Dungeon Overlord", tone: "AMBER" },
  ELITE: { rank: "A+", title: "Apex Overlord", tone: "GOLD" },
  LEGENDARY: { rank: "S", title: "Monarch Calamity", tone: "MONARCH" },
};

const ARCHETYPES: Record<string, BossArchetypePresentation> = {
  LICH: { id: "LICH", title: "Procrastination Lich", domain: "Academic / Coding" },
  COLOSSUS: { id: "COLOSSUS", title: "Iron Colossus", domain: "Fitness / Strength" },
  LEVIATHAN: { id: "LEVIATHAN", title: "Abyssal Leviathan", domain: "Career / Long-term" },
  SHADE: { id: "SHADE", title: "Sloth Shade", domain: "Daily Habits / Routine" },
};

const LEGACY_REWARDS: Record<string, { gold: number; exp: number }> = {
  EASY: { gold: 500, exp: 1_000 },
  NORMAL: { gold: 1_200, exp: 2_500 },
  HARD: { gold: 3_000, exp: 7_500 },
  ELITE: { gold: 7_500, exp: 15_000 },
  LEGENDARY: { gold: 20_000, exp: 35_000 },
};

export function getBossThreat(difficulty: string): BossThreatPresentation {
  return THREATS[difficulty.toUpperCase()] ?? THREATS.NORMAL;
}

export function getBossArchetype(boss: Boss): BossArchetypePresentation {
  const explicit = boss.archetype?.toUpperCase();
  if (explicit && ARCHETYPES[explicit]) return ARCHETYPES[explicit];

  const category = boss.category.toUpperCase();
  if (category === "ACADEMIC") return ARCHETYPES.LICH;
  if (category === "FITNESS") return ARCHETYPES.COLOSSUS;
  if (category === "CAREER" || category === "PROJECT") return ARCHETYPES.LEVIATHAN;
  return ARCHETYPES.SHADE;
}

export function getBossRewards(boss: Boss) {
  const fallback = LEGACY_REWARDS[boss.difficulty.toUpperCase()] ?? LEGACY_REWARDS.NORMAL;
  return {
    gold: boss.rewardGold ?? fallback.gold,
    exp: boss.rewardExp ?? fallback.exp,
    title: boss.rewardTitle,
    tribute: boss.realWorldReward,
  };
}

export function getBossPhase(boss: Boss) {
  const maximumHp = Math.max(1, boss.maxHp);
  const currentHp = Math.max(0, Math.min(boss.currentHp, maximumHp));
  const damageDealt = maximumHp - currentHp;
  const phases = [...boss.phases].sort((left, right) => left.orderIndex - right.orderIndex);

  if (boss.status === "DEFEATED") {
    return {
      activeIndex: Math.max(0, phases.length - 1),
      damageDealt,
      name: "Seal Broken",
      percentRemaining: 0,
    };
  }

  let threshold = 0;
  let activeIndex = 0;
  for (let index = 0; index < phases.length; index += 1) {
    threshold += phases[index].maxHp;
    if (damageDealt < threshold) {
      activeIndex = index;
      break;
    }
    activeIndex = Math.min(index + 1, Math.max(0, phases.length - 1));
  }

  return {
    activeIndex,
    damageDealt,
    name: phases[activeIndex]?.name ?? "Initiation",
    percentRemaining: (currentHp / maximumHp) * 100,
  };
}

export type BossDeadlineState = "NONE" | "STABLE" | "APPROACHING" | "BREACHED";

export function getBossDeadline(deadline: string | null, now = new Date()) {
  if (!deadline) return { date: null, state: "NONE" as const };
  const date = new Date(deadline);
  const remainingMs = date.getTime() - now.getTime();
  if (remainingMs < 0) return { date, state: "BREACHED" as const };
  if (remainingMs <= 3 * 24 * 60 * 60 * 1_000) {
    return { date, state: "APPROACHING" as const };
  }
  return { date, state: "STABLE" as const };
}

export function getBossSummary(bosses: Boss[]) {
  return bosses.reduce(
    (summary, boss) => {
      if (boss.status === "ACTIVE") {
        summary.activeContracts += 1;
        summary.remainingHp += Math.max(0, boss.currentHp);
        summary.damageSources += boss.activities.length;
      } else if (boss.status === "DEFEATED") {
        summary.conquered += 1;
      }
      return summary;
    },
    { activeContracts: 0, remainingHp: 0, conquered: 0, damageSources: 0 },
  );
}

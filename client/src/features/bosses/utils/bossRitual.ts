import type { CreateBossPayload } from "../store/useBossStore";

export type BossArchetypeId = "LICH" | "COLOSSUS" | "LEVIATHAN" | "SHADE";
export type BossThreatRank = "B" | "A" | "S";

export interface BossSystemRewards {
  gold: number;
  exp: number;
  title: string;
}

export interface BossRitualState {
  archetype: BossArchetypeId;
  rank: BossThreatRank;
  name: string;
  description: string;
  totalHp: number;
  rewards: BossSystemRewards;
  realWorldReward: string;
  deadline?: Date;
}

export const THREAT_RANKS = {
  B: {
    difficulty: "EASY",
    minHp: 1_000,
    hp: 5_000,
    damage: 500,
    rewards: { gold: 500, exp: 1_000 },
    rewardCaps: { gold: 1_000, exp: 2_000 },
  },
  A: {
    difficulty: "HARD",
    minHp: 10_000,
    hp: 25_000,
    damage: 1_000,
    rewards: { gold: 3_000, exp: 7_500 },
    rewardCaps: { gold: 6_000, exp: 15_000 },
  },
  S: {
    difficulty: "LEGENDARY",
    minHp: 100_000,
    hp: 100_000,
    damage: 1_500,
    rewards: { gold: 20_000, exp: 35_000 },
    rewardCaps: { gold: 40_000, exp: 70_000 },
  },
} as const satisfies Record<BossThreatRank, object>;

export const ARCHETYPE_CATEGORIES: Record<BossArchetypeId, string> = {
  LICH: "ACADEMIC",
  COLOSSUS: "FITNESS",
  LEVIATHAN: "CAREER",
  SHADE: "HABITS",
};

export function createInitialRitualState(): BossRitualState {
  const rank = THREAT_RANKS.B;
  return {
    archetype: "LICH",
    rank: "B",
    name: "",
    description: "",
    totalHp: rank.hp,
    rewards: { ...rank.rewards, title: "" },
    realWorldReward: "",
  };
}

export function applyThreatRank(
  state: BossRitualState,
  rank: BossThreatRank,
): BossRitualState {
  const calibration = THREAT_RANKS[rank];
  return {
    ...state,
    rank,
    totalHp: calibration.hp,
    rewards: { ...calibration.rewards, title: state.rewards.title },
  };
}

export function toCreateBossPayload(
  state: BossRitualState,
  selectedHabitIds: string[],
): CreateBossPayload {
  const threat = THREAT_RANKS[state.rank];
  const optionalText = (value: string) => value.trim() || undefined;

  return {
    name: state.name.trim(),
    description: optionalText(state.description),
    archetype: state.archetype,
    category: ARCHETYPE_CATEGORIES[state.archetype],
    difficulty: threat.difficulty,
    maxHp: state.totalHp,
    rewardGold: state.rewards.gold,
    rewardExp: state.rewards.exp,
    rewardTitle: optionalText(state.rewards.title),
    realWorldReward: optionalText(state.realWorldReward),
    ...(state.deadline ? { deadline: state.deadline.toISOString() } : {}),
    activities: selectedHabitIds.map((referenceId) => ({
      activityType: "HABIT",
      referenceId,
      damageValue: threat.damage,
    })),
  };
}

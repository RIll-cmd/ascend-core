import { describe, expect, it } from "vitest";
import {
  applyThreatRank,
  createInitialRitualState,
  toCreateBossPayload,
} from "./bossRitual";

describe("boss ritual state", () => {
  it("calibrates HP and system spoils when the threat rank changes", () => {
    const initial = createInitialRitualState();

    expect(initial.rank).toBe("B");
    expect(initial.totalHp).toBe(5_000);
    expect(initial.rewards).toEqual({ gold: 500, exp: 1_000, title: "" });

    expect(applyThreatRank(initial, "A")).toMatchObject({
      rank: "A",
      totalHp: 25_000,
      rewards: { gold: 3_000, exp: 7_500, title: "" },
    });
  });

  it("maps ritual selections to the compatible boss API contract", () => {
    const state = {
      ...applyThreatRank(createInitialRitualState(), "S"),
      archetype: "LEVIATHAN" as const,
      name: "Ship the platform",
      description: "Complete the year-long product milestone.",
      totalHp: 125_000,
      rewards: { gold: 24_000, exp: 40_000, title: "The Unbroken" },
      realWorldReward: "Weekend trip",
    };

    expect(toCreateBossPayload(state, ["habit-1"])).toEqual({
      name: "Ship the platform",
      description: "Complete the year-long product milestone.",
      archetype: "LEVIATHAN",
      category: "CAREER",
      difficulty: "LEGENDARY",
      maxHp: 125_000,
      rewardGold: 24_000,
      rewardExp: 40_000,
      rewardTitle: "The Unbroken",
      realWorldReward: "Weekend trip",
      activities: [
        { activityType: "HABIT", referenceId: "habit-1", damageValue: 1_500 },
      ],
    });
  });

  it("omits blank optional relic inscriptions from the payload", () => {
    const state = {
      ...createInitialRitualState(),
      name: "Read the source material",
      description: "   ",
      realWorldReward: " ",
    };

    expect(toCreateBossPayload(state, [])).toMatchObject({
      description: undefined,
      rewardTitle: undefined,
      realWorldReward: undefined,
    });
  });
});

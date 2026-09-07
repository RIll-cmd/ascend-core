import { describe, expect, it } from "vitest";
import type { Boss } from "../store/useBossStore";
import {
  getBossArchetype,
  getBossDeadline,
  getBossPhase,
  getBossRewards,
  getBossSummary,
  getBossThreat,
} from "./bossPresentation";

const makeBoss = (overrides: Partial<Boss> = {}): Boss => ({
  id: "boss-1",
  name: "Complete the release",
  description: "Ship the production milestone.",
  category: "CAREER",
  difficulty: "HARD",
  archetype: "LEVIATHAN",
  maxHp: 1_000,
  currentHp: 600,
  rewardGold: null,
  rewardExp: null,
  rewardTitle: null,
  realWorldReward: null,
  deadline: null,
  status: "ACTIVE",
  createdAt: "2026-09-01T00:00:00.000Z",
  phases: [
    { id: "p1", name: "Initiation", maxHp: 250, orderIndex: 1 },
    { id: "p2", name: "Development", maxHp: 250, orderIndex: 2 },
    { id: "p3", name: "Execution", maxHp: 250, orderIndex: 3 },
    { id: "p4", name: "Finalization", maxHp: 250, orderIndex: 4 },
  ],
  activities: [],
  damageLogs: [],
  ...overrides,
});

describe("boss threat presentation", () => {
  it("maps ritual and legacy difficulties into hunter ranks", () => {
    expect(getBossThreat("EASY")).toMatchObject({ rank: "B", title: "Lesser Demon" });
    expect(getBossThreat("NORMAL")).toMatchObject({ rank: "B+", title: "Greater Demon" });
    expect(getBossThreat("HARD")).toMatchObject({ rank: "A", title: "Dungeon Overlord" });
    expect(getBossThreat("ELITE")).toMatchObject({ rank: "A+", title: "Apex Overlord" });
    expect(getBossThreat("LEGENDARY")).toMatchObject({ rank: "S", title: "Monarch Calamity" });
  });

  it("infers an archetype for bosses created before ritual archetypes existed", () => {
    expect(getBossArchetype(makeBoss({ archetype: null, category: "ACADEMIC" })).id).toBe("LICH");
    expect(getBossArchetype(makeBoss({ archetype: null, category: "FITNESS" })).id).toBe("COLOSSUS");
    expect(getBossArchetype(makeBoss({ archetype: null, category: "PROJECT" })).id).toBe("LEVIATHAN");
    expect(getBossArchetype(makeBoss({ archetype: null, category: "PERSONAL" })).id).toBe("SHADE");
  });
});

describe("boss contract presentation", () => {
  it("resolves the active phase from accumulated damage", () => {
    expect(getBossPhase(makeBoss())).toEqual({
      activeIndex: 1,
      damageDealt: 400,
      name: "Development",
      percentRemaining: 60,
    });
  });

  it("uses persisted spoils and falls back to the legacy reward table", () => {
    expect(getBossRewards(makeBoss({ rewardGold: 4_500, rewardExp: 9_000 }))).toEqual({
      gold: 4_500,
      exp: 9_000,
      title: null,
      tribute: null,
    });
    expect(getBossRewards(makeBoss({ difficulty: "NORMAL" }))).toMatchObject({
      gold: 1_200,
      exp: 2_500,
    });
  });

  it("classifies breached, approaching, and stable deadlines", () => {
    const now = new Date("2026-09-05T00:00:00.000Z");
    expect(getBossDeadline(null, now).state).toBe("NONE");
    expect(getBossDeadline("2026-09-04T00:00:00.000Z", now).state).toBe("BREACHED");
    expect(getBossDeadline("2026-09-07T00:00:00.000Z", now).state).toBe("APPROACHING");
    expect(getBossDeadline("2026-10-05T00:00:00.000Z", now).state).toBe("STABLE");
  });

  it("summarizes active contracts without counting archived bosses as conquests", () => {
    const bosses = [
      makeBoss({ id: "active", currentHp: 600, activities: [{ id: "a1", activityType: "HABIT", referenceId: "h1", damageValue: 500 }] }),
      makeBoss({ id: "won", status: "DEFEATED", currentHp: 0 }),
      makeBoss({ id: "archived", status: "ARCHIVED", currentHp: 300 }),
    ];

    expect(getBossSummary(bosses)).toEqual({
      activeContracts: 1,
      remainingHp: 600,
      conquered: 1,
      damageSources: 1,
    });
  });
});

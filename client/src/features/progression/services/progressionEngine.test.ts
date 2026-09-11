import { describe, it, expect, beforeEach, vi } from "vitest";
import { eventBus } from "./EventBus";
import { ProgressionEngine } from "./ProgressionEngine";
import { useCharacterStore } from "@/store/useCharacterStore";
import { useDailyBonusStore } from "@/store/useDailyBonusStore";

describe("Progression Engine & EventBus", () => {
  beforeEach(() => {
    // Reset daily bonus charges so tests don't inadvertently trigger 2x boost
    const today = new Date().toISOString().split("T")[0];
    useDailyBonusStore.setState({ lastResetDate: today, habitBoostCharges: 0 });

    // Reset character store to initial state
    useCharacterStore.setState({
      character: {
        id: "test-char",
        userId: "test-user",
        name: "Test Monarch",
        level: 1,
        exp: 0,
        power: 97,
        rank: "F",
        gold: 0,
        availableSP: 0,
        createdAt: new Date().toISOString(),
        stats: {
          id: "stats-1",
          characterId: "test-char",
          strength: 1,
          knowledge: 1,
          discipline: 1,
          focus: 1,
          endurance: 1,
          recovery: 1,
          consistency: 1,
        },
        history: [],
      },
    });
  });

  it("EventBus cleanly subscribes, publishes, and unsubscribes", () => {
    const listener = vi.fn();
    const unsubscribe = eventBus.subscribe("LEVEL_UP", listener);

    eventBus.publish("LEVEL_UP", { newLevel: 2 });
    expect(listener).toHaveBeenCalledWith({ newLevel: 2 });

    unsubscribe();
    eventBus.publish("LEVEL_UP", { newLevel: 3 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("ProgressionEngine processes MISSION_COMPLETED event and updates character stats, gold, and exp", () => {
    ProgressionEngine.getInstance().init();

    eventBus.publish("MISSION_COMPLETED", {
      baseReward: { exp: 50, gold: 20, stat: 5 },
      completionType: "NORMAL",
      habit: { name: "Daily Pushups", primaryStat: "strength" },
    });

    const state = useCharacterStore.getState();
    expect(state.character?.stats?.strength).toBe(6); // 1 + 5
    expect(state.character?.gold).toBe(20);
    expect(state.character?.exp).toBe(50);
  });

  it("publishes LEVEL_UP event when gainExp triggers level increase", () => {
    const levelUpListener = vi.fn();
    eventBus.subscribe("LEVEL_UP", levelUpListener);

    // Gain 100 EXP -> Level 1 requires 100 EXP -> triggers Level 2
    useCharacterStore.getState().gainExp(100, "Test level up");

    expect(levelUpListener).toHaveBeenCalledWith({ newLevel: 2 });
    expect(useCharacterStore.getState().character?.level).toBe(2);
  });
});

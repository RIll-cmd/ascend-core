import { create } from "zustand";
import { toast } from "sonner";
import { useCharacterStore } from "@/store/useCharacterStore";
import { API_BASE_URL } from "@/constants";

export interface TowerFloor {
  id: string;
  floorNumber: number;
  requiredPower: number;
  requiredStrength: number;
  requiredEndurance: number;
  requiredKnowledge: number;
  requiredRecovery: number;
  requiredFocus: number;
  requiredDiscipline: number;
  enemyId: string;
  isBoss: boolean;
  goldReward: number;
  expReward: number;
  gemReward?: number;
  towerTokensReward?: number;
  itemRewardDefinitionId: string | null;
  status: "LOCKED" | "AVAILABLE" | "ATTEMPTED" | "CLEARED";
  isEligible: boolean;
  attempts: number;
  bestClearTimeSeconds: number | null;
  clearedAt: string | null;
  enemy: {
    name: string;
    level: number;
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    weaknessStat: string | null;
    resistanceStat: string | null;
    icon: string | null;
    isBoss: boolean;
  };
}

export interface CombatEvent {
  turn: number;
  actor: string;
  action: string;
  damage: number;
  message: string;
}

export interface CombatLog {
  isVictory: boolean;
  turnsElapsed: number;
  playerHpRemaining: number;
  enemyHpRemaining: number;
  totalDamageDealt: number;
  events: CombatEvent[];
  rewards?: {
    gold: number;
    exp: number;
    gems?: number;
    towerTokens?: number;
    items: string[];
  };
}

interface TowerStore {
  floors: TowerFloor[];
  selectedFloor: TowerFloor | null;
  isLoading: boolean;
  isSimulating: boolean;
  isAnalyzing: boolean;
  combatLog: CombatLog | null;
  cielAnalysis: string | null;
  
  fetchFloors: (characterId: string) => Promise<void>;
  selectFloor: (floor: TowerFloor) => void;
  challengeFloor: (characterId: string, floorNumber: number) => Promise<void>;
  clearCombatLog: () => void;
}

const API_URL = `${API_BASE_URL}/api/tower`;

export const useTowerStore = create<TowerStore>((set, get) => ({
  floors: [],
  selectedFloor: null,
  isLoading: false,
  isSimulating: false,
  isAnalyzing: false,
  combatLog: null,
  cielAnalysis: null,

  fetchFloors: async (characterId: string) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_URL}/${characterId}`);
      if (!res.ok) throw new Error("Failed to fetch tower floors");
      const data: TowerFloor[] = await res.json();
      set({ floors: data, isLoading: false });
      
      // Auto-select highest available floor if none selected
      const currentSelected = get().selectedFloor;
      if (!currentSelected && data.length > 0) {
        const highestAvailable = [...data].reverse().find(f => f.status === "AVAILABLE" || f.status === "ATTEMPTED");
        set({ selectedFloor: highestAvailable || data[0] });
      } else if (currentSelected) {
        // Update selected floor with new data if refetched
        const updatedSelected = data.find(f => f.floorNumber === currentSelected.floorNumber);
        if (updatedSelected) {
           set({ selectedFloor: updatedSelected });
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load tower");
      set({ isLoading: false });
    }
  },

  selectFloor: (floor: TowerFloor) => {
    set({ selectedFloor: floor, combatLog: null, cielAnalysis: null });
  },

  challengeFloor: async (characterId: string, floorNumber: number) => {
    set({ isSimulating: true, combatLog: null, cielAnalysis: null });
    try {
      const res = await fetch(`${API_URL}/${characterId}/challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ floorNumber })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || "Failed to challenge floor");
      }
      
      set({ combatLog: data, isSimulating: false });
      
      if (data.isVictory) {
        toast.success(`Floor ${floorNumber} Cleared!`);
      } else {
        toast.error(`Defeat on Floor ${floorNumber}. Try upgrading your stats!`);
      }
      
      // Refetch floors and update character stats
      await get().fetchFloors(characterId);
      await useCharacterStore.getState().loadCharacter(characterId);

      // Fetch Ciel Analysis
      set({ isAnalyzing: true });
      try {
        const logsStr = (data.events || []).map((e: any) => `[Turn ${e.turn}] ${e.actor} ${e.action}, dealing ${e.damage} damage.`);
        const analysisRes = await fetch(`${API_BASE_URL}/api/aira/analyze-combat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            characterId,
            floorNumber,
            battleLogs: logsStr,
            isVictory: data.isVictory,
            turnsElapsed: data.turnsElapsed,
            playerHpRemaining: data.playerHpRemaining
          })
        });
        const analysisData = await analysisRes.json();
        set({ cielAnalysis: analysisData.analysis, isAnalyzing: false });
      } catch (err) {
        console.error("Failed to analyze combat:", err);
        set({ isAnalyzing: false });
      }
      
    } catch (err: any) {
      toast.error(err.message || "Failed to challenge floor");
      set({ isSimulating: false });
    }
  },
  
  clearCombatLog: () => set({ combatLog: null, cielAnalysis: null }),
}));

if (typeof window !== "undefined") {
  (window as any).__TOWER_STORE__ = useTowerStore;
}


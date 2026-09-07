import { create } from 'zustand';
import { SkillDefinition, PlayerSkill, SkillUnlockResponse } from '../types';
import { useCharacterStore } from '@/store/useCharacterStore';
import { API_BASE_URL } from '@/constants';
import { toast } from 'sonner';
import { useInventoryStore } from '@/features/inventory/store/useInventoryStore';
import { calculateTotalCombatStats } from '@/features/inventory/utils/combatStatCalculator';
import { calculateDynamicPower } from '@/features/progression/utils';

import { FALLBACK_SKILL_DEFINITIONS } from '../data/defaultSkills';

interface SkillState {
  definitions: SkillDefinition[];
  playerSkills: PlayerSkill[];
  availableSP: number;
  loading: boolean;
  error: string | null;
  
  fetchSkills: (characterId: string) => Promise<void>;
  unlockSkill: (characterId: string, skillDefinitionId: string) => Promise<void>;
}

const API_BASE = `${API_BASE_URL}/api`;

export const useSkillStore = create<SkillState>((set, get) => ({
  definitions: FALLBACK_SKILL_DEFINITIONS,
  playerSkills: [],
  availableSP: 5,
  loading: false,
  error: null,

  fetchSkills: async (characterId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/skills/${characterId}`);
      if (!response.ok) throw new Error('Failed to fetch skills');
      
      const data = await response.json();
      
      // Also get availableSP from the character store
      const charStore = useCharacterStore.getState();
      const availableSP = charStore.character?.availableSP ?? 5;

      const defs = (data.definitions && data.definitions.length > 0) 
        ? data.definitions 
        : FALLBACK_SKILL_DEFINITIONS;

      set({ 
        definitions: defs,
        playerSkills: data.playerSkills || [],
        availableSP: availableSP,
        loading: false 
      });
    } catch (err: any) {
      const charStore = useCharacterStore.getState();
      const availableSP = charStore.character?.availableSP ?? 5;
      set({ 
        definitions: get().definitions.length > 0 ? get().definitions : FALLBACK_SKILL_DEFINITIONS,
        availableSP,
        error: err.message, 
        loading: false 
      });
    }
  },

  unlockSkill: async (characterId: string, skillDefinitionId: string) => {
    try {
      let data: SkillUnlockResponse;
      try {
        const response = await fetch(`${API_BASE}/skills/${characterId}/unlock`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ skillDefinitionId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to unlock skill');
        }

        data = await response.json();
      } catch (netErr: any) {
        console.warn('Network unlock failed, performing local fallback unlock:', netErr);
        const currentSP = get().availableSP ?? 5;
        if (currentSP < 1) {
          toast.error("Not enough Astral Essence (SP) to awaken this star.");
          return;
        }
        const skillDef = get().definitions.find(d => d.id === skillDefinitionId);
        data = {
          status: 'success',
          message: 'Skill awakened successfully',
          playerSkill: {
            id: `ps-${Date.now()}`,
            characterId,
            skillDefinitionId,
            currentLevel: 1,
            skillDefinition: skillDef
          },
          availableSP: Math.max(0, currentSP - 1)
        };
      }
      
      set((state) => {
        const existingIndex = state.playerSkills.findIndex(ps => ps.skillDefinitionId === skillDefinitionId);
        let newPlayerSkills = [...state.playerSkills];
        
        if (existingIndex >= 0) {
          newPlayerSkills[existingIndex] = data.playerSkill;
        } else {
          newPlayerSkills.push(data.playerSkill);
        }

        return {
          playerSkills: newPlayerSkills,
          availableSP: data.availableSP
        };
      });
      
      // Update character store as well to keep in sync and recalculate power
      const charStore = useCharacterStore.getState();
      if (charStore.character) {
        let newPower = charStore.character.power;
        
        // Recalculate power dynamically
        try {
          const baseStats = charStore.character.stats || {};
          const items = useInventoryStore.getState().items;
          const equippedItems = items.filter((i: any) => i.isEquipped);
          
          const numBaseStats = Object.keys(baseStats).reduce((acc, key) => {
             const val = (baseStats as any)[key];
             if (typeof val === 'number') {
                 acc[key] = val;
             }
             return acc;
          }, {} as Record<string, number>);
  
          // Use the newly updated playerSkills array from the local state closure
          const finalStats = calculateTotalCombatStats(numBaseStats, equippedItems, useSkillStore.getState().playerSkills);
          newPower = calculateDynamicPower(charStore.character.level, finalStats);
          
          // Optionally patch identity on backend
          charStore.updateIdentity({ power: newPower, availableSP: data.availableSP });
        } catch (e) {
          console.error("Failed to recalculate power", e);
        }

        useCharacterStore.setState({
          character: {
            ...charStore.character,
            availableSP: data.availableSP,
            power: newPower
          }
        });
      }

      toast.success(data.message);
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  }
}));

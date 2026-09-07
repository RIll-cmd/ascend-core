export interface CharacterStats {
  id: string;
  characterId: string;
  strength: number;
  knowledge: number;
  discipline: number;
  focus: number;
  endurance: number;
  recovery: number;
  consistency: number;
}

export interface ProgressHistory {
  id: string;
  characterId: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string | Date;
}

export interface ClassSpecialization {
  id: string;
  name: string;
  baseClass: string;
  tier: number;
  requiredLevel: number;
  requiredStats?: string | null;
  description?: string | null;
  lore?: string | null;
  icon?: string | null;
  statBonus?: string | null;
  powerMultiplier?: number | null;
  passivePerk?: string | null;
  passiveEffect?: string | null;
}

export interface Character {
  id: string;
  userId: string;
  name: string;
  avatar?: string | null;
  theme?: string | null;
  title?: string | null;
  gender?: string | null;
  age?: number | null;
  race?: string | null;
  level: number;
  exp: number;
  currentHp?: number;
  maxHp?: number;
  power: number;
  rank: string;
  gold: number;
  gems?: number;
  towerTokens?: number;
  availableSP: number;
  streakFreezes?: number;
  activeTitleId?: string | null;
  specializationId?: string | null;
  specialization?: ClassSpecialization | null;
  dailySteps?: number;
  dailyStepGoal?: number;
  createdAt: string | Date;
  stats?: CharacterStats | null;
  history?: ProgressHistory[];
  activeBuffs?: {
    id: string;
    buffType: string;
    multiplier: number;
    expiresAt: string;
    chargesRemaining?: number;
  }[];
}

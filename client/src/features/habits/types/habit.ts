export type HabitDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type HabitStatus = 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED';
export type HabitType = 'POSITIVE' | 'NEGATIVE';
export type PenaltyTarget = 'HP' | 'EXP' | 'VITALITY' | 'DISCIPLINE' | 'STRENGTH' | 'KNOWLEDGE' | 'FOCUS' | 'RECOVERY' | 'CONSISTENCY';

export type PrimaryStat =
  | 'strength'
  | 'knowledge'
  | 'discipline'
  | 'focus'
  | 'endurance'
  | 'recovery'
  | 'consistency';

export type ScheduleType =
  | 'DAILY'
  | 'SPECIFIC_DAYS'
  | 'X_TIMES_WEEK'
  | 'MONTHLY'
  | 'CUSTOM';

export type MissionStatus = 'PENDING' | 'COMPLETED' | 'MISSED';

export type CompletionType = 'MINI' | 'NORMAL' | 'ELITE';

export interface HabitSchedule {
  id: string;
  habitId: string;
  daysOfWeek?: string | null;
  timesPerWeek?: number | null;
  timesPerMonth?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  timezone?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface HabitTier {
  id: string;
  habitId: string;
  tier: CompletionType;
  targetType?: string | null;
  targetValue?: number | null;
  targetUnit?: string | null;
  baseExp: number;
  baseGold: number;
  statReward: number;
}

export interface HabitMetrics {
  id: string;
  habitId: string;
  habitStrength: number;
  successRate: number;
  completionRate: number;
  currentConsistency: number;
  currentStreak?: number;
  longestStreak?: number;
  totalCompletions?: number;
  healthScore?: number;
}

export interface Habit {
  id: string;
  characterId: string;
  name: string;
  description?: string | null;
  category: string;
  difficulty: HabitDifficulty;
  primaryStat: PrimaryStat | string;
  status: HabitStatus;
  scheduleType: ScheduleType;
  rrule?: string | null;
  preferredTime?: string | null;
  startDate: string | Date;
  endDate?: string | Date | null;
  icon?: string | null;
  color?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  pausedAt?: string | Date | null;
  archivedAt?: string | Date | null;
  type?: HabitType;
  affectedStat?: PenaltyTarget | string;
  statModifier?: number;
  relapseCount?: number;
  streakDays?: number;
  lastTriggeredAt?: string | Date | null;
  schedule?: HabitSchedule | null;
  tiers?: HabitTier[];
  metrics?: HabitMetrics | null;
  missions?: Mission[];
}

export interface Mission {
  id: string;
  habitId?: string | null;
  characterId: string;
  date: string | Date;
  status: MissionStatus;
  completionType?: CompletionType | null;
  expEarned?: number | null;
  goldEarned?: number | null;
  statsEarned?: number | null;
  completedAt?: string | Date | null;
  habit?: Habit | null;
}

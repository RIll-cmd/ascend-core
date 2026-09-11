import { KanbanQuest } from "@/features/habits/types/kanban";

export interface ChronoSnapshot {
  id: string;
  date: string;
  completedCount: number;
  totalCount: number;
  completionRate: number;
}

export interface HorizonDayData {
  dateStr: string;
  dateObj: Date;
  snapshot?: ChronoSnapshot;
  missions: KanbanQuest[];
  schedules?: any[];
  weekIndex: number;
  dayOfWeek: number;
  isToday: boolean;
  isFuture: boolean;
}

export interface MonocleLoupeTooltipData {
  dateStr: string;
  dateObj: Date;
  snapshot?: ChronoSnapshot;
  missions: KanbanQuest[];
  schedules?: any[];
  x: number;
  y: number;
}

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CalendarSchedule, ScheduleType } from "../scheduleUtils";

export interface StoredCalendarSchedule extends CalendarSchedule {
  title: string;
  time: string;
  dayOfWeek?: number | null;
  scheduledAt?: string | null;
}

interface CalendarScheduleStore {
  schedules: StoredCalendarSchedule[];
  addSchedule: (schedule: Omit<StoredCalendarSchedule, "id" | "completed">) => void;
  completeOneTimeSchedule: (id: string) => void;
  removeSchedule: (id: string) => void;
}

export const useCalendarScheduleStore = create<CalendarScheduleStore>()(
  persist(
    (set) => ({
      schedules: [],
      addSchedule: (schedule) =>
        set((state) => ({
          schedules: [
            ...state.schedules,
            { ...schedule, id: `schedule-${Date.now()}`, completed: false },
          ],
        })),
      completeOneTimeSchedule: (id) =>
        set((state) => ({
          schedules: state.schedules.filter((schedule) => schedule.id !== id),
        })),
      removeSchedule: (id) =>
        set((state) => ({
          schedules: state.schedules.filter((schedule) => schedule.id !== id),
        })),
    }),
    { name: "ascend-calendar-schedules-v1" }
  )
);

export type { ScheduleType };

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetcher } from "@/lib/api";
import type { CalendarSchedule, ScheduleType } from "../scheduleUtils";

export interface StoredCalendarSchedule extends CalendarSchedule {
  title: string;
  time: string;
  dayOfWeek?: number | null;
  scheduledAt?: string | null;
  characterId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CalendarScheduleStore {
  schedules: StoredCalendarSchedule[];
  isLoading: boolean;
  fetchSchedules: (characterId: string) => Promise<void>;
  addSchedule: (
    schedule: Omit<StoredCalendarSchedule, "id" | "completed">,
    characterId?: string
  ) => Promise<void>;
  completeOneTimeSchedule: (id: string, characterId?: string) => Promise<void>;
  removeSchedule: (id: string, characterId?: string) => Promise<void>;
}

export const useCalendarScheduleStore = create<CalendarScheduleStore>()(
  persist(
    (set, get) => ({
      schedules: [],
      isLoading: false,

      fetchSchedules: async (characterId: string) => {
        set({ isLoading: true });
        try {
          const data = await fetcher<any>(
            `/api/calendar/schedules?characterId=${encodeURIComponent(characterId)}`
          );
          const list = Array.isArray(data)
            ? data
            : Array.isArray(data?.schedules)
            ? data.schedules
            : [];
          set({ schedules: list, isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      },

      addSchedule: async (schedule, characterId) => {
        if (characterId) {
          try {
            const res = await fetcher<StoredCalendarSchedule>(
              "/api/calendar/schedules",
              {
                method: "POST",
                body: JSON.stringify({
                  ...schedule,
                  characterId,
                }),
              }
            );
            if (res && res.id) {
              set((state) => ({
                schedules: [
                  ...state.schedules.filter((s) => s.id !== res.id),
                  res,
                ],
              }));
              return;
            }
          } catch {
            // fallback to local below
          }
        }

        set((state) => ({
          schedules: [
            ...state.schedules,
            { ...schedule, id: `schedule-${Date.now()}`, completed: false, characterId },
          ],
        }));
      },

      completeOneTimeSchedule: async (id, characterId) => {
        set((state) => ({
          schedules: state.schedules
            .map((s) => (s.id === id ? { ...s, completed: true } : s))
            .filter((s) => !(s.id === id && s.scheduleType === "ONCE")),
        }));

        if (characterId) {
          try {
            await fetcher(
              `/api/calendar/schedules/${encodeURIComponent(id)}/complete?characterId=${encodeURIComponent(characterId)}`,
              { method: "PATCH" }
            );
          } catch {
            // optimistic state already updated
          }
        }
      },

      removeSchedule: async (id, characterId) => {
        set((state) => ({
          schedules: state.schedules.filter((schedule) => schedule.id !== id),
        }));

        if (characterId) {
          try {
            await fetcher(
              `/api/calendar/schedules/${encodeURIComponent(id)}?characterId=${encodeURIComponent(characterId)}`,
              { method: "DELETE" }
            );
          } catch {
            // optimistic state already updated
          }
        }
      },
    }),
    { name: "ascend-calendar-schedules-v1" }
  )
);

export type { ScheduleType };

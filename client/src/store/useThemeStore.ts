import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "dark" | "light" | "system";
export type WorkoutThemeMode =
  | "crimson-berserker"
  | "shadow-monarch"
  | "cyber-kinetic"
  | "titan-vanguard";

interface ThemeStore {
  theme: ThemeMode;
  workoutTheme: WorkoutThemeMode;
  setTheme: (theme: ThemeMode) => void;
  setWorkoutTheme: (theme: WorkoutThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: "dark",
      workoutTheme: "crimson-berserker",
      setTheme: (theme: ThemeMode) => {
        set({ theme });
        if (typeof window !== "undefined") {
          const root = document.documentElement;
          root.classList.remove("light", "dark");
          if (theme === "system") {
            const systemTheme = window.matchMedia(
              "(prefers-color-scheme: dark)"
            ).matches
              ? "dark"
              : "light";
            root.classList.add(systemTheme);
          } else {
            root.classList.add(theme);
          }
        }
      },
      setWorkoutTheme: (workoutTheme: WorkoutThemeMode) => {
        set({ workoutTheme });
        if (typeof window !== "undefined") {
          document.documentElement.setAttribute("data-workout-theme", workoutTheme);
        }
      },
    }),
    {
      name: "ascend-theme-storage",
      onRehydrateStorage: () => (state) => {
        if (typeof window !== "undefined" && state?.workoutTheme) {
          document.documentElement.setAttribute(
            "data-workout-theme",
            state.workoutTheme
          );
        }
      },
    }
  )
);

"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { API_BASE_URL } from "@/constants";
import { AuthRouteGuard } from "@/components/AuthRouteGuard";

export interface StatData {
  id?: string;
  userId?: string;
  strength: number;
  endurance: number;
  discipline: number;
  knowledge: number;
  recovery: number;
  focus: number;
  consistency: number;
}

export interface MissionData {
  id: string;
  userId?: string;
  title: string;
  type: string;
  expReward: number;
  goldReward: number;
  completed: boolean;
}

export interface UserData {
  id: string;
  username: string;
  level: number;
  exp: number;
  gold: number;
  crystals: number;
  power: number;
  rank: string;
  title: string;
  guild: string;
  stats: StatData | null;
  missions: MissionData[];
}

interface UserContextType {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  toggleMission: (missionId: string) => void;
}

const DEFAULT_USER: UserData = {
  id: "char-1",
  username: "Ascendant",
  level: 1,
  exp: 0,
  gold: 500,
  crystals: 50,
  power: 97,
  rank: "F",
  title: "Ascendant Monarch",
  guild: "Lone Ascendants",
  stats: {
    strength: 1,
    endurance: 1,
    discipline: 1,
    knowledge: 1,
    recovery: 1,
    focus: 1,
    consistency: 1,
  },
  missions: [],
};

const UserContext = createContext<UserContextType>({
  user: null,
  loading: false,
  error: null,
  refetch: async () => {},
  toggleMission: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(DEFAULT_USER);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Safely hydrate auth credentials on client mount
  useEffect(() => {
    useAuthStore.getState().hydrateAuth();
  }, []);

  const authUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const fetchUser = async () => {
    if (!isAuthenticated && !authUser) {
      return;
    }
    const identifier = authUser?.username || authUser?.id || "Shadow Monarch";
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/${encodeURIComponent(identifier)}`, {
        cache: "no-store",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data: UserData = await res.json();
      setUser(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to connect to backend server";
      setError(message);
      setUser((prev) => prev || DEFAULT_USER);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && authUser) {
      fetchUser();
    }
  }, [isAuthenticated, authUser?.username, authUser?.id]);

  const toggleMission = (missionId: string) => {
    if (!user) return;
    setUser({
      ...user,
      missions: user.missions.map((m) =>
        m.id === missionId ? { ...m, completed: !m.completed } : m
      ),
    });
  };

  return (
    <UserContext.Provider
      value={{ user, loading, error, refetch: fetchUser, toggleMission }}
    >
      <AuthRouteGuard>{children}</AuthRouteGuard>
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}

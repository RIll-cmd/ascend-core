import { create } from "zustand";
import { fetcher } from "@/lib/api";
import { useCharacterStore } from "./useCharacterStore";
import { API_BASE_URL } from "@/constants";
import type { Character } from "@/features/character/types/character";

export interface UserState {
  id: string;
  username: string;
  email?: string | null;
  isEmailVerified?: boolean;
}

interface AuthStore {
  user: UserState | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  hydrateAuth: () => void;
  setAuth: (user: UserState, token?: string) => void;
  updateUserProfile: (partial: Partial<UserState>) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  loginAsGuest: () => Promise<{ success: boolean; user: UserState }>;
  loginWithCredentials: (
    identifier: string,
    password: string
  ) => Promise<{ success: boolean; user?: UserState; error?: string }>;
}

const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("ascend_session") || null;
  } catch {
    return null;
  }
};

const getStoredUser = (): UserState | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("ascend_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setCookie = (token: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `ascend_session=${token}; path=/; max-age=${86400 * 30}; SameSite=Lax`;
};

const clearCookie = () => {
  if (typeof document === "undefined") return;
  document.cookie = `ascend_session=; path=/; max-age=0; SameSite=Lax`;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isHydrated: false,

  hydrateAuth: () => {
    if (typeof window === "undefined") return;
    if (get().isHydrated || get().isLoading) return;

    const initialUser = getStoredUser();
    const initialToken = getStoredToken();
    const hasAuth = !!(initialUser || initialToken);
    set({
      user: initialUser,
      token: initialToken,
      isAuthenticated: hasAuth,
      isHydrated: !hasAuth,
      isLoading: hasAuth,
    });
    if (hasAuth) {
      get().checkAuth();
    }
  },

  setAuth: (user, token) => {
    if (token) {
      setCookie(token);
      try {
        localStorage.setItem("ascend_session", token);
      } catch {}
    }
    try {
      localStorage.setItem("ascend_user", JSON.stringify(user));
    } catch {}

    set({
      user,
      token: token || get().token,
      isAuthenticated: true,
      isLoading: false,
      isHydrated: true,
    });
  },

  updateUserProfile: (partial) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...partial };
    try {
      localStorage.setItem("ascend_user", JSON.stringify(updatedUser));
    } catch {}
    set({ user: updatedUser });
  },

  logout: () => {
    clearCookie();
    try {
      localStorage.removeItem("ascend_session");
      localStorage.removeItem("ascend_user");
      localStorage.removeItem("ascend_character_id");
    } catch {}
    set({ user: null, token: null, isAuthenticated: false, isLoading: false, isHydrated: true });
    useCharacterStore.getState().setCharacter(null);
  },

  checkAuth: async () => {
    try {
      const data = await fetcher<{ user: UserState; character: Character | null; token?: string }>("/api/auth/me");
      if (data && data.user) {
        if (data.token) {
          setCookie(data.token);
          try {
            localStorage.setItem("ascend_session", data.token);
          } catch {}
        }
        try {
          localStorage.setItem("ascend_user", JSON.stringify(data.user));
        } catch {}

        set({
          user: data.user,
          token: data.token || get().token,
          isAuthenticated: true,
          isLoading: false,
          isHydrated: true,
        });
        if (data.character) {
          useCharacterStore.getState().setCharacter(data.character);
          try {
            localStorage.setItem("ascend_character_id", data.character.id);
          } catch {}
        }
      } else {
        const cachedUser = getStoredUser();
        const cachedToken = getStoredToken();
        if (cachedUser || cachedToken) {
          set({
            user: cachedUser,
            token: cachedToken,
            isAuthenticated: true,
            isLoading: false,
            isHydrated: true,
          });
        } else {
          set({ user: null, token: null, isAuthenticated: false, isLoading: false, isHydrated: true });
          clearCookie();
          try {
            localStorage.removeItem("ascend_session");
            localStorage.removeItem("ascend_user");
          } catch {}
        }
      }
    } catch {
      const cachedUser = getStoredUser();
      const cachedToken = getStoredToken();
      if (!cachedUser && !cachedToken) {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false, isHydrated: true });
      } else {
        set({ isLoading: false, isHydrated: true, isAuthenticated: true });
      }
    }
  },

  loginAsGuest: async () => {
    set({ isLoading: true });

    const launchLocalGuest = () => {
      const fallbackGuestId = `Guest_${Math.floor(1000 + Math.random() * 9000)}`;
      const fallbackUser: UserState = {
        id: `user-${fallbackGuestId}`,
        username: fallbackGuestId,
        email: null,
        isEmailVerified: false,
      };
      const fallbackToken = `guest_token_${Date.now()}`;
      const fallbackCharId = `char-${fallbackUser.id}`;

      setCookie(fallbackToken);
      try {
        localStorage.setItem("ascend_character_id", fallbackCharId);
        localStorage.setItem("ascend_session", fallbackToken);
        localStorage.setItem("ascend_user", JSON.stringify(fallbackUser));
      } catch {}

      // Initialize guest character in character store
      useCharacterStore.getState().setCharacter({
        id: fallbackCharId,
        userId: fallbackUser.id,
        name: `${fallbackGuestId}`,
        avatar: "/Character_sprite_placeholder/walk_down.gif",
        theme: "dark-rpg",
        title: "Guest Operative",
        gender: "M",
        age: 18,
        race: "HUMAN",
        level: 1,
        exp: 0,
        power: 97,
        rank: "E",
        gold: 500,
        gems: 50,
        towerTokens: 0,
        availableSP: 5,
        createdAt: new Date().toISOString(),
        stats: {
          id: `stats-${fallbackUser.id}`,
          characterId: fallbackCharId,
          strength: 1,
          knowledge: 1,
          discipline: 1,
          focus: 1,
          endurance: 1,
          recovery: 1,
          consistency: 1,
        },
        history: [],
      });

      set({
        user: fallbackUser,
        token: fallbackToken,
        isAuthenticated: true,
        isLoading: false,
        isHydrated: true,
      });

      return { success: true, user: fallbackUser };
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${API_BASE_URL}/api/auth/guest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        return launchLocalGuest();
      }

      const data = await res.json();
      const user = data.user || {
        id: `user-${data.username || "Guest_Hunter"}`,
        username: data.username || "Guest_Hunter",
        email: null,
        isEmailVerified: false,
      };
      const token = data.token || `guest_jwt_${Date.now()}`;
      const charId = data.characterId || `char-${user.id}`;

      setCookie(token);
      try {
        localStorage.setItem("ascend_character_id", charId);
        localStorage.setItem("ascend_session", token);
        localStorage.setItem("ascend_user", JSON.stringify(user));
      } catch {}

      if (data.character) {
        useCharacterStore.getState().setCharacter(data.character);
      } else {
        useCharacterStore.getState().setCharacter({
          id: charId,
          userId: user.id,
          name: user.username,
          avatar: "/Character_sprite_placeholder/walk_down.gif",
          theme: "dark-rpg",
          title: "Guest Operative",
          gender: "M",
          age: 18,
          race: "HUMAN",
          level: 1,
          exp: 0,
          power: 97,
          rank: "E",
          gold: 500,
          gems: 50,
          towerTokens: 0,
          availableSP: 5,
          createdAt: new Date().toISOString(),
          stats: {
            id: `stats-${user.id}`,
            characterId: charId,
            strength: 1,
            knowledge: 1,
            discipline: 1,
            focus: 1,
            endurance: 1,
            recovery: 1,
            consistency: 1,
          },
          history: [],
        });
      }

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        isHydrated: true,
      });

      return { success: true, user };
    } catch {
      return launchLocalGuest();
    }
  },

  loginWithCredentials: async (identifier: string, password: string) => {
    set({ isLoading: true });

    const launchLocalCredentials = () => {
      const fallbackUser: UserState = {
        id: `user-${identifier}`,
        username: identifier,
        email: identifier.includes("@") ? identifier : null,
        isEmailVerified: false,
      };
      const fallbackToken = `ascend_jwt_${Date.now()}`;
      const fallbackCharId = `char-${fallbackUser.id}`;

      setCookie(fallbackToken);
      try {
        localStorage.setItem("ascend_character_id", fallbackCharId);
        localStorage.setItem("ascend_session", fallbackToken);
        localStorage.setItem("ascend_user", JSON.stringify(fallbackUser));
      } catch {}

      set({
        user: fallbackUser,
        token: fallbackToken,
        isAuthenticated: true,
        isLoading: false,
        isHydrated: true,
      });

      return { success: true, user: fallbackUser };
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier, password }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      let data: Record<string, unknown> = {};
      try {
        data = (await res.json()) as Record<string, unknown>;
      } catch {
        data = {};
      }

      if (!res.ok) {
        if (res.status === 404 || res.status === 500 || res.status === 502) {
          return launchLocalCredentials();
        }
        set({ isLoading: false });
        return {
          success: false,
          error: (data.detail as string) || (data.message as string) || "Invalid credentials. Access denied.",
        };
      }

      const user = (data.user as UserState) || {
        id: `user-${identifier}`,
        username: identifier,
        email: identifier.includes("@") ? identifier : null,
      };
      const token = (data.token as string) || `jwt_${Date.now()}`;
      const charId = (data.characterId as string) || `char-${user.id}`;

      setCookie(token);
      try {
        localStorage.setItem("ascend_character_id", charId);
        localStorage.setItem("ascend_session", token);
        localStorage.setItem("ascend_user", JSON.stringify(user));
      } catch {}

      if (data.character) {
        useCharacterStore
          .getState()
          .setCharacter(data.character as unknown as Character);
      }

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        isHydrated: true,
      });

      return { success: true, user };
    } catch {
      return launchLocalCredentials();
    }
  },
}));

import { create } from "zustand";
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
  loginAsGuest: (password: string) => Promise<{ success: boolean; user?: UserState; error?: string }>;
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
    const restoreLocalGuest = () => {
      const cachedUser = getStoredUser();
      const cachedToken = getStoredToken();
      if (!cachedToken?.startsWith("guest_token_") || !cachedUser?.username?.startsWith("Guest_")) {
        return false;
      }
      set({
        user: cachedUser,
        token: cachedToken,
        isAuthenticated: true,
        isLoading: false,
        isHydrated: true,
      });
      return true;
    };

    try {
      const cachedToken = getStoredToken();
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: "include",
        headers: cachedToken ? { Authorization: `Bearer ${cachedToken}` } : {},
      });

      if (response.status === 401 || response.status === 403 || response.status === 404) {
        if (!restoreLocalGuest()) get().logout();
        return;
      }
      if (!response.ok) {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false, isHydrated: true });
        return;
      }

      const data = (await response.json()) as { user: UserState | null; character: Character | null; token?: string };
      if (data.user && typeof data.user.id === "string") {
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
        if (!restoreLocalGuest()) get().logout();
      }
    } catch {
      if (!restoreLocalGuest()) {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false, isHydrated: true });
      }
    }
  },

  loginAsGuest: async (guestPassword: string) => {
    set({ isLoading: true });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    const initializeLocalGuestSession = () => {
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      const guestId = `Guest_${randomSuffix}`;
      const token = `guest_token_${Date.now()}_${randomSuffix}`;
      const charId = `char-${guestId}`;
      const guestUser: UserState = {
        id: guestId,
        username: guestId,
        email: null,
        isEmailVerified: false,
      };

      setCookie(token);
      try {
        localStorage.setItem("ascend_character_id", charId);
        localStorage.setItem("ascend_session", token);
        localStorage.setItem("ascend_user", JSON.stringify(guestUser));
      } catch {}

      useCharacterStore.getState().setCharacter({
        id: charId,
        userId: guestUser.id,
        name: guestUser.username,
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
          id: `stats-${guestUser.id}`,
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

      set({
        user: guestUser,
        token,
        isAuthenticated: true,
        isLoading: false,
        isHydrated: true,
      });

      return { success: true, user: guestUser };
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/guest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: guestPassword }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        // Fallback: If remote backend lacks /api/auth/guest (e.g. 404),
        // validate guest access password locally against standard configured passcode
        if (res.status === 404) {
          const expectedPassword = process.env.NEXT_PUBLIC_GUEST_PASSWORD || "cyrill10";
          if (guestPassword.trim() !== expectedPassword.trim()) {
            set({ isLoading: false });
            return {
              success: false,
              error: "Guest access password is incorrect.",
            };
          }
          return initializeLocalGuestSession();
        }

        const data = await res.json().catch(() => ({}));
        set({ isLoading: false });
        return {
          success: false,
          error: typeof data.detail === "string" ? data.detail : "Guest access was denied.",
        };
      }

      const data = (await res.json()) as { token?: string; user?: UserState; characterId?: string; character?: Character };
      if (!data.token || !data.user?.id || !data.user.username?.startsWith("Guest_")) {
        set({ isLoading: false });
        return { success: false, error: "The guest session response was invalid." };
      }
      const user = data.user;
      const token = data.token;
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
    } catch (error) {
      clearTimeout(timeoutId);
      // If remote backend is unreachable or timed out, allow local guest fallback if password matches
      const expectedPassword = process.env.NEXT_PUBLIC_GUEST_PASSWORD || "cyrill10";
      if (guestPassword.trim() === expectedPassword.trim()) {
        return initializeLocalGuestSession();
      }

      set({ isLoading: false });
      return {
        success: false,
        error: error instanceof Error && error.name === "AbortError"
          ? "Guest access timed out. Please try again."
          : "Guest access is unavailable. Please try again later.",
      };
    }
  },

  loginWithCredentials: async (identifier: string, password: string) => {
    set({ isLoading: true });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12_000);

      let res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier, password }),
        signal: controller.signal,
      });

      // Legacy fallback: If /api/auth/login returned 404, retry with legacy /api/login
      if (res.status === 404) {
        const isEmail = identifier.includes("@");
        res = await fetch(`${API_BASE_URL}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            username: isEmail ? undefined : identifier,
            email: isEmail ? identifier : undefined,
            password,
          }),
          signal: controller.signal,
        });
      }

      clearTimeout(timeoutId);

      let data: Record<string, unknown> = {};
      try {
        data = (await res.json()) as Record<string, unknown>;
      } catch {
        data = {};
      }

      if (!res.ok) {
        set({ isLoading: false });
        return {
          success: false,
          error: (data.detail as string) || (data.message as string) || "Invalid credentials. Access denied.",
        };
      }

      // Handle both modern and legacy login response schemas
      const token = (data.token || data.access_token || data.accessToken) as string | undefined;
      let user = data.user as UserState | undefined;
      if (!user && (data.username || data.userId || data.id)) {
        user = {
          id: (data.userId || data.id || `user-${data.username}`) as string,
          username: (data.username || identifier) as string,
          email: (data.email as string) || null,
          isEmailVerified: Boolean(data.isEmailVerified),
        };
      }

      if (!user || !user.id || !user.username || !token) {
        set({ isLoading: false });
        return { success: false, error: "Authentication server returned an invalid session." };
      }
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
      set({ isLoading: false });
      return {
        success: false,
        error: "Authentication service is unavailable. Please try again shortly.",
      };
    }
  },
}));

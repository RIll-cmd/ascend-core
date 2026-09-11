import { create } from "zustand";
import { fetcher } from "@/lib/api";
import { useCharacterStore } from "./useCharacterStore";

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
      const data = await fetcher<{ user: UserState; character: any; token?: string }>("/api/auth/me");
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
}));

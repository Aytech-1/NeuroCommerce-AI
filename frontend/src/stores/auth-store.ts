import { create } from "zustand";
import { User } from "@/types/api";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSessionExpired: boolean;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  setSessionExpired: (expired: boolean) => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
}

function getInitialToken(): string | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("auth_token");
  if (!stored || stored === "[object Object]") {
    if (stored === "[object Object]") {
      localStorage.removeItem("auth_token");
    }
    return null;
  }
  return stored;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: getInitialToken(),
  user: null,
  isAuthenticated: !!getInitialToken(),
  isLoading: true,
  isSessionExpired: false,

  setAuth: (token, user) => {
    const validToken = typeof token === "string" ? token : "";
    if (typeof window !== "undefined" && validToken) {
      localStorage.setItem("auth_token", validToken);
    }
    set({ token: validToken || null, user, isAuthenticated: !!validToken, isLoading: false, isSessionExpired: false });
  },

  setUser: (user) => {
    set({ user, isAuthenticated: true, isLoading: false, isSessionExpired: false });
  },

  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
    set({ token: null, user: null, isAuthenticated: false, isLoading: false, isSessionExpired: false });
  },

  setSessionExpired: (expired) => {
    set({ isSessionExpired: expired });
  },

  hasPermission: (permission: string) => {
    const { user } = get();
    if (!user) return false;
    if (
      user.role === "admin" ||
      user.role === "super_admin" ||
      user.user_type === "admin" ||
      user.user_type === "super_admin" ||
      user.roles?.includes("admin") ||
      user.roles?.includes("super_admin") ||
      user.permissions?.includes("*")
    ) {
      return true;
    }
    return user.permissions?.includes(permission) || false;
  },

  hasRole: (role: string) => {
    const { user } = get();
    if (!user) return false;
    // Super admin has full access to admin and staff areas
    if (
      (role === "admin" || role === "staff") &&
      (user.role === "super_admin" ||
        user.user_type === "super_admin" ||
        user.roles?.includes("super_admin"))
    ) {
      return true;
    }
    if (user.role === role || user.user_type === role) return true;
    return user.roles?.includes(role) || false;
  },
}));

"use client";

import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { authService } from "@/services/auth-service";
import { SessionExpirationDialog } from "@/components/ui/session-expiration-dialog";

export function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const setSessionExpired = useAuthStore((state) => state.setSessionExpired);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      if (typeof window === "undefined") return;

      const storedToken = localStorage.getItem("auth_token");
      if (!storedToken || storedToken === "[object Object]") {
        if (storedToken === "[object Object]") {
          localStorage.removeItem("auth_token");
        }
        useAuthStore.setState({ isLoading: false, isAuthenticated: false, token: null, user: null });
        return;
      }

      // If user is already loaded in store (e.g. from active login action), mark not loading
      if (useAuthStore.getState().user) {
        useAuthStore.setState({ isLoading: false });
        return;
      }

      try {
        const user = await authService.getMe();
        if (isMounted) {
          setUser(user);
        }
      } catch (err: any) {
        // Only clear session on 401 unauthenticated
        if (isMounted) {
          if (err?.status === 401) {
            setSessionExpired(true);
          } else {
            // Keep token in case of transient network error, but stop loading
            useAuthStore.setState({ isLoading: false });
          }
        }
      } finally {
        if (isMounted) {
          useAuthStore.setState({ isLoading: false });
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [setUser, logout, setSessionExpired]);

  return (
    <>
      {children}
      <SessionExpirationDialog />
    </>
  );
}

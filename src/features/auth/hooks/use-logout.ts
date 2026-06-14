import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { authApi } from "@/features/auth/api/auth-api";
import { mobileAuthApi } from "@/features/auth/api/mobile-auth-api";
import { webAuthApi } from "@/features/auth/api/web-auth-api";
import { clearMobileAuthArtifacts } from "@/features/auth/lib/mobile-auth-cleanup";
import { resolveMobileRefreshToken } from "@/features/auth/lib/mobile-refresh-token";
import { clearAuthenticatedSessionData } from "@/features/auth/lib/session-cleanup";
import { APP_ROUTES } from "@/shared/config/routes";
import { useAuthStore } from "@/store/auth-store";

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = useCallback(async () => {
    try {
      const channel = useAuthStore.getState().authChannel ?? "web";
      if (channel === "mobile") {
        const rt = await resolveMobileRefreshToken();
        if (rt) await mobileAuthApi.logout({ refreshToken: rt });
      } else {
        await webAuthApi.logout();
      }
    } catch {
      // ignore
    } finally {
      if ((useAuthStore.getState().authChannel ?? "web") === "mobile") {
        await clearMobileAuthArtifacts();
      }
      logout();
      await clearAuthenticatedSessionData(queryClient);
      navigate(APP_ROUTES.root, { replace: true });
    }
  }, [logout, navigate, queryClient]);

  const handleLogoutAll = useCallback(async () => {
    try {
      await authApi.logoutAll();
    } catch {
      // ignore
    } finally {
      if ((useAuthStore.getState().authChannel ?? "web") === "mobile") {
        await clearMobileAuthArtifacts();
      }
      logout();
      await clearAuthenticatedSessionData(queryClient);
      navigate(APP_ROUTES.root, { replace: true });
    }
  }, [logout, navigate, queryClient]);

  return { handleLogout, handleLogoutAll };
}

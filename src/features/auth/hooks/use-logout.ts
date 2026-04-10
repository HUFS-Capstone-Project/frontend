import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { authApi } from "@/features/auth/api/auth-api";
import { mobileAuthApi } from "@/features/auth/api/mobile-auth-api";
import { webAuthApi } from "@/features/auth/api/web-auth-api";
import { resolveMobileRefreshToken } from "@/features/auth/lib/mobile-refresh-token";
import { useAuthStore } from "@/store/auth-store";

export function useLogout() {
  const navigate = useNavigate();
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
      logout();
      navigate("/", { replace: true });
    }
  }, [logout, navigate]);

  const handleLogoutAll = useCallback(async () => {
    try {
      await authApi.logoutAll();
    } catch {
      // ignore
    } finally {
      logout();
      navigate("/", { replace: true });
    }
  }, [logout, navigate]);

  return { handleLogout, handleLogoutAll };
}

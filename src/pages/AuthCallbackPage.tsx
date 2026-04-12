import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { BrandMarkerLoader } from "@/components/ui/BrandMarkerLoader";
import { webAuthApi } from "@/features/auth/api/web-auth-api";
import type { ApiError } from "@/shared/api/axios";
import { useAuthStore } from "@/store/auth-store";

const LOGIN_ROUTE = "/login";
const FALLBACK_ERROR_MESSAGE = "로그인 처리 중 오류가 발생했습니다.";
const MISSING_TICKET_MESSAGE = "인증 정보가 없습니다. 다시 로그인해 주세요.";
const BACK_TO_LOGIN_LABEL = "로그인 화면으로 돌아가기";

type AuthCallbackFallbackProps = {
  message: string;
  onBackToLogin: () => void;
};

function AuthCallbackFallback({ message, onBackToLogin }: AuthCallbackFallbackProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-destructive text-sm">{message}</p>
      <button
        type="button"
        onClick={onBackToLogin}
        className="text-muted-foreground text-sm underline underline-offset-4"
      >
        {BACK_TO_LOGIN_LABEL}
      </button>
    </div>
  );
}

/**
 * 웹 OAuth 콜백 처리 전용 페이지.
 * ticket 파라미터를 교환해 access token과 사용자 정보를 복구한다.
 */
// TODO(모바일 OAuth): Capacitor appUrlOpen + PKCE 콜백 경로에서 모바일 전용 처리 분기 추가.
export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.signIn);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const ticket = searchParams.get("ticket")?.trim() ?? "";

  const hasStarted = useRef(false);

  const handleBackToLogin = useCallback(() => {
    void navigate(LOGIN_ROUTE, { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (!ticket || hasStarted.current) return;
    hasStarted.current = true;

    const processCallback = async () => {
      await webAuthApi.ensureCsrfCookie();

      const res = await webAuthApi.exchangeTicket(ticket);
      const { token, me } = res.data;

      const accessToken = token.accessToken;
      useAuthStore.getState().setAccessToken(accessToken);

      signIn(
        accessToken,
        {
          nickname: me.nickname,
          hasCompletedOnboarding: me.hasCompletedOnboarding,
        },
        { channel: "web" },
      );

      void navigate(me.hasCompletedOnboarding ? "/room" : "/onboarding/nickname", {
        replace: true,
      });
    };

    processCallback().catch((err: unknown) => {
      const apiError = err as Partial<ApiError>;
      setErrorMessage(apiError.message ?? FALLBACK_ERROR_MESSAGE);
    });
  }, [ticket, signIn, navigate]);

  if (!ticket) {
    return (
      <AuthCallbackFallback message={MISSING_TICKET_MESSAGE} onBackToLogin={handleBackToLogin} />
    );
  }

  if (errorMessage !== null) {
    return <AuthCallbackFallback message={errorMessage} onBackToLogin={handleBackToLogin} />;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3">
      <span className="sr-only">로그인 처리 중</span>
      <BrandMarkerLoader />
    </div>
  );
}

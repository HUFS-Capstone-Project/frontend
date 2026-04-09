import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { webAuthApi } from "@/features/auth/api/webAuthApi";
import type { ApiError } from "@/shared/api/axios";
import { useAuthStore } from "@/store/authStore";

/** OAuth 콜백: ticket → getCsrf → exchange-ticket(`data.token`·`data.me`) → 라우팅 */
export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const signIn = useAuthStore((s) => s.signIn);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ticket = searchParams.get("ticket")?.trim() ?? "";

  const hasStarted = useRef(false);

  useEffect(() => {
    if (!ticket) return;
    if (hasStarted.current) return;
    hasStarted.current = true;

    const processCallback = async () => {
      await webAuthApi.getCsrf();

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

      void navigate(
        me.hasCompletedOnboarding ? "/" : "/onboarding/nickname",
        { replace: true },
      );
    };

    processCallback().catch((err: unknown) => {
      const apiError = err as Partial<ApiError>;
      setErrorMessage(apiError.message ?? "로그인 중 오류가 발생했습니다.");
    });
  }, [ticket, signIn, navigate]);

  if (!ticket) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-destructive text-sm">
          인증 정보가 없습니다. 다시 로그인해주세요.
        </p>
        <button
          type="button"
          onClick={() => void navigate("/", { replace: true })}
          className="text-muted-foreground text-sm underline underline-offset-4"
        >
          로그인 화면으로 돌아가기
        </button>
      </div>
    );
  }

  if (errorMessage !== null) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-destructive text-sm">{errorMessage}</p>
        <button
          type="button"
          onClick={() => void navigate("/", { replace: true })}
          className="text-muted-foreground text-sm underline underline-offset-4"
        >
          로그인 화면으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center" aria-label="로그인 처리 중">
      <div
        className="border-primary size-8 animate-spin rounded-full border-2 border-t-transparent"
        role="status"
        aria-label="로딩 중"
      />
    </div>
  );
}

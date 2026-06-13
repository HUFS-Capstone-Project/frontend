import { useCallback, useState } from "react";
import { Navigate } from "react-router-dom";

import { GoogleLoginButton } from "@/features/auth/components/GoogleLoginButton";
import { LoginCopy, type LoginCopyVariant } from "@/features/auth/components/LoginCopy";
import { handleGoogleLogin } from "@/features/auth/lib/google-login";
import { consumeMobileOAuthUserError } from "@/features/auth/lib/mobile-oauth-error";
import { loginPageInnerClassName, loginPageRootClassName } from "@/lib/login-layout";
import { APP_ROUTES } from "@/shared/config/routes";
import { useAuthStore } from "@/store/auth-store";

const LOGIN_COPY_VARIANT: LoginCopyVariant = "marketing";

const SECTION_ACCESSIBILITY: Record<
  LoginCopyVariant,
  { "aria-label": string } | { "aria-labelledby": string }
> = {
  greeting: { "aria-label": "로그인 안내" },
  marketing: { "aria-labelledby": "login-marketing-heading" },
};

export default function LoginPage() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);

  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(() => consumeMobileOAuthUserError());

  const handleGoogleContinue = useCallback(async () => {
    setIsLoading(true);
    setLoginError(null);
    const redirected = await handleGoogleLogin();

    // Local dev fallback: when no redirect URL is configured.
    if (!redirected) {
      setIsLoading(false);
      setLoginError("로그인에 실패했습니다. 다시 시도해주세요.");
    }
  }, []);

  const sectionA11y = SECTION_ACCESSIBILITY[LOGIN_COPY_VARIANT];

  if (isLoggedIn && accessToken) {
    return (
      <Navigate
        to={hasCompletedOnboarding ? APP_ROUTES.room : APP_ROUTES.onboardingNickname}
        replace
      />
    );
  }

  return (
    <div className={loginPageRootClassName}>
      <div className={loginPageInnerClassName}>
        <section className="shrink-0 text-left" {...sectionA11y}>
          <LoginCopy variant={LOGIN_COPY_VARIANT} />
        </section>

        <div className="mx-auto w-full max-w-md shrink-0 md:max-w-full">
          <GoogleLoginButton isLoading={isLoading} onContinue={handleGoogleContinue} />
          {loginError ? (
            <p className="mt-3 text-center text-sm font-medium text-red-600" role="alert">
              {loginError}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

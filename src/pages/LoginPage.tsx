import { useCallback, useState } from "react";

import { GoogleLoginButton } from "@/features/auth/components/GoogleLoginButton";
import { LoginCopy, type LoginCopyVariant } from "@/features/auth/components/LoginCopy";
import { handleGoogleLogin } from "@/features/auth/lib/google-login";
import { loginPageInnerClassName, loginPageRootClassName } from "@/lib/login-layout";

const LOGIN_COPY_VARIANT: LoginCopyVariant = "marketing";

const SECTION_ACCESSIBILITY: Record<
  LoginCopyVariant,
  { "aria-label": string } | { "aria-labelledby": string }
> = {
  greeting: { "aria-label": "로그인 안내" },
  marketing: { "aria-labelledby": "login-marketing-heading" },
};

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleContinue = useCallback(() => {
    setIsLoading(true);
    const redirected = handleGoogleLogin();
    if (!redirected) {
      // VITE_WEB_GOOGLE_LOGIN_URL 미설정 시 (개발 환경 임시 처리)
      setIsLoading(false);
    }
    // 리다이렉트 성공 시 페이지가 이동하므로 추가 처리 불필요
  }, []);

  const sectionA11y = SECTION_ACCESSIBILITY[LOGIN_COPY_VARIANT];

  return (
    <div className={loginPageRootClassName}>
      <div className={loginPageInnerClassName}>
        <section className="shrink-0 text-left" {...sectionA11y}>
          <LoginCopy variant={LOGIN_COPY_VARIANT} />
        </section>

        <div className="mx-auto w-full max-w-md shrink-0 md:max-w-full">
          <GoogleLoginButton isLoading={isLoading} onContinue={handleGoogleContinue} />
        </div>
      </div>
    </div>
  );
}

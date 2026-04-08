import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { GoogleLoginButton } from "@/features/auth/components/GoogleLoginButton";
import {
  LoginCopy,
  type LoginCopyVariant,
} from "@/features/auth/components/LoginCopy";
import {
  loginPageInnerClassName,
  loginPageRootClassName,
} from "@/lib/login-layout";

/** 백엔드·OAuth 미연동 시 버튼 로딩 UX 후 온보딩(닉네임) 화면으로 이동합니다. */
const MOCK_LOGIN_DELAY_MS = 450;

const LOGIN_COPY_VARIANT: LoginCopyVariant = "marketing";

const SECTION_ACCESSIBILITY: Record<
  LoginCopyVariant,
  | { "aria-label": string }
  | { "aria-labelledby": string }
> = {
  greeting: { "aria-label": "로그인 안내" },
  marketing: { "aria-labelledby": "login-marketing-heading" },
};

export function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const mockLoginTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (mockLoginTimerRef.current !== null) {
        clearTimeout(mockLoginTimerRef.current);
      }
    };
  }, []);

  const handleGoogleContinue = useCallback(() => {
    if (mockLoginTimerRef.current !== null) {
      clearTimeout(mockLoginTimerRef.current);
    }
    setIsLoading(true);
    mockLoginTimerRef.current = window.setTimeout(() => {
      mockLoginTimerRef.current = null;
      setIsLoading(false);
      void navigate("/onboarding/nickname");
    }, MOCK_LOGIN_DELAY_MS);
  }, [navigate]);

  const sectionA11y = SECTION_ACCESSIBILITY[LOGIN_COPY_VARIANT];

  return (
    <div className={loginPageRootClassName}>
      <div className={loginPageInnerClassName}>
        <section className="shrink-0 text-left" {...sectionA11y}>
          <LoginCopy variant={LOGIN_COPY_VARIANT} />
        </section>

        <div className="mx-auto w-full max-w-md shrink-0 md:max-w-full">
          <GoogleLoginButton
            isLoading={isLoading}
            onContinue={handleGoogleContinue}
          />
        </div>
      </div>
    </div>
  );
}

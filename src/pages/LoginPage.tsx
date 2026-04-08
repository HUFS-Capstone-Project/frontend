import { useCallback, useEffect, useRef, useState } from "react"

import { GoogleLoginButton } from "@/features/auth/components/GoogleLoginButton"
import {
  LoginCopy,
  type LoginCopyVariant,
} from "@/features/auth/components/LoginCopy"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/authStore"

/** 백엔드·OAuth 미연동 시 버튼 로딩 UX만 보여 준 뒤 모의 로그인 처리합니다. */
const MOCK_LOGIN_DELAY_MS = 450

const COPY_SECTION_TOP: Record<LoginCopyVariant, string> = {
  greeting: "top-[calc(12.5rem+env(safe-area-inset-top))]",
  marketing: "top-[calc(11.875rem+env(safe-area-inset-top))]",
}

const CTA_SECTION_TOP: Record<LoginCopyVariant, string> = {
  greeting: "top-[24rem]",
  marketing: "top-[28rem]",
}

const LOGIN_COPY_VARIANT: LoginCopyVariant = "greeting"

const SECTION_ACCESSIBILITY: Record<
  LoginCopyVariant,
  | { "aria-label": string }
  | { "aria-labelledby": string }
> = {
  greeting: { "aria-label": "로그인 안내" },
  marketing: { "aria-labelledby": "login-marketing-heading" },
}

export function LoginPage() {
  const setLoggedIn = useAuthStore((s) => s.setLoggedIn)
  const [isLoading, setIsLoading] = useState(false)
  const mockLoginTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (mockLoginTimerRef.current !== null) {
        clearTimeout(mockLoginTimerRef.current)
      }
    }
  }, [])

  const handleGoogleContinue = useCallback(() => {
    if (mockLoginTimerRef.current !== null) {
      clearTimeout(mockLoginTimerRef.current)
    }
    setIsLoading(true)
    mockLoginTimerRef.current = window.setTimeout(() => {
      mockLoginTimerRef.current = null
      setLoggedIn(true)
      setIsLoading(false)
    }, MOCK_LOGIN_DELAY_MS)
  }, [setLoggedIn])

  const copyTopClass = COPY_SECTION_TOP[LOGIN_COPY_VARIANT]
  const ctaTopClass = CTA_SECTION_TOP[LOGIN_COPY_VARIANT]
  const sectionA11y = SECTION_ACCESSIBILITY[LOGIN_COPY_VARIANT]

  return (
    <div
      className={cn(
        "relative min-h-dvh w-full overflow-x-hidden",
        "bg-background text-foreground"
      )}
    >
      <section
        className={cn(
          "absolute inset-x-0",
          LOGIN_COPY_VARIANT === "greeting" ? "text-center" : "text-left",
          copyTopClass
        )}
        {...sectionA11y}
      >
        <LoginCopy variant={LOGIN_COPY_VARIANT} />
      </section>

      <div
        className={cn(
          "absolute inset-x-0 mx-auto w-full max-w-md",
          ctaTopClass
        )}
      >
        <GoogleLoginButton
          isLoading={isLoading}
          onContinue={handleGoogleContinue}
        />
      </div>
    </div>
  )
}

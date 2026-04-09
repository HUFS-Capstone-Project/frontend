import * as React from "react";

import { cn } from "@/lib/utils";

type OnboardingLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * 온보딩 단계 공통 래퍼. 배경·safe-area는 `RootLayout`과 맞춤.
 */
export function OnboardingLayout({
  children,
  className,
}: OnboardingLayoutProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col bg-background text-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

type OnboardingContentProps = {
  children: React.ReactNode;
  className?: string;
};

/** 스크롤 가능한 본문 영역 */
export function OnboardingContent({
  children,
  className,
}: OnboardingContentProps) {
  return (
    <div className={cn("flex flex-1 flex-col", className)}>{children}</div>
  );
}

type OnboardingFooterProps = {
  children: React.ReactNode;
  className?: string;
};

/** 하단 CTA 영역 (인디케이터 + 버튼 등) */
export function OnboardingFooter({
  children,
  className,
}: OnboardingFooterProps) {
  return (
    <div className={cn("flex shrink-0 flex-col gap-4", className)}>
      {children}
    </div>
  );
}

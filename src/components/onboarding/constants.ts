/**
 * 온보딩 단계별 본문 레이아웃 (RootLayout `px-page`와 함께 사용).
 */
export const onboardingContentClassName = {
  nickname:
    "flex min-h-0 flex-1 flex-col justify-center gap-10 overflow-y-auto overscroll-contain py-6",
  terms:
    "flex min-h-0 flex-1 flex-col justify-center gap-8 overflow-y-auto overscroll-contain py-6",
} as const;

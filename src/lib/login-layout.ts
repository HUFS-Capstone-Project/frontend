/**
 * 로그인 첫 화면 레이아웃·간격 (절대 `top` 픽셀 대신 flex + gap).
 * `RootLayout`의 `min-h-dvh` 컬럼 안에서 `flex-1`로 채웁니다.
 */
export const loginPageRootClassName =
  "flex min-h-0 w-full flex-1 flex-col overflow-x-hidden bg-background text-foreground";

/** 카피 + CTA 세로 배치 */
export const loginPageInnerClassName =
  "flex min-h-0 flex-1 flex-col justify-center gap-10 px-0 py-6";

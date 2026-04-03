import { Outlet } from "react-router-dom";

/**
 * 모바일 퍼스트
 * - 기본(폰): max-w-lg
 * - md~(소형·세로 태블릿): max-w-3xl
 * - lg~(가로 태블릿·큰 패널): max-w-5xl
 */
export function RootLayout() {
  return (
    <div className="bg-background text-foreground">
      <div
        className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] md:max-w-3xl md:px-6 lg:max-w-5xl lg:px-8"
      >
        <Outlet />
      </div>
    </div>
  );
}

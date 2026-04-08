import { Outlet } from "react-router-dom";

/**
 * 뷰포트별 콘텐츠 폭
 * - 모바일(md 미만): 모바일 규격 (max-w-lg)
 * - 태블릿·중간 창 (md ~ xl 미만): 태블릿 규격 (max-w-3xl)
 * - PC 화면 (xl+): 모바일 규격
 */
export function RootLayout() {
  return (
    <div className="bg-background text-foreground">
      <div
        className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] md:max-w-3xl md:px-6 xl:max-w-lg xl:px-4"
      >
        <Outlet />
      </div>
    </div>
  );
}

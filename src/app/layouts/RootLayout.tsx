import { Outlet } from "react-router-dom";

import { useInitAuth } from "@/features/auth/hooks/use-init-auth";

/**
 * 뷰포트별 콘텐츠 폭
 * - 모바일(md 미만): 모바일 규격 (max-w-lg)
 * - 태블릿·중간 창 (md ~ xl 미만): 태블릿 규격 (max-w-3xl)
 * - PC 화면 (xl+): 모바일 규격
 * - 좌우 여백: 전역 `px-page` (index.css)
 * - 높이는 `h-dvh` + `overflow-hidden`으로 뷰포트에 고정해, 하단 탭 등은 문서 스크롤 없이 자식 영역만 스크롤되게 함.
 */
export function RootLayout() {
  useInitAuth();

  return (
    <div className="bg-background text-foreground">
      <div
        className="mx-auto flex h-dvh max-h-dvh min-h-0 w-full max-w-lg flex-col overflow-hidden px-page pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] md:max-w-3xl xl:max-w-lg"
      >
        <Outlet />
      </div>
    </div>
  );
}

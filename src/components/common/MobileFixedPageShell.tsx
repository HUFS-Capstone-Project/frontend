import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MobileFixedPageShellProps = {
  children: ReactNode;
  className?: string;
  /**
   * `RootLayout`의 `px-page`를 상쇄하고, `FullScreenOverlayShell`과 같은 가로 max-width를 씁니다.
   * 릴스 장소 선택·장소 수정 등 모달과 너비를 맞출 때 사용합니다.
   */
  alignWithOverlay?: boolean;
};

export function MobileFixedPageShell({
  children,
  className,
  alignWithOverlay = false,
}: MobileFixedPageShellProps) {
  return (
    <main
      className={cn(
        "mx-auto flex w-full flex-col overflow-hidden bg-white",
        alignWithOverlay
          ? "-m-page min-h-0 max-w-lg flex-1 self-stretch md:max-w-3xl xl:max-w-lg"
          : "h-dvh max-w-[430px]",
        className,
      )}
    >
      {children}
    </main>
  );
}

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type RoomMainShellProps = {
  header: ReactNode;
  children: ReactNode;
  bottomNav: ReactNode;
  /** 하단 네비 위에 떠 있는 액션 (예: FAB) */
  fab?: ReactNode;
  className?: string;
};

/**
 * 방 메인 계열 화면 공통 셸: 엣지 투 엣지, 스크롤 본문, 하단 고정 네비 + FAB 위치.
 */
export function RoomMainShell({ header, children, bottomNav, fab, className }: RoomMainShellProps) {
  return (
    <div className={cn("-m-page relative flex min-h-0 flex-1 flex-col", className)}>
      {header}

      <div className="scrollbar-hide bg-background pb-room-main-scroll min-h-0 flex-1 overflow-y-auto">
        {children}
      </div>

      <div className="relative shrink-0">
        {fab != null ? (
          <div className="bottom-fab-above-nav end-page-safe absolute z-10">{fab}</div>
        ) : null}
        {bottomNav}
      </div>
    </div>
  );
}

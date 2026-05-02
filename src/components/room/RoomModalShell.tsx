import type { ReactNode } from "react";

import {
  ROOM_MODAL_OVERLAY_TRANSITION_STYLE,
  ROOM_MODAL_PANEL_TRANSITION_STYLE,
} from "@/features/room/constants";
import { cn } from "@/lib/utils";

export type RoomModalShellProps = {
  visible: boolean;
  onOverlayClick: () => void;
  children: ReactNode;
  /** 액션 모달 위에 겹칠 때 등 */
  className?: string;
};

/**
 * RoomActionModal 등과 동일한 오버레이 + 흰 패널 래퍼 (transition 포함).
 */
export function RoomModalShell({
  visible,
  onOverlayClick,
  children,
  className,
}: RoomModalShellProps) {
  return (
    <div
      className={cn("fixed inset-0 z-50 flex items-center justify-center p-6", className)}
      aria-modal="true"
      role="dialog"
    >
      <button
        type="button"
        style={ROOM_MODAL_OVERLAY_TRANSITION_STYLE}
        className={cn(
          "bg-overlay-scrim absolute inset-0 cursor-default border-0",
          visible ? "opacity-100" : "opacity-0",
        )}
        aria-label="닫기"
        onClick={onOverlayClick}
      />

      <div
        style={{
          transformOrigin: "center",
          ...ROOM_MODAL_PANEL_TRANSITION_STYLE,
        }}
        className={cn(
          "bg-card relative z-10 w-full max-w-[min(20rem,calc(100vw-3rem))] overflow-hidden rounded-xl shadow-lg",
          visible ? "scale-100 opacity-100" : "scale-[0.98] opacity-0",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

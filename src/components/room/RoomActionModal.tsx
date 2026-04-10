import { useCallback, memo } from "react";

import { cn } from "@/lib/utils";
import { useEscapeKey, useRoomActionModalPresence } from "@/features/room/hooks";
import type { FriendRoomRow } from "@/shared/types/room";

export type RoomActionType = "edit-info" | "mute-notifications" | "invite-code" | "leave";

export type RoomActionModalProps = {
  room: FriendRoomRow | null;
  onClose: () => void;
  onAction: (action: RoomActionType) => void;
};

const ACTIONS: { type: RoomActionType; label: string; danger?: boolean }[] = [
  { type: "edit-info", label: "방 정보 변경" },
  { type: "mute-notifications", label: "채팅방 알림 끄기" },
  { type: "invite-code", label: "초대코드 확인" },
  { type: "leave", label: "나가기", danger: true },
];

type RoomActionModalPanelProps = {
  displayRoom: FriendRoomRow;
  visible: boolean;
  onClose: () => void;
  onSelectAction: (type: RoomActionType) => void;
};

const RoomActionModalPanel = memo(function RoomActionModalPanel({
  displayRoom,
  visible,
  onClose,
  onSelectAction,
}: RoomActionModalPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" aria-modal="true" role="dialog">
      <button
        type="button"
        className={cn(
          "absolute inset-0 cursor-default border-0 bg-black/45 transition-opacity duration-180 ease-out",
          visible ? "opacity-100" : "opacity-0",
        )}
        aria-label="닫기"
        onClick={onClose}
      />

      <div
        className={cn(
          "relative z-10 w-full max-w-[min(20rem,calc(100vw-3rem))] overflow-hidden rounded-xl bg-white shadow-lg transition-[opacity,transform] duration-180 ease-out",
          visible ? "scale-100 opacity-100" : "scale-[0.98] opacity-0",
        )}
        style={{ transformOrigin: "center" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-7 pb-2 pt-7">
          <h2 className="text-foreground text-base font-bold leading-tight">{displayRoom.displayName}</h2>
        </div>

        <div className="flex flex-col px-2 pb-3 pt-1">
          {ACTIONS.map(({ type, label, danger }) => (
            <button
              key={type}
              type="button"
              className={cn(
                "flex h-12 w-full items-center rounded-xl px-5 text-left text-sm transition-colors duration-150",
                "hover:bg-muted/30 active:bg-muted/40",
                danger ? "text-destructive font-medium" : "text-foreground",
              )}
              onClick={() => onSelectAction(type)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

/**
 * 방 리스트에서 열리는 중앙 액션 모달 (오버레이 + 라운드 패널).
 * 등장/퇴장: opacity·scale CSS transition (Framer Motion 미사용).
 */
export function RoomActionModal({ room, onClose, onAction }: RoomActionModalProps) {
  const { displayRoom, visible } = useRoomActionModalPresence(room);

  useEscapeKey(onClose, displayRoom != null);

  const handleSelectAction = useCallback(
    (type: RoomActionType) => {
      onAction(type);
      onClose();
    },
    [onAction, onClose],
  );

  if (!displayRoom) return null;

  return (
    <RoomActionModalPanel
      displayRoom={displayRoom}
      visible={visible}
      onClose={onClose}
      onSelectAction={handleSelectAction}
    />
  );
}

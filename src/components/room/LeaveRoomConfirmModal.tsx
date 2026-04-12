import { memo, useCallback } from "react";

import { useEscapeKey, useRoomActionModalPresence } from "@/features/room/hooks";
import { cn } from "@/lib/utils";
import type { FriendRoomRow } from "@/shared/types/room";

import { RoomModalShell } from "./RoomModalShell";

const LEAVE_WARNING =
  "나가기를 하면 저장했던 장소들이 모두 삭제되고 상대방의 채팅목록에서도 삭제됩니다";

export type LeaveRoomConfirmModalProps = {
  room: FriendRoomRow | null;
  onClose: () => void;
  /** 확인 시 호출. 이후 API 연동 시 여기서 `leaveRoom(room.id)` 등 처리 */
  onConfirmLeave: (room: FriendRoomRow) => void;
};

const LeaveRoomConfirmModalInner = memo(function LeaveRoomConfirmModalInner({
  displayRoom,
  visible,
  onClose,
  onConfirmLeave,
}: {
  displayRoom: FriendRoomRow;
  visible: boolean;
  onClose: () => void;
  onConfirmLeave: (room: FriendRoomRow) => void;
}) {
  const handleConfirm = useCallback(() => {
    onConfirmLeave(displayRoom);
  }, [displayRoom, onConfirmLeave]);

  return (
    <RoomModalShell visible={visible} onOverlayClick={onClose} className="z-60">
      <div className="px-6 pt-8 pb-5 text-center">
        <h2 className="text-foreground text-lg leading-snug font-bold">방 나가기</h2>
        <p className="text-foreground mt-4 text-sm leading-relaxed">{LEAVE_WARNING}</p>
      </div>

      <div className="border-border/50 flex border-t">
        <button
          type="button"
          className={cn(
            "flex-1 py-4 text-sm font-medium transition-colors",
            "border-border/50 text-brand-coral hover:bg-muted/25 active:bg-muted/35 border-r",
          )}
          onClick={onClose}
        >
          취소
        </button>
        <button
          type="button"
          className="text-foreground hover:bg-muted/25 active:bg-muted/35 flex-1 py-4 text-sm font-medium transition-colors"
          onClick={handleConfirm}
        >
          나가기
        </button>
      </div>
    </RoomModalShell>
  );
});

/**
 * 방 나가기 확인. RoomModalShell·presence 훅 패턴은 InviteCodeModal과 동일.
 */
export function LeaveRoomConfirmModal({
  room,
  onClose,
  onConfirmLeave,
}: LeaveRoomConfirmModalProps) {
  const { displayRoom, visible } = useRoomActionModalPresence(room);

  useEscapeKey(onClose, displayRoom != null);

  if (!displayRoom) return null;

  return (
    <LeaveRoomConfirmModalInner
      displayRoom={displayRoom}
      visible={visible}
      onClose={onClose}
      onConfirmLeave={onConfirmLeave}
    />
  );
}

import { memo, useCallback } from "react";

import { useEscapeKey, useRoomActionModalPresence } from "@/features/room/hooks";
import type { RoomActionType } from "@/features/room/roomActionTypes";
import { cn } from "@/lib/utils";
import type { FriendRoomRow } from "@/shared/types/room";

import { RoomModalShell } from "./RoomModalShell";

export type { RoomActionType };

export type RoomActionModalProps = {
  room: FriendRoomRow | null;
  onClose: () => void;
  /** 모달에서 선택한 액션과 대상 방. 이후 API 연동 시 동일 시그니처로 교체하기 좋습니다. */
  onAction: (action: RoomActionType, room: FriendRoomRow) => void;
};

type ActionItem = { type: RoomActionType; label: string; danger?: boolean };

function getRoomActions(room: FriendRoomRow): ActionItem[] {
  return [
    { type: "edit-info", label: "방 이름 변경" },
    { type: "toggle-pin", label: room.isPinned ? "상단 고정 해제" : "상단에 고정하기" },
    { type: "add-direct-link", label: "직접 링크 추가하기" },
    { type: "invite-code", label: "초대코드 확인" },
    { type: "leave", label: "나가기", danger: true },
  ];
}

type RoomActionModalPanelProps = {
  displayRoom: FriendRoomRow;
  visible: boolean;
  onClose: () => void;
  onSelectAction: (type: RoomActionType, room: FriendRoomRow) => void;
};

const RoomActionModalPanel = memo(function RoomActionModalPanel({
  displayRoom,
  visible,
  onClose,
  onSelectAction,
}: RoomActionModalPanelProps) {
  const actions = getRoomActions(displayRoom);

  return (
    <RoomModalShell visible={visible} onOverlayClick={onClose}>
      <div className="px-7 pt-7 pb-2">
        <h2 className="text-foreground text-base leading-tight font-bold">
          {displayRoom.displayName}
        </h2>
      </div>

      <div className="flex flex-col px-2 pt-1 pb-3">
        {actions.map(({ type, label, danger }) => (
          <button
            key={type}
            type="button"
            className={cn(
              "flex h-12 w-full items-center rounded-xl px-5 text-left text-sm transition-colors duration-150",
              "hover:bg-muted/30 active:bg-muted/40",
              danger ? "text-destructive font-medium" : "text-foreground",
            )}
            onClick={() => onSelectAction(type, displayRoom)}
          >
            {label}
          </button>
        ))}
      </div>
    </RoomModalShell>
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
    (type: RoomActionType, targetRoom: FriendRoomRow) => {
      onAction(type, targetRoom);
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

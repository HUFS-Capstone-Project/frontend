import { memo, useCallback } from "react";

import { PillButton } from "@/components/ui/PillButton";
import { useEscapeKey, useRoomActionModalPresence } from "@/features/room/hooks";
import { formatInviteCodeForDisplay, getInviteCodeDigits } from "@/features/room/utils/inviteCode";
import { cn } from "@/lib/utils";
import type { FriendRoomRow } from "@/shared/types/room";

import { RoomModalShell } from "./RoomModalShell";

const COPY_SUCCESS_TOAST = "클립보드에 복사되었습니다";

export type InviteCodeModalProps = {
  room: FriendRoomRow | null;
  onClose: () => void;
  /** 복사 성공 시 하단 `BottomNavToast`와 동일 UI로 표시 */
  showToast?: (message: string) => void;
};

const InviteCodeModalInner = memo(function InviteCodeModalInner({
  displayRoom,
  visible,
  onClose,
  showToast,
}: {
  displayRoom: FriendRoomRow;
  visible: boolean;
  onClose: () => void;
  showToast?: (message: string) => void;
}) {
  const digits = getInviteCodeDigits(displayRoom);
  const display = formatInviteCodeForDisplay(digits);

  const handleCopy = useCallback(() => {
    void navigator.clipboard
      .writeText(digits)
      .then(() => {
        showToast?.(COPY_SUCCESS_TOAST);
      })
      .catch(() => undefined);
  }, [digits, showToast]);

  return (
    <RoomModalShell visible={visible} onOverlayClick={onClose} className="z-60">
      <div className="px-7 pt-7 pb-4">
        <h2 className="text-foreground text-base leading-tight font-bold">
          {displayRoom.displayName}
        </h2>
      </div>

      <div className="px-6 pt-2 pb-4">
        <div
          className={cn(
            "border-border/60 bg-muted/15 flex flex-col items-center gap-3 rounded-xl border px-4 py-8",
          )}
        >
          <p className="text-foreground text-center text-2xl font-semibold tracking-[0.35em] tabular-nums">
            {display}
          </p>
          <button
            type="button"
            className="bg-muted text-foreground hover:bg-muted/80 rounded-full px-4 py-1.5 text-xs font-medium transition-colors"
            onClick={handleCopy}
          >
            복사
          </button>
        </div>
      </div>

      <div className="px-6 pb-6">
        <PillButton type="button" variant="onboarding" onClick={onClose}>
          확인
        </PillButton>
      </div>
    </RoomModalShell>
  );
});

/**
 * 초대코드 표시·복사. RoomActionModal과 동일한 셸·등장 애니메이션.
 */
export function InviteCodeModal({ room, onClose, showToast }: InviteCodeModalProps) {
  const { displayRoom, visible } = useRoomActionModalPresence(room);

  useEscapeKey(onClose, displayRoom != null);

  if (!displayRoom) return null;

  return (
    <InviteCodeModalInner
      displayRoom={displayRoom}
      visible={visible}
      onClose={onClose}
      showToast={showToast}
    />
  );
}

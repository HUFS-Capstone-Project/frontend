import { Clipboard } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import { useOverlayFlowController, useRoomActionModalPresence } from "@/features/room/hooks";
import {
  COPY_ERROR_TOAST_MESSAGE,
  COPY_SUCCESS_TOAST_MESSAGE,
  copyTextToClipboard,
} from "@/features/room/utils/clipboard";
import { formatInviteCodeForDisplay, getInviteCodeValue } from "@/features/room/utils/inviteCode";
import type { FriendRoomRow } from "@/shared/types/room";

import { RoomModalShell } from "./RoomModalShell";
const FEEDBACK_RESET_MS = 1800;

type CopyFeedback = "idle" | "success" | "error";

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
  const inviteCode = getInviteCodeValue(displayRoom);
  const displayCode = formatInviteCodeForDisplay(inviteCode);
  const [isCopying, setIsCopying] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback>("idle");
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
    };
  }, []);

  const resetFeedbackLater = useCallback(() => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }

    feedbackTimerRef.current = setTimeout(() => {
      setCopyFeedback("idle");
      feedbackTimerRef.current = null;
    }, FEEDBACK_RESET_MS);
  }, []);

  const handleCopy = useCallback(async () => {
    if (isCopying) {
      return;
    }

    setIsCopying(true);

    try {
      await copyTextToClipboard(inviteCode);
      setCopyFeedback("success");
      showToast?.(COPY_SUCCESS_TOAST_MESSAGE);
    } catch {
      setCopyFeedback("error");
      showToast?.(COPY_ERROR_TOAST_MESSAGE);
    } finally {
      setIsCopying(false);
      resetFeedbackLater();
    }
  }, [inviteCode, isCopying, resetFeedbackLater, showToast]);

  return (
    <RoomModalShell visible={visible} onOverlayClick={onClose} className="z-60">
      <div className="px-6 pt-8 pb-5">
        <h2 className="text-foreground truncate text-center text-base leading-snug font-bold">
          {displayRoom.displayName}
        </h2>

        <div className="border-border/85 bg-muted/20 mt-4 rounded-xl border px-4 py-3.5">
          <p className="text-muted-foreground text-center text-[0.75rem] font-semibold tracking-[0.04em] uppercase">
            초대코드
          </p>
          <div className="scrollbar-hide mt-2 overflow-x-auto">
            <p
              className="text-foreground min-w-full text-center text-[1.5rem] font-semibold tracking-[0.07em] whitespace-nowrap tabular-nums"
              aria-label={`초대코드 ${displayCode}`}
            >
              {displayCode}
            </p>
          </div>
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              className="bg-muted text-foreground hover:bg-muted/80 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-colors disabled:opacity-70"
              aria-label="초대코드 복사"
              onClick={() => {
                void handleCopy();
              }}
              disabled={isCopying}
            >
              <Clipboard className="size-3.5" aria-hidden />
              {isCopying ? "복사 중..." : copyFeedback === "success" ? "복사됨" : "복사"}
            </button>
          </div>
        </div>
      </div>

      <div className="border-border/50 flex border-t">
        <button
          type="button"
          className="text-foreground hover:bg-muted/25 active:bg-muted/35 flex-1 py-4 text-sm font-medium transition-colors"
          aria-label="확인"
          onClick={onClose}
        >
          확인
        </button>
      </div>
    </RoomModalShell>
  );
});

/**
 * 초대코드 표시·복사. RoomActionModal과 동일한 셸·등장 애니메이션.
 */
export function InviteCodeModal({ room, onClose, showToast }: InviteCodeModalProps) {
  const { displayRoom, visible } = useRoomActionModalPresence(room);
  const { requestClose } = useOverlayFlowController({
    open: room != null,
    onClose,
    historyStateKey: "inviteCodeModal",
  });

  if (!displayRoom) return null;

  return (
    <InviteCodeModalInner
      displayRoom={displayRoom}
      visible={visible}
      onClose={requestClose}
      showToast={showToast}
    />
  );
}

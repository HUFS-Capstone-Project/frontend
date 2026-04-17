import { Clipboard } from "lucide-react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import { PillButton } from "@/components/ui/PillButton";
import { useOverlayFlowController, useRoomActionModalPresence } from "@/features/room/hooks";
import { formatInviteCodeForDisplay, getInviteCodeValue } from "@/features/room/utils/inviteCode";
import type { FriendRoomRow } from "@/shared/types/room";

import { RoomModalShell } from "./RoomModalShell";

const COPY_SUCCESS_TOAST = "클립보드에 복사되었습니다";
const COPY_ERROR_TOAST = "복사에 실패했습니다. 다시 시도해 주세요.";
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
      showToast?.(COPY_SUCCESS_TOAST);
    } catch {
      setCopyFeedback("error");
      showToast?.(COPY_ERROR_TOAST);
    } finally {
      setIsCopying(false);
      resetFeedbackLater();
    }
  }, [inviteCode, isCopying, resetFeedbackLater, showToast]);

  return (
    <RoomModalShell visible={visible} onOverlayClick={onClose} className="z-60">
      <div className="px-5 pt-4 pb-4">
        <h2 className="text-foreground truncate text-center text-[1.0rem] leading-tight font-semibold">
          {displayRoom.displayName}
        </h2>

        <div className="border-border/85 bg-muted/20 my-4 rounded-xl border px-4 py-3.5">
          <p className="text-muted-foreground text-center text-[0.7rem] font-semibold tracking-[0.04em] uppercase">
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

        <PillButton
          type="button"
          variant="modal"
          className="mt-1"
          aria-label="확인"
          onClick={onClose}
        >
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

async function copyTextToClipboard(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";

  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error("copy-failed");
  }
}

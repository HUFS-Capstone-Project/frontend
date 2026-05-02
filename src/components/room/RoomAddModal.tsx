import { Clipboard } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  FLEX_DUAL_ACTION_SLOT_CLASS,
  FLEX_DUAL_PROMPT_FOOTER_ROW_CLASS,
} from "@/components/common/action-footer-layout";
import { PlaceFlowCancelPillButton } from "@/components/place-flow/PlaceFlowCancelPillButton";
import { RoomAddDrawer } from "@/components/room/RoomAddDrawer";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { FullScreenOverlayShell } from "@/components/ui/FullScreenOverlayShell";
import { PillButton } from "@/components/ui/PillButton";
import { useControlledMaxLengthWarning } from "@/features/onboarding";
import { LINK_FLOW_PAGE_CLASS } from "@/features/place-flow/link-flow-layout";
import {
  PROMPT_FLOW_ALERT_BELOW_INPUT_CLASS,
  PROMPT_FLOW_ALERT_INLINE_CLASS,
} from "@/features/place-flow/prompt-flow-layout";
import { useRoomAddFlow } from "@/features/room";
import { ROOM_ACTION_MODAL_TRANSITION_MS } from "@/features/room/constants";
import { lengthAfterInsertAtSelection } from "@/lib/string-max-length";
import { cn } from "@/lib/utils";

const ROOM_NAME_MAX_LENGTH = 20;
const ROOM_NAME_LIMIT_HINT = `최대 ${ROOM_NAME_MAX_LENGTH}자 이내로 입력해주세요`;

type FullScreenStep = "none" | "createName" | "createInvite" | "join";

export type RoomAddModalProps = {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (message: string) => void;
};

export function RoomAddModal({ isOpen, onClose, showToast }: RoomAddModalProps) {
  const {
    step,
    roomName,
    inviteCode,
    roomNameError,
    inviteCodeError,
    createdRoom,
    isCopying,
    copyFeedback,
    displayInviteCode,
    isCreatePending,
    isJoinPending,
    isCreateSubmitEnabled,
    isJoinSubmitEnabled,
    openCreateFlow,
    openJoinFlow,
    closeFlow,
    clearFlowState,
    goToCreateNameStep,
    onChangeRoomName,
    onChangeInviteCode,
    submitCreate,
    submitJoin,
    copyInviteCode,
  } = useRoomAddFlow({
    onCloseSheet: onClose,
    showToast,
  });

  const [renderStep, setRenderStep] = useState<FullScreenStep>("none");
  const closeFlowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    limitWarning: roomNameLimitWarning,
    notifyLimitAttempt: notifyRoomNameLimitAttempt,
    applyChange: applyRoomNameChange,
    handleCompositionStart: handleRoomNameCompositionStart,
    handleCompositionEnd: handleRoomNameCompositionEnd,
  } = useControlledMaxLengthWarning(ROOM_NAME_MAX_LENGTH, roomName);

  useEffect(() => {
    if (step !== "none") {
      if (closeFlowTimerRef.current) {
        clearTimeout(closeFlowTimerRef.current);
        closeFlowTimerRef.current = null;
      }

      queueMicrotask(() => {
        setRenderStep(step);
      });
      return;
    }

    closeFlowTimerRef.current = setTimeout(() => {
      setRenderStep("none");
      clearFlowState();
      closeFlowTimerRef.current = null;
    }, ROOM_ACTION_MODAL_TRANSITION_MS);

    return () => {
      if (closeFlowTimerRef.current) {
        clearTimeout(closeFlowTimerRef.current);
        closeFlowTimerRef.current = null;
      }
    };
  }, [clearFlowState, step]);

  const handleChangeRoomName = useCallback(
    (next: string) => {
      applyRoomNameChange(next, onChangeRoomName);
    },
    [applyRoomNameChange, onChangeRoomName],
  );

  const handleRoomNameKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.nativeEvent.isComposing) {
        return;
      }
      if (event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }
      if (event.key.length !== 1) {
        return;
      }

      const input = event.currentTarget;
      const nextLength = lengthAfterInsertAtSelection(
        roomName,
        input.selectionStart,
        input.selectionEnd,
        1,
      );
      if (nextLength > ROOM_NAME_MAX_LENGTH) {
        notifyRoomNameLimitAttempt();
      }
    },
    [notifyRoomNameLimitAttempt, roomName],
  );

  const handleRoomNamePaste = useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      const pastedText = event.clipboardData.getData("text");
      if (!pastedText) {
        return;
      }

      const input = event.currentTarget;
      const nextLength = lengthAfterInsertAtSelection(
        roomName,
        input.selectionStart,
        input.selectionEnd,
        pastedText.length,
      );
      if (nextLength > ROOM_NAME_MAX_LENGTH) {
        notifyRoomNameLimitAttempt();
      }
    },
    [notifyRoomNameLimitAttempt, roomName],
  );

  return (
    <>
      <BottomSheet open={isOpen} onClose={onClose}>
        <RoomAddDrawer onSelectCreate={openCreateFlow} onSelectJoin={openJoinFlow} />
      </BottomSheet>

      <FullScreenOverlayShell
        open={step !== "none"}
        onClose={closeFlow}
        historyStateKey="roomAddFlow"
        overlayClassName="bg-overlay-scrim-strong md:bg-transparent"
      >
        {renderStep === "createName" ? (
          <div className={LINK_FLOW_PAGE_CLASS}>
            <div className="space-y-1">
              <h2 className="text-foreground text-xl leading-tight font-bold">방 이름 정하기</h2>
              <p className="text-muted-foreground text-sm">생성할 방 이름을 정해 주세요</p>
            </div>

            <div className="mt-6">
              <label htmlFor="room-create-name" className="sr-only">
                방 이름
              </label>
              <input
                id="room-create-name"
                value={roomName}
                maxLength={ROOM_NAME_MAX_LENGTH}
                onChange={(event) => {
                  handleChangeRoomName(event.target.value);
                }}
                onCompositionStart={handleRoomNameCompositionStart}
                onCompositionEnd={handleRoomNameCompositionEnd}
                onKeyDown={handleRoomNameKeyDown}
                onPaste={handleRoomNamePaste}
                aria-describedby={roomNameLimitWarning ? "room-name-limit-warning" : undefined}
                placeholder="예: 내 사랑♥️"
                autoComplete="off"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="none"
                className="border-input placeholder:text-muted-foreground bg-background h-12 w-full rounded-full border px-4 text-sm outline-none"
              />
              <div className="mt-2 min-h-5 px-1">
                {roomNameError ? (
                  <p className={PROMPT_FLOW_ALERT_INLINE_CLASS} role="alert">
                    {roomNameError}
                  </p>
                ) : (
                  <p
                    id="room-name-limit-warning"
                    className={cn("text-brand-coral text-xs", !roomNameLimitWarning && "invisible")}
                    aria-hidden={!roomNameLimitWarning}
                    aria-live={roomNameLimitWarning ? "polite" : undefined}
                  >
                    {ROOM_NAME_LIMIT_HINT}
                  </p>
                )}
              </div>
            </div>

            <div className={FLEX_DUAL_PROMPT_FOOTER_ROW_CLASS}>
              <div className={FLEX_DUAL_ACTION_SLOT_CLASS}>
                <PlaceFlowCancelPillButton onClick={closeFlow}>취소</PlaceFlowCancelPillButton>
              </div>
              <div className={FLEX_DUAL_ACTION_SLOT_CLASS}>
                <PillButton
                  type="button"
                  variant={isCreateSubmitEnabled ? "onboarding" : "onboardingMuted"}
                  disabled={!isCreateSubmitEnabled}
                  onClick={() => {
                    void submitCreate();
                  }}
                >
                  {isCreatePending ? "생성 중..." : "생성"}
                </PillButton>
              </div>
            </div>
          </div>
        ) : null}

        {renderStep === "createInvite" ? (
          <div className="scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-24 pb-8">
            <div className="mx-auto w-full max-w-sm text-center">
              <h2 className="text-foreground text-[2rem] leading-tight font-semibold">
                {roomName.trim()}
              </h2>
              <p className="text-foreground mt-6 text-sm">
                초대할 친구에게 하단의 입장코드를 공유하세요
              </p>

              <div className="border-border bg-card mt-6 rounded-3xl border px-5 py-6">
                <p className="text-foreground text-[1.75rem] leading-none font-medium tabular-nums">
                  {displayInviteCode}
                </p>
                <button
                  type="button"
                  className={cn(
                    "bg-muted text-foreground hover:bg-muted/80 mt-6 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-colors disabled:opacity-70",
                    !createdRoom?.inviteCode && "pointer-events-none opacity-60",
                  )}
                  aria-label="초대코드 복사"
                  onClick={() => {
                    void copyInviteCode();
                  }}
                  disabled={!createdRoom?.inviteCode || isCopying}
                >
                  <Clipboard className="size-3.5" aria-hidden />
                  {isCopying ? "복사 중..." : copyFeedback === "copied" ? "복사됨" : "복사"}
                </button>
              </div>

              {!createdRoom ? (
                <button
                  type="button"
                  className="text-muted-foreground mt-4 text-xs underline underline-offset-4"
                  onClick={goToCreateNameStep}
                >
                  이름 다시 정하기
                </button>
              ) : null}
            </div>

            <div className="mt-auto pt-8">
              <PillButton type="button" variant="modal" onClick={closeFlow}>
                닫기
              </PillButton>
            </div>
          </div>
        ) : null}

        {renderStep === "join" ? (
          <div className={LINK_FLOW_PAGE_CLASS}>
            <div className="space-y-1">
              <h2 className="text-foreground text-xl leading-tight font-bold">입장코드로 참여</h2>
              <p className="text-muted-foreground text-sm">
                친구에게 받은 입장코드를 입력해 주세요
              </p>
            </div>

            <div className="mt-6">
              <label htmlFor="room-join-code" className="sr-only">
                입장코드
              </label>
              <input
                id="room-join-code"
                value={inviteCode}
                maxLength={32}
                onChange={(event) => {
                  onChangeInviteCode(event.target.value);
                }}
                placeholder="입장코드를 입력해 주세요"
                autoComplete="off"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="none"
                className="border-input placeholder:text-muted-foreground bg-background h-12 w-full rounded-full border px-4 text-sm outline-none"
              />
              {inviteCodeError ? (
                <p className={PROMPT_FLOW_ALERT_BELOW_INPUT_CLASS} role="alert">
                  {inviteCodeError}
                </p>
              ) : null}
            </div>

            <div className={FLEX_DUAL_PROMPT_FOOTER_ROW_CLASS}>
              <div className={FLEX_DUAL_ACTION_SLOT_CLASS}>
                <PlaceFlowCancelPillButton onClick={closeFlow}>취소</PlaceFlowCancelPillButton>
              </div>
              <div className={FLEX_DUAL_ACTION_SLOT_CLASS}>
                <PillButton
                  type="button"
                  variant={isJoinSubmitEnabled ? "onboarding" : "onboardingMuted"}
                  disabled={!isJoinSubmitEnabled}
                  onClick={() => {
                    void submitJoin();
                  }}
                >
                  {isJoinPending ? "참여 중..." : "참여하기"}
                </PillButton>
              </div>
            </div>
          </div>
        ) : null}
      </FullScreenOverlayShell>
    </>
  );
}

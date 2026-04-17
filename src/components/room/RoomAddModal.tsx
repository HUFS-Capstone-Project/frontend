import { Clipboard } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { RoomAddDrawer } from "@/components/room/RoomAddDrawer";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { FullScreenOverlayShell } from "@/components/ui/FullScreenOverlayShell";
import { PillButton } from "@/components/ui/PillButton";
import { useRoomAddFlow } from "@/features/room";
import { cn } from "@/lib/utils";

const FLOW_TRANSITION_MS = 180;

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
    }, FLOW_TRANSITION_MS);

    return () => {
      if (closeFlowTimerRef.current) {
        clearTimeout(closeFlowTimerRef.current);
        closeFlowTimerRef.current = null;
      }
    };
  }, [clearFlowState, step]);

  return (
    <>
      <BottomSheet open={isOpen} onClose={onClose}>
        <RoomAddDrawer onSelectCreate={openCreateFlow} onSelectJoin={openJoinFlow} />
      </BottomSheet>

      <FullScreenOverlayShell
        open={step !== "none"}
        onClose={closeFlow}
        historyStateKey="roomAddFlow"
        overlayClassName="bg-black/45 md:bg-transparent"
      >
        {renderStep === "createName" ? (
          <div className="scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-16 pb-8">
            <div className="space-y-1">
              <h2 className="text-foreground text-xl leading-tight font-bold">방 이름 정하기</h2>
              <p className="text-muted-foreground text-sm">생성할 채팅방 제목을 입력해 주세요.</p>
            </div>

            <div className="mt-6">
              <label htmlFor="room-create-name" className="sr-only">
                방 이름
              </label>
              <input
                id="room-create-name"
                value={roomName}
                maxLength={20}
                onChange={(event) => {
                  onChangeRoomName(event.target.value);
                }}
                placeholder="예: 내 사랑♥️"
                autoComplete="off"
                className="border-input placeholder:text-muted-foreground h-12 w-full rounded-full border bg-white px-4 text-sm outline-none"
              />
              {roomNameError ? (
                <p className="text-destructive mt-2 px-1 text-sm" role="alert">
                  {roomNameError}
                </p>
              ) : null}
            </div>

            <div className="mt-auto grid grid-cols-2 gap-2.5 pt-6">
              <PillButton type="button" variant="outline" onClick={closeFlow}>
                취소
              </PillButton>
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

              <div className="border-border mt-6 rounded-3xl border bg-white px-5 py-6">
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
          <div className="scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-16 pb-8">
            <div className="space-y-1">
              <h2 className="text-foreground text-xl leading-tight font-bold">입장코드로 참여</h2>
              <p className="text-muted-foreground text-sm">
                친구에게 받은 입장코드를 입력해 주세요.
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
                className="border-input placeholder:text-muted-foreground h-12 w-full rounded-full border bg-white px-4 text-sm outline-none"
              />
              {inviteCodeError ? (
                <p className="text-destructive mt-2 px-1 text-sm" role="alert">
                  {inviteCodeError}
                </p>
              ) : null}
            </div>

            <div className="mt-auto grid grid-cols-2 gap-2.5 pt-6">
              <PillButton type="button" variant="outline" onClick={closeFlow}>
                취소
              </PillButton>
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
        ) : null}
      </FullScreenOverlayShell>
    </>
  );
}

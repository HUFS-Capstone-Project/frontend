import { Clipboard } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { RoomAddDrawer } from "@/components/room/RoomAddDrawer";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { PillButton } from "@/components/ui/PillButton";
import {
  type CreateRoomResponse,
  formatInviteCodeForDisplay,
  useCreateRoomMutation,
  useEscapeKey,
  useJoinRoomMutation,
} from "@/features/room";
import { cn } from "@/lib/utils";
import { isApiError } from "@/shared/api/axios";

const ROOM_NAME_MAX_LENGTH = 20;
const INVITE_CODE_MAX_LENGTH = 32;
const OPEN_FLOW_DELAY_MS = 260;
const COPY_FEEDBACK_RESET_MS = 1800;
const FLOW_TRANSITION_MS = 180;

const CREATE_SUCCESS_TOAST = "방이 생성되었습니다.";
const JOIN_SUCCESS_TOAST = "방에 참여했습니다.";
const COPY_SUCCESS_TOAST = "클립보드에 복사되었습니다.";
const COPY_ERROR_TOAST = "복사에 실패했습니다. 다시 시도해 주세요.";

type FullScreenStep = "none" | "createName" | "createInvite" | "join";
type CopyFeedback = "idle" | "copied";

export type RoomAddModalProps = {
  isOpen: boolean;
  onClose: () => void;
  showToast?: (message: string) => void;
};

export function RoomAddModal({ isOpen, onClose, showToast }: RoomAddModalProps) {
  const [fullScreenStep, setFullScreenStep] = useState<FullScreenStep>("none");
  const [renderStep, setRenderStep] = useState<FullScreenStep>("none");
  const [flowVisible, setFlowVisible] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [roomNameError, setRoomNameError] = useState<string | null>(null);
  const [inviteCodeError, setInviteCodeError] = useState<string | null>(null);
  const [createdRoom, setCreatedRoom] = useState<CreateRoomResponse | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback>("idle");

  const openFlowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeFlowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyPushedRef = useRef(false);
  const closedByPopStateRef = useRef(false);

  const createRoomMutation = useCreateRoomMutation();
  const joinRoomMutation = useJoinRoomMutation();

  const isCreatePending = createRoomMutation.isPending;
  const isJoinPending = joinRoomMutation.isPending;
  const isFullScreenOpen = fullScreenStep !== "none";
  const isFlowRendered = renderStep !== "none";
  const normalizedRoomName = roomName.trim();
  const normalizedInviteCode = inviteCode.trim();

  const displayInviteCode = useMemo(() => {
    if (!createdRoom?.inviteCode) {
      return "생성 후 발급";
    }

    return formatInviteCodeForDisplay(createdRoom.inviteCode);
  }, [createdRoom?.inviteCode]);

  const requestCloseFlow = useCallback(() => {
    if (historyPushedRef.current) {
      historyPushedRef.current = false;
      setFullScreenStep("none");
      window.history.back();
      return;
    }

    setFullScreenStep("none");
  }, []);

  useEscapeKey(requestCloseFlow, isFlowRendered);

  useEffect(() => {
    return () => {
      if (openFlowTimerRef.current) {
        clearTimeout(openFlowTimerRef.current);
        openFlowTimerRef.current = null;
      }

      if (closeFlowTimerRef.current) {
        clearTimeout(closeFlowTimerRef.current);
        closeFlowTimerRef.current = null;
      }

      if (copyFeedbackTimerRef.current) {
        clearTimeout(copyFeedbackTimerRef.current);
        copyFeedbackTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (fullScreenStep !== "none") {
      if (closeFlowTimerRef.current) {
        clearTimeout(closeFlowTimerRef.current);
        closeFlowTimerRef.current = null;
      }

      setRenderStep(fullScreenStep);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFlowVisible(true);
        });
      });
      return;
    }

    setFlowVisible(false);
    closeFlowTimerRef.current = setTimeout(() => {
      setRenderStep("none");
      setRoomName("");
      setInviteCode("");
      setRoomNameError(null);
      setInviteCodeError(null);
      setCreatedRoom(null);
      setIsCopying(false);
      setCopyFeedback("idle");
      closeFlowTimerRef.current = null;
    }, FLOW_TRANSITION_MS);

    return () => {
      if (closeFlowTimerRef.current) {
        clearTimeout(closeFlowTimerRef.current);
        closeFlowTimerRef.current = null;
      }
    };
  }, [fullScreenStep]);

  useEffect(() => {
    if (!isFullScreenOpen) {
      if (historyPushedRef.current && !closedByPopStateRef.current) {
        historyPushedRef.current = false;
        window.history.back();
      }

      closedByPopStateRef.current = false;
      return;
    }

    window.history.pushState({ roomAddFlow: true }, "");
    historyPushedRef.current = true;

    const handlePopState = () => {
      if (!historyPushedRef.current) {
        return;
      }

      closedByPopStateRef.current = true;
      historyPushedRef.current = false;
      setFullScreenStep("none");
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isFullScreenOpen]);

  const openCreateFlow = useCallback(() => {
    onClose();

    if (openFlowTimerRef.current) {
      clearTimeout(openFlowTimerRef.current);
    }

    openFlowTimerRef.current = setTimeout(() => {
      setRoomName("");
      setRoomNameError(null);
      setCreatedRoom(null);
      setCopyFeedback("idle");
      setFlowVisible(false);
      setFullScreenStep("createName");
      openFlowTimerRef.current = null;
    }, OPEN_FLOW_DELAY_MS);
  }, [onClose]);

  const openJoinFlow = useCallback(() => {
    onClose();

    if (openFlowTimerRef.current) {
      clearTimeout(openFlowTimerRef.current);
    }

    openFlowTimerRef.current = setTimeout(() => {
      setInviteCode("");
      setInviteCodeError(null);
      setFlowVisible(false);
      setFullScreenStep("join");
      openFlowTimerRef.current = null;
    }, OPEN_FLOW_DELAY_MS);
  }, [onClose]);

  const handleSubmitCreateFromName = useCallback(async () => {
    const validationError = validateRoomName(roomName);
    if (validationError) {
      setRoomNameError(validationError);
      showToast?.(validationError);
      return;
    }

    try {
      const created = await createRoomMutation.mutateAsync({ name: normalizedRoomName });
      setCreatedRoom(created);
      setRoomName(created.roomName);
      setRoomNameError(null);
      setCopyFeedback("idle");
      setFullScreenStep("createInvite");
      showToast?.(CREATE_SUCCESS_TOAST);
    } catch (error) {
      const message = resolveCreateRoomErrorMessage(error);
      setRoomNameError(message);
      showToast?.(message);
    }
  }, [createRoomMutation, normalizedRoomName, roomName, showToast]);

  const handleSubmitJoin = useCallback(async () => {
    const validationError = validateInviteCode(inviteCode);
    if (validationError) {
      setInviteCodeError(validationError);
      showToast?.(validationError);
      return;
    }

    try {
      await joinRoomMutation.mutateAsync({ inviteCode: normalizedInviteCode });
      showToast?.(JOIN_SUCCESS_TOAST);
      setFullScreenStep("none");
    } catch (error) {
      const message = resolveJoinRoomErrorMessage(error);
      setInviteCodeError(message);
      showToast?.(message);
    }
  }, [inviteCode, joinRoomMutation, normalizedInviteCode, showToast]);

  const handleCopyInviteCode = useCallback(async () => {
    if (!createdRoom?.inviteCode || isCopying) {
      return;
    }

    setIsCopying(true);

    try {
      await copyTextToClipboard(createdRoom.inviteCode);
      setCopyFeedback("copied");
      showToast?.(COPY_SUCCESS_TOAST);
    } catch {
      showToast?.(COPY_ERROR_TOAST);
    } finally {
      setIsCopying(false);
      if (copyFeedbackTimerRef.current) {
        clearTimeout(copyFeedbackTimerRef.current);
      }

      copyFeedbackTimerRef.current = setTimeout(() => {
        setCopyFeedback("idle");
        copyFeedbackTimerRef.current = null;
      }, COPY_FEEDBACK_RESET_MS);
    }
  }, [createdRoom?.inviteCode, isCopying, showToast]);

  const isNextEnabled =
    normalizedRoomName.length > 0 && normalizedRoomName.length <= ROOM_NAME_MAX_LENGTH;
  const isJoinEnabled =
    normalizedInviteCode.length > 0 &&
    normalizedInviteCode.length <= INVITE_CODE_MAX_LENGTH &&
    !isJoinPending;

  return (
    <>
      <BottomSheet open={isOpen} onClose={onClose}>
        <RoomAddDrawer onSelectCreate={openCreateFlow} onSelectJoin={openJoinFlow} />
      </BottomSheet>

      {isFlowRendered ? (
        <div
          className="fixed inset-0 z-80 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="닫기"
            className={cn(
              "absolute inset-0 bg-black/45 transition-opacity duration-180 ease-out md:bg-transparent",
              flowVisible ? "opacity-100" : "opacity-0",
            )}
            onClick={requestCloseFlow}
          />

          <section
            className={cn(
              "relative z-10 flex h-dvh w-full max-w-lg flex-col overflow-hidden bg-white transition-[opacity,transform] duration-180 ease-out",
              "md:max-w-3xl xl:max-w-lg",
              flowVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
            )}
          >
            {renderStep === "createName" ? (
              <div className="scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-16 pb-8">
                <div className="space-y-1">
                  <h2 className="text-foreground text-xl leading-tight font-bold">
                    방 이름 정하기
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    생성할 채팅방 제목을 입력해 주세요.
                  </p>
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
                      setRoomName(event.target.value);
                      setRoomNameError(null);
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
                  <PillButton type="button" variant="outline" onClick={requestCloseFlow}>
                    취소
                  </PillButton>
                  <PillButton
                    type="button"
                    variant={isNextEnabled && !isCreatePending ? "onboarding" : "onboardingMuted"}
                    disabled={!isNextEnabled || isCreatePending}
                    onClick={() => {
                      void handleSubmitCreateFromName();
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
                    {normalizedRoomName}
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
                        void handleCopyInviteCode();
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
                      onClick={() => setFullScreenStep("createName")}
                    >
                      이름 다시 정하기
                    </button>
                  ) : null}
                </div>

                <div className="mt-auto pt-8">
                  <PillButton type="button" variant="modal" onClick={requestCloseFlow}>
                    닫기
                  </PillButton>
                </div>
              </div>
            ) : null}

            {renderStep === "join" ? (
              <div className="scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-16 pb-8">
                <div className="space-y-1">
                  <h2 className="text-foreground text-xl leading-tight font-bold">
                    입장코드로 참여
                  </h2>
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
                    maxLength={INVITE_CODE_MAX_LENGTH}
                    onChange={(event) => {
                      setInviteCode(event.target.value);
                      setInviteCodeError(null);
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
                  <PillButton type="button" variant="outline" onClick={requestCloseFlow}>
                    취소
                  </PillButton>
                  <PillButton
                    type="button"
                    variant={isJoinEnabled ? "onboarding" : "onboardingMuted"}
                    disabled={!isJoinEnabled}
                    onClick={() => {
                      void handleSubmitJoin();
                    }}
                  >
                    {isJoinPending ? "참여 중..." : "참여하기"}
                  </PillButton>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </>
  );
}

function validateRoomName(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "방 이름을 입력해 주세요.";
  }

  if (trimmed.length > ROOM_NAME_MAX_LENGTH) {
    return "방 이름은 최대 20자까지 입력할 수 있어요.";
  }

  return null;
}

function validateInviteCode(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "입장코드를 입력해 주세요.";
  }

  if (trimmed.length > INVITE_CODE_MAX_LENGTH) {
    return "입장코드는 최대 32자까지 입력할 수 있어요.";
  }

  return null;
}

function resolveCreateRoomErrorMessage(error: unknown): string {
  if (!isApiError(error)) {
    return "방 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.";
  }

  if (error.status === 400 || error.code === "E400_VALIDATION") {
    return "방 이름을 다시 확인해 주세요.";
  }

  if (error.status === 401 || error.code === "E401_UNAUTHORIZED") {
    return error.detail ?? "로그인이 필요합니다. 다시 시도해 주세요.";
  }

  if (error.status === 403 || error.code === "E403_FORBIDDEN") {
    return error.detail ?? "요청 권한이 없습니다.";
  }

  if (error.status === 404 || error.code === "E404_NOT_FOUND") {
    return error.detail ?? "요청한 리소스를 찾을 수 없습니다.";
  }

  if (error.status != null && error.status >= 500) {
    return error.detail ?? "방 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.";
  }

  return error.detail ?? error.message;
}

function resolveJoinRoomErrorMessage(error: unknown): string {
  if (!isApiError(error)) {
    return "입장코드 참여에 실패했습니다. 잠시 후 다시 시도해 주세요.";
  }

  if (error.status === 400 || error.code === "E400_ILLEGAL_ARGUMENT") {
    return "유효하지 않은 입장코드입니다.";
  }

  if (error.status === 409 || error.code === "E409_CONFLICT") {
    return error.detail ?? "이미 참여한 방이거나 방 정원이 가득 찼습니다.";
  }

  if (error.status === 429 || error.code === "E429_TOO_MANY_REQUESTS") {
    return "잠시 후 다시 시도해 주세요.";
  }

  if (error.status === 401 || error.code === "E401_UNAUTHORIZED") {
    return error.detail ?? "로그인이 필요합니다. 다시 시도해 주세요.";
  }

  if (error.status === 403 || error.code === "E403_FORBIDDEN") {
    return error.detail ?? "요청 권한이 없습니다.";
  }

  if (error.status === 404 || error.code === "E404_NOT_FOUND") {
    return error.detail ?? "요청한 리소스를 찾을 수 없습니다.";
  }

  if (error.status != null && error.status >= 500) {
    return error.detail ?? "입장코드 참여에 실패했습니다. 잠시 후 다시 시도해 주세요.";
  }

  return error.detail ?? error.message;
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

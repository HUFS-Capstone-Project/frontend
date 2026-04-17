import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { isApiError } from "@/shared/api/axios";

import type { CreateRoomResponse } from "../api";
import { formatInviteCodeForDisplay } from "../utils/inviteCode";
import { useCreateRoomMutation } from "./use-create-room-mutation";
import { useJoinRoomMutation } from "./use-join-room-mutation";

const ROOM_NAME_MAX_LENGTH = 20;
const INVITE_CODE_MAX_LENGTH = 32;
const OPEN_FLOW_DELAY_MS = 260;
const COPY_FEEDBACK_RESET_MS = 1800;

const CREATE_SUCCESS_TOAST = "방이 생성되었습니다.";
const JOIN_SUCCESS_TOAST = "방에 참여했습니다.";
const COPY_SUCCESS_TOAST = "클립보드에 복사되었습니다.";
const COPY_ERROR_TOAST = "복사에 실패했습니다. 다시 시도해 주세요.";

type FullScreenStep = "none" | "createName" | "createInvite" | "join";
type CopyFeedback = "idle" | "copied";

type UseRoomAddFlowOptions = {
  onCloseSheet: () => void;
  showToast?: (message: string) => void;
};

type UseRoomAddFlowResult = {
  step: FullScreenStep;
  roomName: string;
  inviteCode: string;
  roomNameError: string | null;
  inviteCodeError: string | null;
  createdRoom: CreateRoomResponse | null;
  isCopying: boolean;
  copyFeedback: CopyFeedback;
  displayInviteCode: string;
  isCreatePending: boolean;
  isJoinPending: boolean;
  isCreateSubmitEnabled: boolean;
  isJoinSubmitEnabled: boolean;
  openCreateFlow: () => void;
  openJoinFlow: () => void;
  closeFlow: () => void;
  clearFlowState: () => void;
  goToCreateNameStep: () => void;
  onChangeRoomName: (value: string) => void;
  onChangeInviteCode: (value: string) => void;
  submitCreate: () => Promise<void>;
  submitJoin: () => Promise<void>;
  copyInviteCode: () => Promise<void>;
};

export function useRoomAddFlow({
  onCloseSheet,
  showToast,
}: UseRoomAddFlowOptions): UseRoomAddFlowResult {
  const [step, setStep] = useState<FullScreenStep>("none");
  const [roomName, setRoomName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [roomNameError, setRoomNameError] = useState<string | null>(null);
  const [inviteCodeError, setInviteCodeError] = useState<string | null>(null);
  const [createdRoom, setCreatedRoom] = useState<CreateRoomResponse | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedback>("idle");

  const openFlowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const createRoomMutation = useCreateRoomMutation();
  const joinRoomMutation = useJoinRoomMutation();

  const normalizedRoomName = roomName.trim();
  const normalizedInviteCode = inviteCode.trim();

  useEffect(() => {
    return () => {
      if (openFlowTimerRef.current) {
        clearTimeout(openFlowTimerRef.current);
        openFlowTimerRef.current = null;
      }

      if (copyFeedbackTimerRef.current) {
        clearTimeout(copyFeedbackTimerRef.current);
        copyFeedbackTimerRef.current = null;
      }
    };
  }, []);

  const clearFlowState = useCallback(() => {
    setStep("none");
    setRoomName("");
    setInviteCode("");
    setRoomNameError(null);
    setInviteCodeError(null);
    setCreatedRoom(null);
    setIsCopying(false);
    setCopyFeedback("idle");
  }, []);

  const openCreateFlow = useCallback(() => {
    onCloseSheet();

    if (openFlowTimerRef.current) {
      clearTimeout(openFlowTimerRef.current);
    }

    openFlowTimerRef.current = setTimeout(() => {
      setRoomName("");
      setRoomNameError(null);
      setCreatedRoom(null);
      setCopyFeedback("idle");
      setStep("createName");
      openFlowTimerRef.current = null;
    }, OPEN_FLOW_DELAY_MS);
  }, [onCloseSheet]);

  const openJoinFlow = useCallback(() => {
    onCloseSheet();

    if (openFlowTimerRef.current) {
      clearTimeout(openFlowTimerRef.current);
    }

    openFlowTimerRef.current = setTimeout(() => {
      setInviteCode("");
      setInviteCodeError(null);
      setStep("join");
      openFlowTimerRef.current = null;
    }, OPEN_FLOW_DELAY_MS);
  }, [onCloseSheet]);

  const closeFlow = useCallback(() => {
    setStep("none");
  }, []);

  const onChangeRoomName = useCallback((value: string) => {
    setRoomName(value);
    setRoomNameError(null);
  }, []);

  const onChangeInviteCode = useCallback((value: string) => {
    setInviteCode(value);
    setInviteCodeError(null);
  }, []);

  const submitCreate = useCallback(async () => {
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
      setStep("createInvite");
      showToast?.(CREATE_SUCCESS_TOAST);
    } catch (error) {
      const message = resolveCreateRoomErrorMessage(error);
      setRoomNameError(message);
      showToast?.(message);
    }
  }, [createRoomMutation, normalizedRoomName, roomName, showToast]);

  const submitJoin = useCallback(async () => {
    const validationError = validateInviteCode(inviteCode);
    if (validationError) {
      setInviteCodeError(validationError);
      showToast?.(validationError);
      return;
    }

    try {
      await joinRoomMutation.mutateAsync({ inviteCode: normalizedInviteCode });
      showToast?.(JOIN_SUCCESS_TOAST);
      setStep("none");
    } catch (error) {
      const message = resolveJoinRoomErrorMessage(error);
      setInviteCodeError(message);
      showToast?.(message);
    }
  }, [inviteCode, joinRoomMutation, normalizedInviteCode, showToast]);

  const copyInviteCode = useCallback(async () => {
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

  const displayInviteCode = useMemo(() => {
    if (!createdRoom?.inviteCode) {
      return "생성 후 발급";
    }

    return formatInviteCodeForDisplay(createdRoom.inviteCode);
  }, [createdRoom?.inviteCode]);

  return {
    step,
    roomName,
    inviteCode,
    roomNameError,
    inviteCodeError,
    createdRoom,
    isCopying,
    copyFeedback,
    displayInviteCode,
    isCreatePending: createRoomMutation.isPending,
    isJoinPending: joinRoomMutation.isPending,
    isCreateSubmitEnabled:
      normalizedRoomName.length > 0 &&
      normalizedRoomName.length <= ROOM_NAME_MAX_LENGTH &&
      !createRoomMutation.isPending,
    isJoinSubmitEnabled:
      normalizedInviteCode.length > 0 &&
      normalizedInviteCode.length <= INVITE_CODE_MAX_LENGTH &&
      !joinRoomMutation.isPending,
    openCreateFlow,
    openJoinFlow,
    closeFlow,
    clearFlowState,
    goToCreateNameStep: () => setStep("createName"),
    onChangeRoomName,
    onChangeInviteCode,
    submitCreate,
    submitJoin,
    copyInviteCode,
  };
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

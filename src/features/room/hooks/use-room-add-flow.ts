import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { resolveFormApiError, resolveGeneralApiErrorMessage } from "@/shared/api/error";

import type { CreateRoomResponse } from "../api";
import {
  COPY_ERROR_TOAST_MESSAGE,
  COPY_SUCCESS_TOAST_MESSAGE,
  copyTextToClipboard,
} from "../utils/clipboard";
import { formatInviteCodeForDisplay } from "../utils/inviteCode";
import { useCreateRoomMutation } from "./use-create-room-mutation";
import { useJoinRoomMutation } from "./use-join-room-mutation";

const ROOM_NAME_MAX_LENGTH = 20;
const INVITE_CODE_MAX_LENGTH = 32;
const OPEN_FLOW_DELAY_MS = 260;
const COPY_FEEDBACK_RESET_MS = 1800;

const CREATE_SUCCESS_TOAST = "방이 생성되었습니다";
const JOIN_SUCCESS_TOAST = "방에 참여했습니다";
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
      const formError = resolveFormApiError(error, { knownFields: ["name"] });

      if (formError.hasFieldErrors) {
        const nameError = formError.fieldErrors.name ?? formError.formError;
        if (nameError) {
          setRoomNameError(nameError);
          return;
        }
      }

      showToast?.(resolveCreateRoomErrorMessage(error));
    }
  }, [createRoomMutation, normalizedRoomName, roomName, showToast]);

  const submitJoin = useCallback(async () => {
    const validationError = validateInviteCode(inviteCode);
    if (validationError) {
      setInviteCodeError(validationError);
      return;
    }

    try {
      await joinRoomMutation.mutateAsync({ inviteCode: normalizedInviteCode });
      showToast?.(JOIN_SUCCESS_TOAST);
      setStep("none");
    } catch (error) {
      const formError = resolveFormApiError(error, { knownFields: ["inviteCode"] });

      if (formError.hasFieldErrors) {
        const inviteError = formError.fieldErrors.inviteCode ?? formError.formError;
        if (inviteError) {
          setInviteCodeError(inviteError);
          return;
        }
      }

      showToast?.(resolveJoinRoomErrorMessage(error));
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
      showToast?.(COPY_SUCCESS_TOAST_MESSAGE);
    } catch {
      showToast?.(COPY_ERROR_TOAST_MESSAGE);
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
    return "방 이름을 입력해 주세요";
  }

  if (trimmed.length > ROOM_NAME_MAX_LENGTH) {
    return "방 이름은 최대 20자까지 입력할 수 있어요.";
  }

  return null;
}

function validateInviteCode(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "입장코드를 입력해 주세요";
  }

  if (trimmed.length > INVITE_CODE_MAX_LENGTH) {
    return "입장코드는 최대 32자까지 입력할 수 있어요";
  }

  return null;
}

function resolveCreateRoomErrorMessage(error: unknown): string {
  return resolveGeneralApiErrorMessage(error, {
    fallback: "방 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    codeMessages: {
      E401_UNAUTHORIZED: "로그인이 필요합니다. 다시 시도해 주세요.",
      E403_FORBIDDEN: "요청 권한이 없습니다.",
      E404_NOT_FOUND: "요청한 리소스를 찾을 수 없습니다.",
    },
    statusMessages: {
      401: "로그인이 필요합니다. 다시 시도해 주세요.",
      403: "요청 권한이 없습니다.",
      404: "요청한 리소스를 찾을 수 없습니다.",
      500: "방 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      502: "방 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    },
  });
}

function resolveJoinRoomErrorMessage(error: unknown): string {
  return resolveGeneralApiErrorMessage(error, {
    fallback: "입장코드 참여에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    codeMessages: {
      E400_ILLEGAL_ARGUMENT: "유효하지 않은 입장코드입니다.",
      E401_UNAUTHORIZED: "로그인이 필요합니다. 다시 시도해 주세요.",
      E403_FORBIDDEN: "요청 권한이 없습니다.",
      E404_NOT_FOUND: "요청한 리소스를 찾을 수 없습니다.",
      E409_CONFLICT: "이미 참여한 방이거나 방 정원이 가득 찼습니다.",
      E429_TOO_MANY_REQUESTS: "잠시 후 다시 시도해 주세요.",
    },
    statusMessages: {
      400: "유효하지 않은 입장코드입니다.",
      401: "로그인이 필요합니다. 다시 시도해 주세요.",
      403: "요청 권한이 없습니다.",
      404: "요청한 리소스를 찾을 수 없습니다.",
      409: "이미 참여한 방이거나 방 정원이 가득 찼습니다.",
      429: "잠시 후 다시 시도해 주세요.",
      500: "입장코드 참여에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      502: "입장코드 참여에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    },
  });
}

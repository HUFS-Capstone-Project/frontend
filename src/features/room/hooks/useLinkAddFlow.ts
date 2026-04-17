import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { isApiError } from "@/shared/api/axios";
import type { FriendRoomRow } from "@/shared/types/room";

import {
  buildMockPlacesFromCaption,
  type CaptionResult,
  confirmMockPlaceSelection,
  mapLinkStatusToCaptionResult,
  type Step,
} from "../link-add";
import { roomQueryKeys } from "../query-keys";
import { useLinkStatusPollingQuery } from "./use-link-status-polling-query";
import { useRegisterLinkMutation } from "./use-register-link-mutation";

const DEFAULT_STEP: Step = "input";
const LINK_STATUS_POLLING_INTERVAL_MS = 2_500;

type UseLinkAddFlowOptions = {
  room: FriendRoomRow | null;
  activeRoomId?: string | null;
};

type UseLinkAddFlowResult = {
  step: Step;
  renderStep: Step;
  url: string;
  setUrl: (value: string) => void;
  selectedMockPlaceId: string | null;
  setSelectedMockPlaceId: (value: string | null) => void;
  renderCaptionResult: CaptionResult | null;
  mockPlaces: ReturnType<typeof buildMockPlacesFromCaption>;
  isSubmitting: boolean;
  isSubmitEnabled: boolean;
  cancelOngoingSubmission: () => void;
  resetFlow: () => void;
  submitLink: () => Promise<void>;
  retryPolling: () => Promise<void>;
  openMockPlaceScreen: () => void;
  confirmMockSelection: () => Promise<void>;
};

export function useLinkAddFlow({
  room,
  activeRoomId,
}: UseLinkAddFlowOptions): UseLinkAddFlowResult {
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>(DEFAULT_STEP);
  const [url, setUrl] = useState("");
  const [linkId, setLinkId] = useState<number | null>(null);
  const [captionResult, setCaptionResult] = useState<CaptionResult | null>(null);
  const [selectedMockPlaceId, setSelectedMockPlaceId] = useState<string | null>(null);

  const submitSequenceRef = useRef(0);

  const registerLinkMutation = useRegisterLinkMutation();
  const linkStatusQuery = useLinkStatusPollingQuery(linkId, {
    enabled: step === "processing" && linkId != null,
    pollingIntervalMs: LINK_STATUS_POLLING_INTERVAL_MS,
  });

  const resetFlow = useCallback(() => {
    setStep(DEFAULT_STEP);
    setUrl("");
    setLinkId(null);
    setCaptionResult(null);
    setSelectedMockPlaceId(null);
  }, []);

  const resetKey = activeRoomId ?? room?.id ?? null;

  useEffect(() => {
    submitSequenceRef.current += 1;
    queueMicrotask(resetFlow);
  }, [resetFlow, resetKey]);

  const cancelOngoingSubmission = useCallback(() => {
    submitSequenceRef.current += 1;
  }, []);

  const polledCaptionResult = useMemo<CaptionResult | null>(() => {
    if (step !== "processing") {
      return null;
    }

    const latest = linkStatusQuery.data;
    if (
      latest &&
      (latest.completed || latest.status === "SUCCEEDED" || latest.status === "FAILED")
    ) {
      const mapped = mapLinkStatusToCaptionResult(latest);

      if (latest.status === "SUCCEEDED" && !latest.caption) {
        return {
          ...mapped,
          errorMessage: "캡션 추출 결과가 비어 있습니다. 다시 시도해 주세요.",
        };
      }

      return mapped;
    }

    if (linkStatusQuery.error) {
      return {
        linkId: linkId ?? 0,
        originalUrl: url.trim(),
        caption: null,
        status: "FAILED",
        completed: true,
        errorMessage: resolveLinkStatusErrorMessage(linkStatusQuery.error),
      };
    }

    return null;
  }, [linkId, linkStatusQuery.data, linkStatusQuery.error, step, url]);

  const renderStep = step === "processing" && polledCaptionResult ? "captionResult" : step;

  const renderCaptionResult =
    renderStep === "captionResult" ? (polledCaptionResult ?? captionResult) : null;

  const submitLink = useCallback(async () => {
    if (!room) {
      return;
    }

    const trimmedUrl = url.trim();
    if (trimmedUrl.length === 0) {
      return;
    }

    const submitSequence = submitSequenceRef.current + 1;
    submitSequenceRef.current = submitSequence;

    setUrl(trimmedUrl);
    setCaptionResult(null);
    setSelectedMockPlaceId(null);
    setLinkId(null);
    setStep("processing");

    try {
      const registered = await registerLinkMutation.mutateAsync({
        roomId: room.id,
        url: trimmedUrl,
        source: "WEB",
      });

      if (submitSequenceRef.current !== submitSequence) {
        return;
      }

      setLinkId(registered.linkId);
    } catch (error) {
      if (submitSequenceRef.current !== submitSequence) {
        return;
      }

      setCaptionResult({
        linkId: 0,
        originalUrl: trimmedUrl,
        caption: null,
        status: "FAILED",
        completed: true,
        errorMessage: resolveRegisterLinkErrorMessage(error),
      });
      setStep("captionResult");
    }
  }, [registerLinkMutation, room, url]);

  const retryPolling = useCallback(async () => {
    if (linkId == null) {
      await submitLink();
      return;
    }

    setCaptionResult(null);
    setStep("processing");

    queryClient.removeQueries({ queryKey: roomQueryKeys.linkStatus(linkId) });
    await linkStatusQuery.refetch();
  }, [linkId, linkStatusQuery, queryClient, submitLink]);

  const mockPlaces = useMemo(
    () => buildMockPlacesFromCaption(renderCaptionResult?.caption ?? null),
    [renderCaptionResult?.caption],
  );

  const openMockPlaceScreen = useCallback(() => {
    setSelectedMockPlaceId(null);
    setStep("selectPlaceMock");
  }, []);

  const confirmMockSelection = useCallback(async () => {
    if (!selectedMockPlaceId) {
      return;
    }

    await confirmMockPlaceSelection({ placeId: selectedMockPlaceId });
    setStep("mockSuccess");
  }, [selectedMockPlaceId]);

  return {
    step,
    renderStep,
    url,
    setUrl,
    selectedMockPlaceId,
    setSelectedMockPlaceId,
    renderCaptionResult,
    mockPlaces,
    isSubmitting: registerLinkMutation.isPending,
    isSubmitEnabled: url.trim().length > 0 && !registerLinkMutation.isPending,
    cancelOngoingSubmission,
    resetFlow,
    submitLink,
    retryPolling,
    openMockPlaceScreen,
    confirmMockSelection,
  };
}

function resolveRegisterLinkErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.code === "E409_CONFLICT") {
      return "이미 등록된 링크입니다. 처리 결과를 다시 확인해 주세요.";
    }

    if (error.code === "E403_FORBIDDEN") {
      return "요청 권한이 없습니다. 잠시 후 다시 시도해 주세요.";
    }

    return error.message;
  }

  return "링크 등록에 실패했습니다. 다시 시도해 주세요.";
}

function resolveLinkStatusErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.code === "E502_EXTERNAL_API") {
      return "처리 서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.";
    }

    return error.message;
  }

  return "링크 상태를 확인하지 못했습니다. 다시 시도해 주세요.";
}

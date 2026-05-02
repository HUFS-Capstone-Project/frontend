import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  isLinkAnalysisTerminal,
  useLinkAnalysisStatusQuery,
  useRequestLinkAnalysisMutation,
} from "@/features/link-analysis";
import { isApiError } from "@/shared/api/axios";
import type { FriendRoomRow } from "@/shared/types/room";

import {
  buildMockPlacesFromCaption,
  type CaptionResult,
  confirmMockPlaceSelection,
  mapLinkAnalysisToCaptionResult,
  type Step,
} from "../link-add";
import { incrementRoomLinkCountInCache } from "../utils/room-query-cache";

const DEFAULT_STEP: Step = "input";
const LINK_ANALYSIS_POLLING_INTERVAL_MS = 2_000;

type UseLinkAddFlowOptions = {
  room: FriendRoomRow | null;
  activeRoomId?: string | null;
};

type UseLinkAddFlowResult = {
  step: Step;
  renderStep: Step;
  url: string;
  setUrl: (value: string) => void;
  urlError: string | null;
  selectedMockPlaceId: string | null;
  setSelectedMockPlaceId: (value: string | null) => void;
  renderCaptionResult: CaptionResult | null;
  mockPlaces: ReturnType<typeof buildMockPlacesFromCaption>;
  isSubmitting: boolean;
  isSubmitEnabled: boolean;
  hasSaved: boolean;
  isSavePending: boolean;
  cancelOngoingSubmission: () => void;
  resetFlow: () => void;
  submitLink: () => Promise<void>;
  retryLinkAnalysis: () => Promise<void>;
  saveSucceededResult: () => Promise<void>;
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
  const [urlError, setUrlError] = useState<string | null>(null);
  const [linkId, setLinkId] = useState<number | null>(null);
  const [captionResult, setCaptionResult] = useState<CaptionResult | null>(null);
  const [selectedMockPlaceId, setSelectedMockPlaceId] = useState<string | null>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const [isSavePending, setIsSavePending] = useState(false);

  const submitSequenceRef = useRef(0);

  const requestLinkAnalysisMutation = useRequestLinkAnalysisMutation(room?.id ?? null);
  const linkAnalysisStatusQuery = useLinkAnalysisStatusQuery({
    roomId: room?.id ?? null,
    linkId,
    enabled: step === "processing" && linkId != null,
    pollingIntervalMs: LINK_ANALYSIS_POLLING_INTERVAL_MS,
  });

  const handleChangeUrl = useCallback((value: string) => {
    setUrl(value);
    setUrlError(null);
  }, []);

  const resetFlow = useCallback(() => {
    setStep(DEFAULT_STEP);
    setUrl("");
    setUrlError(null);
    setLinkId(null);
    setCaptionResult(null);
    setSelectedMockPlaceId(null);
    setHasSaved(false);
    setIsSavePending(false);
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

    const latest = linkAnalysisStatusQuery.data;
    if (latest && isLinkAnalysisTerminal(latest.status)) {
      const mapped = mapLinkAnalysisToCaptionResult(latest, url.trim());

      if (latest.status === "SUCCEEDED" && !latest.caption) {
        return {
          ...mapped,
          errorMessage: "캡션 추출 결과가 비어 있습니다. 다시 시도해 주세요.",
        };
      }

      return mapped;
    }

    if (linkAnalysisStatusQuery.error) {
      return {
        linkId: linkId ?? 0,
        originalUrl: url.trim(),
        caption: null,
        status: "FAILED",
        completed: true,
        errorMessage: resolveLinkStatusErrorMessage(linkAnalysisStatusQuery.error),
      };
    }

    return null;
  }, [linkAnalysisStatusQuery.data, linkAnalysisStatusQuery.error, linkId, step, url]);

  const renderStep = step === "processing" && polledCaptionResult ? "captionResult" : step;

  const renderCaptionResult =
    renderStep === "captionResult" ? (polledCaptionResult ?? captionResult) : null;

  const submitLink = useCallback(async () => {
    if (!room) {
      return;
    }

    const validationError = validateLinkUrl(url);
    if (validationError) {
      setUrlError(validationError);
      return;
    }

    const trimmedUrl = url.trim();
    const submitSequence = submitSequenceRef.current + 1;
    submitSequenceRef.current = submitSequence;

    setUrl(trimmedUrl);
    setUrlError(null);
    setCaptionResult(null);
    setSelectedMockPlaceId(null);
    setLinkId(null);
    setHasSaved(false);
    setStep("processing");

    try {
      const requested = await requestLinkAnalysisMutation.mutateAsync({
        url: trimmedUrl,
        source: "WEB",
      });

      if (submitSequenceRef.current !== submitSequence) {
        return;
      }

      setLinkId(requested.linkId);
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
  }, [requestLinkAnalysisMutation, room, url]);

  const retryLinkAnalysis = useCallback(async () => {
    setCaptionResult(null);
    await submitLink();
  }, [submitLink]);

  const saveSucceededResult = useCallback(async () => {
    if (!room || hasSaved || isSavePending) {
      return;
    }

    if (!renderCaptionResult || renderCaptionResult.status !== "SUCCEEDED") {
      return;
    }

    setIsSavePending(true);

    try {
      incrementRoomLinkCountInCache(queryClient, room.id);
      setHasSaved(true);
    } finally {
      setIsSavePending(false);
    }
  }, [hasSaved, isSavePending, queryClient, renderCaptionResult, room]);

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
    setUrl: handleChangeUrl,
    urlError,
    selectedMockPlaceId,
    setSelectedMockPlaceId,
    renderCaptionResult,
    mockPlaces,
    isSubmitting: requestLinkAnalysisMutation.isPending,
    isSubmitEnabled: validateLinkUrl(url) == null && !requestLinkAnalysisMutation.isPending,
    hasSaved,
    isSavePending,
    cancelOngoingSubmission,
    resetFlow,
    submitLink,
    retryLinkAnalysis,
    saveSucceededResult,
    openMockPlaceScreen,
    confirmMockSelection,
  };
}

function validateLinkUrl(value: string): string | null {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return "링크를 입력해 주세요.";
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return "올바른 링크 형식이 아니에요.";
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return "http/https 링크만 등록할 수 있어요.";
  }

  const hostname = parsed.hostname.toLowerCase();
  const isInstagram =
    hostname === "instagram.com" ||
    hostname === "www.instagram.com" ||
    hostname.endsWith(".instagram.com");

  if (!isInstagram) {
    return "인스타그램 링크만 등록할 수 있어요.";
  }

  return null;
}

function resolveRegisterLinkErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.status === 400) {
      return error.message || "입력한 링크를 확인해 주세요.";
    }

    if (error.status === 403 || error.code === "E403_FORBIDDEN") {
      return "요청 권한이 없습니다. 방 참여 상태를 확인해 주세요.";
    }

    if (error.status === 500 || error.status === 502) {
      return "서버에서 링크 분석 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    }

    return error.message;
  }

  return "링크 분석 요청에 실패했습니다. 다시 시도해 주세요.";
}

function resolveLinkStatusErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.status === 403 || error.code === "E403_FORBIDDEN") {
      return "분석 결과를 조회할 권한이 없습니다.";
    }

    if (error.status === 500 || error.status === 502 || error.code === "E502_EXTERNAL_API") {
      return "서버에서 분석 상태를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    }

    return error.message;
  }

  return "링크 분석 상태를 확인하지 못했습니다. 다시 시도해 주세요.";
}

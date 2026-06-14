import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import type {
  CandidatePlace,
  LinkAnalysisSource,
  LinkAnalysisStatus,
} from "@/features/link-analysis";
import {
  canSelectCandidatePlace,
  isLinkAnalysisTerminal,
  useLinkAnalysisStatusQuery,
  useRequestLinkAnalysisMutation,
  useRetryLinkAnalysisMutation,
  useSaveCandidatePlacesMutation,
} from "@/features/link-analysis";
import { resolveFormApiError, resolveGeneralApiErrorMessage } from "@/shared/api/error";
import type { RoomListRow } from "@/shared/types/room";
import type { LinkAddDraft } from "@/store/link-add-draft-store";
import { useLinkAddDraftStore } from "@/store/link-add-draft-store";

import {
  type LinkAnalysisResult,
  mapLinkAnalysisRequestToResult,
  mapLinkAnalysisToResult,
  type Step,
} from "../link-add";
import { incrementRoomPlaceCountInCache } from "../utils/room-query-cache";

const DEFAULT_STEP: Step = "input";
const LINK_ANALYSIS_POLLING_INTERVAL_MS = 2_000;
const EMPTY_CANDIDATE_PLACES: CandidatePlace[] = [];

export type LinkAddCandidatesBootstrap = {
  analysisRequestId: number;
  originalUrl: string;
  selectedKakaoPlaceIds?: string[];
};

type UseLinkAddFlowOptions = {
  room: RoomListRow | null;
  activeRoomId?: string | null;
  /** Set when reopening the modal after 장소 수정 (room location state). */
  draftSessionId?: string | null;
  /** 후보 전용 라우트 진입 시 analysisRequestId·originalUrl·선택 상태를 메모리에서 복구 */
  candidatesBootstrap?: LinkAddCandidatesBootstrap | null;
  initialOriginalUrl?: string | null;
  autoSubmitInitialUrl?: boolean;
  linkSource?: LinkAnalysisSource;
  /** Called after 장소 후보 저장 API가 성공한 뒤 (모달 닫기 등). */
  onSaveSuccess?: () => void;
};

type UseLinkAddFlowResult = {
  step: Step;
  renderStep: Step;
  originalUrl: string;
  setOriginalUrl: (value: string) => void;
  originalUrlError: string | null;
  renderAnalysisResult: LinkAnalysisResult | null;
  selectedKakaoPlaceIds: string[];
  currentStatus: LinkAnalysisStatus | null;
  saveError: string | null;
  isSubmitting: boolean;
  isSubmitEnabled: boolean;
  isSavePending: boolean;
  canSaveSelectedCandidates: boolean;
  cancelOngoingSubmission: () => void;
  resetFlow: () => void;
  submitLink: () => Promise<void>;
  retryLinkAnalysis: () => Promise<void>;
  toggleCandidatePlace: (place: CandidatePlace) => void;
  saveSelectedCandidatePlaces: () => Promise<void>;
  persistDraftForEdit: () => string;
};

export function useLinkAddFlow({
  room,
  activeRoomId,
  draftSessionId = null,
  candidatesBootstrap = null,
  initialOriginalUrl = null,
  autoSubmitInitialUrl = false,
  linkSource = "WEB",
  onSaveSuccess,
}: UseLinkAddFlowOptions): UseLinkAddFlowResult {
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>(DEFAULT_STEP);
  const [originalUrl, setOriginalUrlState] = useState("");
  const [originalUrlError, setOriginalUrlError] = useState<string | null>(null);
  const [analysisRequestId, setAnalysisRequestId] = useState<number | null>(null);
  const [linkId, setLinkId] = useState<number | null>(null);
  const [requestJobId, setRequestJobId] = useState<string | null>(null);
  const [requestStatus, setRequestStatus] = useState<LinkAnalysisStatus | null>(null);
  const [requestErrorResult, setRequestErrorResult] = useState<LinkAnalysisResult | null>(null);
  const [selectedKakaoPlaceIds, setSelectedKakaoPlaceIds] = useState<string[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);

  const submitSequenceRef = useRef(0);
  const shouldAutoSubmitInitialUrlRef = useRef(false);

  const requestLinkAnalysisMutation = useRequestLinkAnalysisMutation(room?.id ?? null);
  const retryLinkAnalysisMutation = useRetryLinkAnalysisMutation(room?.id ?? null);
  const saveCandidatePlacesMutation = useSaveCandidatePlacesMutation({
    roomId: room?.id ?? null,
    analysisRequestId,
  });
  const linkAnalysisStatusQuery = useLinkAnalysisStatusQuery({
    roomId: room?.id ?? null,
    analysisRequestId,
    enabled: (step === "processing" || step === "analysisResult") && analysisRequestId != null,
    pollingIntervalMs: LINK_ANALYSIS_POLLING_INTERVAL_MS,
  });

  const handleChangeOriginalUrl = useCallback((value: string) => {
    setOriginalUrlState(value);
    setOriginalUrlError(null);
  }, []);

  const resetFlow = useCallback(() => {
    setStep(DEFAULT_STEP);
    setOriginalUrlState("");
    setOriginalUrlError(null);
    setAnalysisRequestId(null);
    setLinkId(null);
    setRequestJobId(null);
    setRequestStatus(null);
    setRequestErrorResult(null);
    setSelectedKakaoPlaceIds([]);
    setSaveError(null);
  }, []);

  const resetKey = activeRoomId ?? room?.id ?? null;

  useLayoutEffect(() => {
    const roomId = activeRoomId ?? room?.id ?? null;
    if (roomId == null) {
      return;
    }

    const applyDraft = (draft: LinkAddDraft) => {
      submitSequenceRef.current += 1;
      queueMicrotask(() => {
        setOriginalUrlState(draft.originalUrl);
        setAnalysisRequestId(draft.analysisRequestId);
        setLinkId(draft.linkId);
        setRequestJobId(draft.requestJobId);
        setRequestStatus(null);
        setRequestErrorResult(null);
        setStep("analysisResult");
        setSelectedKakaoPlaceIds(draft.selectedKakaoPlaceIds);
        setSaveError(null);
      });
    };

    if (typeof draftSessionId === "string" && draftSessionId.length > 0) {
      const draft = useLinkAddDraftStore.getState().takeDraft(roomId, draftSessionId);
      if (draft) {
        applyDraft(draft);
        return;
      }
    }

    if (candidatesBootstrap != null && Number.isFinite(candidatesBootstrap.analysisRequestId)) {
      submitSequenceRef.current += 1;
      queueMicrotask(() => {
        setOriginalUrlState(candidatesBootstrap.originalUrl);
        setAnalysisRequestId(candidatesBootstrap.analysisRequestId);
        setLinkId(null);
        setRequestJobId(null);
        setRequestStatus(null);
        setRequestErrorResult(null);
        setStep("analysisResult");
        setSelectedKakaoPlaceIds(candidatesBootstrap.selectedKakaoPlaceIds ?? []);
        setSaveError(null);
      });
      return;
    }

    const draft = useLinkAddDraftStore.getState().takeDraft(roomId, draftSessionId);
    if (draft) {
      applyDraft(draft);
      return;
    }

    const trimmedInitialOriginalUrl = initialOriginalUrl?.trim() ?? "";
    if (trimmedInitialOriginalUrl.length > 0) {
      submitSequenceRef.current += 1;
      shouldAutoSubmitInitialUrlRef.current = autoSubmitInitialUrl;
      queueMicrotask(() => {
        setOriginalUrlState(trimmedInitialOriginalUrl);
        setOriginalUrlError(null);
        setAnalysisRequestId(null);
        setLinkId(null);
        setRequestJobId(null);
        setRequestStatus(null);
        setRequestErrorResult(null);
        setStep(DEFAULT_STEP);
        setSelectedKakaoPlaceIds([]);
        setSaveError(null);
      });
      return;
    }

    submitSequenceRef.current += 1;
    queueMicrotask(resetFlow);
  }, [
    activeRoomId,
    autoSubmitInitialUrl,
    candidatesBootstrap,
    draftSessionId,
    initialOriginalUrl,
    resetKey,
    resetFlow,
    room?.id,
  ]);

  const cancelOngoingSubmission = useCallback(() => {
    submitSequenceRef.current += 1;
  }, []);

  const polledAnalysisResult = useMemo<LinkAnalysisResult | null>(() => {
    const latest = linkAnalysisStatusQuery.data;

    if (!latest) {
      return null;
    }

    return mapLinkAnalysisToResult({
      linkAnalysis: latest,
      fallbackOriginalUrl: originalUrl.trim(),
      jobId: requestJobId,
    });
  }, [linkAnalysisStatusQuery.data, originalUrl, requestJobId]);

  const queryErrorResult = useMemo<LinkAnalysisResult | null>(() => {
    if (!linkAnalysisStatusQuery.error) {
      return null;
    }

    return {
      linkId,
      analysisRequestId,
      jobId: requestJobId,
      originalUrl: originalUrl.trim(),
      status: "FAILED",
      candidatePlaces: [],
      contentText: null,
      linkStats: null,
      completed: true,
      errorMessage: resolveLinkStatusErrorMessage(linkAnalysisStatusQuery.error),
    };
  }, [analysisRequestId, linkAnalysisStatusQuery.error, linkId, originalUrl, requestJobId]);

  const renderAnalysisResult =
    polledAnalysisResult && isLinkAnalysisTerminal(polledAnalysisResult.status)
      ? polledAnalysisResult
      : (queryErrorResult ?? requestErrorResult);
  const renderStep =
    step === "processing" && renderAnalysisResult != null ? "analysisResult" : step;
  const currentStatus = polledAnalysisResult?.status ?? requestStatus;

  const candidatePlaces = renderAnalysisResult?.candidatePlaces ?? EMPTY_CANDIDATE_PLACES;

  const selectableKakaoPlaceIds = useMemo(() => {
    const ids = new Set<string>();

    for (const place of candidatePlaces) {
      if (canSelectCandidatePlace(place)) {
        ids.add(place.kakaoPlaceId);
      }
    }

    return ids;
  }, [candidatePlaces]);

  const selectedSelectableKakaoPlaceIds = useMemo(
    () => selectedKakaoPlaceIds.filter((id) => selectableKakaoPlaceIds.has(id)),
    [selectableKakaoPlaceIds, selectedKakaoPlaceIds],
  );

  const canSaveSelectedCandidates =
    renderAnalysisResult?.status === "SUCCEEDED" &&
    selectedSelectableKakaoPlaceIds.length > 0 &&
    !saveCandidatePlacesMutation.isPending;

  const submitLink = useCallback(async () => {
    if (!room) {
      return;
    }

    const validationError = validateOriginalUrl(originalUrl);
    if (validationError) {
      setOriginalUrlError(validationError);
      return;
    }

    const trimmedOriginalUrl = originalUrl.trim();
    const submitSequence = submitSequenceRef.current + 1;
    submitSequenceRef.current = submitSequence;

    setOriginalUrlState(trimmedOriginalUrl);
    setOriginalUrlError(null);
    setAnalysisRequestId(null);
    setLinkId(null);
    setRequestJobId(null);
    setRequestStatus(null);
    setRequestErrorResult(null);
    setSelectedKakaoPlaceIds([]);
    setSaveError(null);
    if (room.id) {
      useLinkAddDraftStore.getState().clearForRoom(room.id);
    }
    setStep("processing");

    try {
      const requested = await requestLinkAnalysisMutation.mutateAsync({
        originalUrl: trimmedOriginalUrl,
        source: linkSource,
      });

      if (submitSequenceRef.current !== submitSequence) {
        return;
      }

      setAnalysisRequestId(requested.analysisRequestId);
      setLinkId(requested.linkId);
      setRequestJobId(requested.jobId ?? null);
      setRequestStatus(requested.status);

      if (shouldRenderRequestResultImmediately(requested.status)) {
        setRequestErrorResult(
          mapLinkAnalysisRequestToResult({
            requested,
            originalUrl: trimmedOriginalUrl,
          }),
        );
        setStep("analysisResult");
      }
    } catch (error) {
      if (submitSequenceRef.current !== submitSequence) {
        return;
      }

      const inputFieldError = resolveLinkInputFieldError(error);
      if (inputFieldError) {
        setOriginalUrlError(inputFieldError);
        setStep("input");
        return;
      }

      setRequestErrorResult({
        analysisRequestId: null,
        linkId: null,
        jobId: null,
        originalUrl: trimmedOriginalUrl,
        status: "FAILED",
        candidatePlaces: [],
        contentText: null,
        linkStats: null,
        completed: true,
        errorMessage: resolveRegisterLinkErrorMessage(error),
      });
      setStep("analysisResult");
    }
  }, [linkSource, originalUrl, requestLinkAnalysisMutation, room]);

  useEffect(() => {
    if (!shouldAutoSubmitInitialUrlRef.current || !room || originalUrl.trim().length === 0) {
      return;
    }

    shouldAutoSubmitInitialUrlRef.current = false;
    queueMicrotask(() => {
      void submitLink();
    });
  }, [originalUrl, room, submitLink]);

  const retryLinkAnalysis = useCallback(async () => {
    if (!room || analysisRequestId == null || retryLinkAnalysisMutation.isPending) {
      return;
    }

    const submitSequence = submitSequenceRef.current + 1;
    submitSequenceRef.current = submitSequence;
    const trimmedOriginalUrl = originalUrl.trim();

    setOriginalUrlState(trimmedOriginalUrl);
    setOriginalUrlError(null);
    setRequestErrorResult(null);
    setRequestStatus(null);
    setSelectedKakaoPlaceIds([]);
    setSaveError(null);
    setStep("processing");

    try {
      const requested = await retryLinkAnalysisMutation.mutateAsync(analysisRequestId);

      if (submitSequenceRef.current !== submitSequence) {
        return;
      }

      setAnalysisRequestId(requested.analysisRequestId);
      setLinkId(requested.linkId);
      setRequestJobId(requested.jobId ?? null);
      setRequestStatus(requested.status);

      if (shouldRenderRequestResultImmediately(requested.status)) {
        setRequestErrorResult(
          mapLinkAnalysisRequestToResult({
            requested,
            originalUrl: trimmedOriginalUrl,
          }),
        );
        setStep("analysisResult");
      }
    } catch (error) {
      if (submitSequenceRef.current !== submitSequence) {
        return;
      }

      const inputFieldError = resolveLinkInputFieldError(error);
      if (inputFieldError) {
        setOriginalUrlError(inputFieldError);
        setStep("input");
        return;
      }

      setRequestErrorResult({
        analysisRequestId,
        linkId,
        jobId: requestJobId,
        originalUrl: trimmedOriginalUrl,
        status: "FAILED",
        candidatePlaces: [],
        contentText: null,
        linkStats: null,
        completed: true,
        errorMessage: resolveRegisterLinkErrorMessage(error),
      });
      setStep("analysisResult");
    }
  }, [analysisRequestId, linkId, originalUrl, requestJobId, retryLinkAnalysisMutation, room]);

  const toggleCandidatePlace = useCallback((place: CandidatePlace) => {
    if (!canSelectCandidatePlace(place)) {
      return;
    }

    const kakaoPlaceId = place.kakaoPlaceId;

    setSaveError(null);
    setSelectedKakaoPlaceIds((previous) =>
      previous.includes(kakaoPlaceId)
        ? previous.filter((id) => id !== kakaoPlaceId)
        : [...previous, kakaoPlaceId],
    );
  }, []);

  const saveSelectedCandidatePlaces = useCallback(async () => {
    if (
      !room ||
      analysisRequestId == null ||
      !renderAnalysisResult ||
      saveCandidatePlacesMutation.isPending
    ) {
      return;
    }

    if (renderAnalysisResult.status !== "SUCCEEDED") {
      setSaveError("분석이 완료된 뒤 장소를 저장할 수 있어요");
      return;
    }

    const kakaoPlaceIds = Array.from(new Set(selectedSelectableKakaoPlaceIds));

    if (kakaoPlaceIds.length === 0) {
      setSaveError("저장할 장소 후보를 선택해 주세요");
      return;
    }

    setSaveError(null);

    try {
      const saved = await saveCandidatePlacesMutation.mutateAsync({ kakaoPlaceIds });
      const createdCount = saved.places.filter((place) => place.created).length;

      if (createdCount > 0) {
        incrementRoomPlaceCountInCache(queryClient, room.id, createdCount);
      }

      useLinkAddDraftStore.getState().clearForRoom(room.id);
      setSelectedKakaoPlaceIds([]);
      await linkAnalysisStatusQuery.refetch();
      onSaveSuccess?.();
    } catch (error) {
      setSaveError(resolveSaveCandidatePlacesErrorMessage(error));
    }
  }, [
    linkAnalysisStatusQuery,
    analysisRequestId,
    queryClient,
    renderAnalysisResult,
    room,
    saveCandidatePlacesMutation,
    selectedSelectableKakaoPlaceIds,
    onSaveSuccess,
  ]);

  const persistDraftForEdit = useCallback((): string => {
    const sessionId = crypto.randomUUID();
    const roomId = room?.id;
    if (!roomId) {
      return sessionId;
    }

    const payload: LinkAddDraft = {
      roomId,
      sessionId,
      originalUrl: originalUrl.trim(),
      analysisRequestId,
      linkId,
      requestJobId,
      selectedKakaoPlaceIds,
    };
    useLinkAddDraftStore.getState().setDraft(payload);
    return sessionId;
  }, [analysisRequestId, linkId, originalUrl, requestJobId, room?.id, selectedKakaoPlaceIds]);

  return {
    step,
    renderStep,
    originalUrl,
    setOriginalUrl: handleChangeOriginalUrl,
    originalUrlError,
    renderAnalysisResult,
    selectedKakaoPlaceIds: selectedSelectableKakaoPlaceIds,
    currentStatus,
    saveError,
    isSubmitting: requestLinkAnalysisMutation.isPending || retryLinkAnalysisMutation.isPending,
    isSubmitEnabled:
      validateOriginalUrl(originalUrl) == null &&
      !requestLinkAnalysisMutation.isPending &&
      !retryLinkAnalysisMutation.isPending,
    isSavePending: saveCandidatePlacesMutation.isPending,
    canSaveSelectedCandidates,
    cancelOngoingSubmission,
    resetFlow,
    submitLink,
    retryLinkAnalysis,
    toggleCandidatePlace,
    saveSelectedCandidatePlaces,
    persistDraftForEdit,
  };
}

function validateOriginalUrl(value: string): string | null {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return "링크를 입력해 주세요";
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return "올바른 링크 형식이 아니에요";
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return "http/https 링크만 등록할 수 있어요";
  }

  return null;
}

function shouldRenderRequestResultImmediately(status: LinkAnalysisStatus): boolean {
  return isLinkAnalysisTerminal(status) && status !== "SUCCEEDED";
}

function resolveLinkInputFieldError(error: unknown): string | null {
  const formError = resolveFormApiError(error, { knownFields: ["originalUrl"] });
  if (!formError.hasFieldErrors) {
    return null;
  }

  return formError.fieldErrors.originalUrl ?? formError.formError;
}

function resolveRegisterLinkErrorMessage(error: unknown): string {
  return resolveGeneralApiErrorMessage(error, {
    fallback: "링크 분석 요청에 실패했어요 다시 시도해 주세요",
  });
}

function resolveLinkStatusErrorMessage(error: unknown): string {
  return resolveGeneralApiErrorMessage(error, {
    fallback: "링크 분석 상태를 확인하지 못했어요 다시 시도해 주세요",
  });
}

function resolveSaveCandidatePlacesErrorMessage(error: unknown): string {
  return resolveGeneralApiErrorMessage(error, {
    fallback: "장소 저장에 실패했어요 다시 시도해 주세요",
  });
}

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

import type { CandidatePlace, LinkAnalysisStatus } from "@/features/link-analysis";
import {
  canSelectCandidatePlace,
  isLinkAnalysisTerminal,
  useLinkAnalysisStatusQuery,
  useRequestLinkAnalysisMutation,
  useSaveCandidatePlacesMutation,
} from "@/features/link-analysis";
import { isApiError } from "@/shared/api/axios";
import type { FriendRoomRow } from "@/shared/types/room";
import type { LinkAddDraft } from "@/store/link-add-draft-store";
import { useLinkAddDraftStore } from "@/store/link-add-draft-store";

import { type LinkAnalysisResult, mapLinkAnalysisToResult, type Step } from "../link-add";
import { incrementRoomPlaceCountInCache } from "../utils/room-query-cache";

const DEFAULT_STEP: Step = "input";
const LINK_ANALYSIS_POLLING_INTERVAL_MS = 2_000;
const EMPTY_CANDIDATE_PLACES: CandidatePlace[] = [];

export type LinkAddCandidatesBootstrap = {
  analysisRequestId: number;
  url: string;
  selectedKakaoPlaceIds?: string[];
};

type UseLinkAddFlowOptions = {
  room: FriendRoomRow | null;
  activeRoomId?: string | null;
  /** Set when reopening the modal after 장소 수정 (room location state). */
  draftSessionId?: string | null;
  /** 후보 전용 라우트 진입 시 링크 ID·원본 URL·선택 상태를 메모리에서 복구 */
  candidatesBootstrap?: LinkAddCandidatesBootstrap | null;
  /** Called after 장소 후보 저장 API가 성공한 뒤 (모달 닫기 등). */
  onSaveSuccess?: () => void;
};

type UseLinkAddFlowResult = {
  step: Step;
  renderStep: Step;
  url: string;
  setUrl: (value: string) => void;
  urlError: string | null;
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
  onSaveSuccess,
}: UseLinkAddFlowOptions): UseLinkAddFlowResult {
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>(DEFAULT_STEP);
  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [analysisRequestId, setAnalysisRequestId] = useState<number | null>(null);
  const [linkId, setLinkId] = useState<number | null>(null);
  const [requestJobId, setRequestJobId] = useState<string | null>(null);
  const [requestStatus, setRequestStatus] = useState<LinkAnalysisStatus | null>(null);
  const [requestErrorResult, setRequestErrorResult] = useState<LinkAnalysisResult | null>(null);
  const [selectedKakaoPlaceIds, setSelectedKakaoPlaceIds] = useState<string[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);

  const submitSequenceRef = useRef(0);

  const requestLinkAnalysisMutation = useRequestLinkAnalysisMutation(room?.id ?? null);
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

  const handleChangeUrl = useCallback((value: string) => {
    setUrl(value);
    setUrlError(null);
  }, []);

  const resetFlow = useCallback(() => {
    setStep(DEFAULT_STEP);
    setUrl("");
    setUrlError(null);
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
        setUrl(draft.url);
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
        setUrl(candidatesBootstrap.url);
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

    submitSequenceRef.current += 1;
    queueMicrotask(resetFlow);
  }, [activeRoomId, candidatesBootstrap, draftSessionId, resetKey, resetFlow, room?.id]);

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
      originalUrl: url.trim(),
      jobId: requestJobId,
    });
  }, [linkAnalysisStatusQuery.data, requestJobId, url]);

  const queryErrorResult = useMemo<LinkAnalysisResult | null>(() => {
    if (!linkAnalysisStatusQuery.error) {
      return null;
    }

    return {
      linkId,
      analysisRequestId,
      jobId: requestJobId,
      originalUrl: url.trim(),
      status: "FAILED",
      candidatePlaces: [],
      completed: true,
      errorMessage: resolveLinkStatusErrorMessage(linkAnalysisStatusQuery.error),
    };
  }, [analysisRequestId, linkAnalysisStatusQuery.error, linkId, requestJobId, url]);

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
        url: trimmedUrl,
        source: "WEB",
      });

      if (submitSequenceRef.current !== submitSequence) {
        return;
      }

      setAnalysisRequestId(requested.analysisRequestId);
      setLinkId(requested.linkId);
      setRequestJobId(requested.jobId ?? null);
      setRequestStatus(requested.status);
    } catch (error) {
      if (submitSequenceRef.current !== submitSequence) {
        return;
      }

      setRequestErrorResult({
        analysisRequestId: null,
        linkId: null,
        jobId: null,
        originalUrl: trimmedUrl,
        status: "FAILED",
        candidatePlaces: [],
        completed: true,
        errorMessage: resolveRegisterLinkErrorMessage(error),
      });
      setStep("analysisResult");
    }
  }, [requestLinkAnalysisMutation, room, url]);

  const retryLinkAnalysis = useCallback(async () => {
    setRequestErrorResult(null);
    setSaveError(null);
    await submitLink();
  }, [submitLink]);

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
      setSaveError("분석이 완료된 뒤 장소를 저장할 수 있어요.");
      return;
    }

    const kakaoPlaceIds = Array.from(new Set(selectedSelectableKakaoPlaceIds));

    if (kakaoPlaceIds.length === 0) {
      setSaveError("저장할 장소 후보를 선택해 주세요.");
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
      url: url.trim(),
      analysisRequestId,
      linkId,
      requestJobId,
      selectedKakaoPlaceIds,
    };
    useLinkAddDraftStore.getState().setDraft(payload);
    return sessionId;
  }, [analysisRequestId, linkId, requestJobId, room?.id, selectedKakaoPlaceIds, url]);

  return {
    step,
    renderStep,
    url,
    setUrl: handleChangeUrl,
    urlError,
    renderAnalysisResult,
    selectedKakaoPlaceIds: selectedSelectableKakaoPlaceIds,
    currentStatus,
    saveError,
    isSubmitting: requestLinkAnalysisMutation.isPending,
    isSubmitEnabled: validateLinkUrl(url) == null && !requestLinkAnalysisMutation.isPending,
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

function validateLinkUrl(value: string): string | null {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return "링크를 입력해 주세요";
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
    if (error.status === 400) {
      return "분석 결과 요청 정보를 확인해 주세요.";
    }

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

function resolveSaveCandidatePlacesErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    if (error.status === 400) {
      return error.message || "선택한 장소 후보를 확인해 주세요.";
    }

    if (error.status === 403 || error.code === "E403_FORBIDDEN") {
      return "장소를 저장할 권한이 없습니다. 방 참여 상태를 확인해 주세요.";
    }

    if (error.status === 409) {
      return "분석이 완료된 링크만 장소를 저장할 수 있어요.";
    }

    if (error.status === 500 || error.status === 502) {
      return "서버에서 장소 저장 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    }

    return error.message;
  }

  return "장소 저장에 실패했습니다. 다시 시도해 주세요.";
}

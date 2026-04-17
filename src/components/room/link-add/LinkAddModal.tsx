import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  isLinkStatusCompleted,
  roomQueryKeys,
  useEscapeKey,
  useLinkStatusPollingQuery,
  useRegisterLinkMutation,
  useRoomActionModalPresence,
} from "@/features/room";
import {
  buildMockPlacesFromCaption,
  type CaptionResult,
  confirmMockPlaceSelection,
  mapLinkStatusToCaptionResult,
  type Step,
} from "@/features/room/link-add";
import { cn } from "@/lib/utils";
import { isApiError } from "@/shared/api/axios";
import type { FriendRoomRow } from "@/shared/types/room";

import { CaptionResultScreen } from "./CaptionResultScreen";
import { LinkInputScreen } from "./LinkInputScreen";
import { LinkProcessingScreen } from "./LinkProcessingScreen";
import { PlaceSelectionScreen } from "./PlaceSelectionScreen";
import { PlaceSuccessModal } from "./PlaceSuccessModal";

const DEFAULT_STEP: Step = "input";
const ENABLE_MOCK_PLACE_NAVIGATION = false;
const LINK_STATUS_POLLING_INTERVAL_MS = 2_500;

type LinkAddModalProps = {
  room: FriendRoomRow | null;
  onClose: () => void;
};

export function LinkAddModal({ room, onClose }: LinkAddModalProps) {
  const { displayRoom, visible } = useRoomActionModalPresence(room);
  const queryClient = useQueryClient();

  const [step, setStep] = useState<Step>(DEFAULT_STEP);
  const [url, setUrl] = useState("");
  const [linkId, setLinkId] = useState<number | null>(null);
  const [captionResult, setCaptionResult] = useState<CaptionResult | null>(null);
  const [selectedMockPlaceId, setSelectedMockPlaceId] = useState<string | null>(null);

  const historyPushedRef = useRef(false);
  const submitSequenceRef = useRef(0);

  const roomId = room?.id ?? null;

  const registerLinkMutation = useRegisterLinkMutation();
  const linkStatusQuery = useLinkStatusPollingQuery(linkId, {
    enabled: step === "processing" && linkId != null,
    pollingIntervalMs: LINK_STATUS_POLLING_INTERVAL_MS,
  });

  const polledCaptionResult = useMemo<CaptionResult | null>(() => {
    if (step !== "processing") {
      return null;
    }

    const latest = linkStatusQuery.data;
    if (latest && isLinkStatusCompleted(latest)) {
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

  const resetFlow = useCallback(() => {
    setStep(DEFAULT_STEP);
    setUrl("");
    setLinkId(null);
    setCaptionResult(null);
    setSelectedMockPlaceId(null);
  }, []);

  const requestClose = useCallback(() => {
    submitSequenceRef.current += 1;

    if (historyPushedRef.current) {
      historyPushedRef.current = false;
      onClose();
      window.history.back();
      return;
    }

    onClose();
  }, [onClose]);

  useEscapeKey(requestClose, displayRoom != null);

  useEffect(() => {
    submitSequenceRef.current += 1;
    queueMicrotask(resetFlow);

    if (roomId == null) {
      historyPushedRef.current = false;
    }
  }, [resetFlow, roomId]);

  useEffect(() => {
    if (roomId == null) {
      return;
    }

    if (!historyPushedRef.current) {
      window.history.pushState({ linkAddModal: true }, "");
      historyPushedRef.current = true;
    }

    const handlePopState = () => {
      if (!historyPushedRef.current) {
        return;
      }

      historyPushedRef.current = false;
      submitSequenceRef.current += 1;
      onClose();
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [onClose, roomId]);

  const handleSubmitLink = useCallback(async () => {
    if (!displayRoom) {
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
        roomId: displayRoom.id,
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
  }, [displayRoom, registerLinkMutation, url]);

  const handleRetryPolling = useCallback(async () => {
    if (linkId == null) {
      await handleSubmitLink();
      return;
    }

    setCaptionResult(null);
    setStep("processing");

    queryClient.removeQueries({ queryKey: roomQueryKeys.linkStatus(linkId) });
    await linkStatusQuery.refetch();
  }, [handleSubmitLink, linkId, linkStatusQuery, queryClient]);

  const mockPlaces = useMemo(
    () => buildMockPlacesFromCaption(renderCaptionResult?.caption ?? null),
    [renderCaptionResult?.caption],
  );

  const openMockPlaceScreen = useCallback(() => {
    setSelectedMockPlaceId(null);
    setStep("selectPlaceMock");
  }, []);

  const handleConfirmMockSelection = useCallback(async () => {
    if (!selectedMockPlaceId) {
      return;
    }

    await confirmMockPlaceSelection({ placeId: selectedMockPlaceId });
    setStep("mockSuccess");
  }, [selectedMockPlaceId]);

  const closeMockSuccessModal = useCallback(() => {
    requestClose();
  }, [requestClose]);

  if (!displayRoom) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-80 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="닫기"
        className={cn(
          "absolute inset-0 bg-black/20 transition-opacity duration-180 ease-out md:bg-transparent",
          visible ? "opacity-100" : "opacity-0",
        )}
        onClick={requestClose}
      />

      <section
        className={cn(
          "relative z-10 flex h-dvh w-full max-w-lg flex-col overflow-hidden bg-white transition-[opacity,transform] duration-180 ease-out md:max-w-3xl xl:max-w-lg",
          visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        {renderStep === "input" ? (
          <LinkInputScreen
            roomName={displayRoom.displayName}
            url={url}
            onChangeUrl={setUrl}
            onCancel={requestClose}
            onSubmit={() => {
              void handleSubmitLink();
            }}
            isSubmitEnabled={url.trim().length > 0 && !registerLinkMutation.isPending}
          />
        ) : null}

        {renderStep === "processing" ? (
          <LinkProcessingScreen
            roomName={displayRoom.displayName}
            url={url}
            onCancel={requestClose}
          />
        ) : null}

        {renderStep === "captionResult" && renderCaptionResult ? (
          <CaptionResultScreen
            roomName={displayRoom.displayName}
            result={renderCaptionResult}
            onClose={requestClose}
            onRetry={() => {
              void handleRetryPolling();
            }}
            onMoveToMockPlaces={ENABLE_MOCK_PLACE_NAVIGATION ? openMockPlaceScreen : undefined}
          />
        ) : null}

        {renderStep === "selectPlaceMock" ? (
          <PlaceSelectionScreen
            roomName={displayRoom.displayName}
            originalUrl={url}
            places={mockPlaces}
            selectedPlaceId={selectedMockPlaceId}
            onSelectPlace={setSelectedMockPlaceId}
            onCancel={requestClose}
            onConfirm={() => {
              void handleConfirmMockSelection();
            }}
          />
        ) : null}

        {renderStep === "mockSuccess" ? (
          <>
            <PlaceSelectionScreen
              roomName={displayRoom.displayName}
              originalUrl={url}
              places={mockPlaces}
              selectedPlaceId={selectedMockPlaceId}
              onSelectPlace={setSelectedMockPlaceId}
              onCancel={requestClose}
              onConfirm={() => {
                void handleConfirmMockSelection();
              }}
            />
            <PlaceSuccessModal visible onClose={closeMockSuccessModal} />
          </>
        ) : null}
      </section>
    </div>
  );
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

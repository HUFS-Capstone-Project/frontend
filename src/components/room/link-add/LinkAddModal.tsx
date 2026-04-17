import { useCallback } from "react";

import { FullScreenOverlayShell } from "@/components/ui/FullScreenOverlayShell";
import { useLinkAddFlow, useRoomActionModalPresence } from "@/features/room";
import type { FriendRoomRow } from "@/shared/types/room";

import { CaptionResultScreen } from "./CaptionResultScreen";
import { LinkInputScreen } from "./LinkInputScreen";
import { LinkProcessingScreen } from "./LinkProcessingScreen";
import { PlaceSelectionScreen } from "./PlaceSelectionScreen";
import { PlaceSuccessModal } from "./PlaceSuccessModal";

const ENABLE_MOCK_PLACE_NAVIGATION = false;

type LinkAddModalProps = {
  room: FriendRoomRow | null;
  onClose: () => void;
};

export function LinkAddModal({ room, onClose }: LinkAddModalProps) {
  const { displayRoom } = useRoomActionModalPresence(room);

  const {
    renderStep,
    url,
    setUrl,
    urlError,
    selectedMockPlaceId,
    setSelectedMockPlaceId,
    renderCaptionResult,
    mockPlaces,
    isSubmitEnabled,
    hasSaved,
    isSavePending,
    cancelOngoingSubmission,
    submitLink,
    retryPolling,
    saveSucceededResult,
    openMockPlaceScreen,
    confirmMockSelection,
  } = useLinkAddFlow({ room: displayRoom, activeRoomId: room?.id ?? null });

  const handleRequestClose = useCallback(() => {
    cancelOngoingSubmission();
    onClose();
  }, [cancelOngoingSubmission, onClose]);

  if (!displayRoom) {
    return null;
  }

  return (
    <FullScreenOverlayShell
      open={room != null}
      onClose={handleRequestClose}
      historyStateKey="linkAddModal"
      overlayClassName="md:bg-transparent"
    >
      {renderStep === "input" ? (
        <LinkInputScreen
          roomName={displayRoom.displayName}
          url={url}
          urlError={urlError}
          onChangeUrl={setUrl}
          onCancel={handleRequestClose}
          onSubmit={() => {
            void submitLink();
          }}
          isSubmitEnabled={isSubmitEnabled}
        />
      ) : null}

      {renderStep === "processing" ? (
        <LinkProcessingScreen
          roomName={displayRoom.displayName}
          url={url}
          onCancel={handleRequestClose}
        />
      ) : null}

      {renderStep === "captionResult" && renderCaptionResult ? (
        <CaptionResultScreen
          roomName={displayRoom.displayName}
          result={renderCaptionResult}
          onClose={handleRequestClose}
          onRetry={() => {
            void retryPolling();
          }}
          onSave={() => {
            void saveSucceededResult();
          }}
          hasSaved={hasSaved}
          isSavePending={isSavePending}
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
          onCancel={handleRequestClose}
          onConfirm={() => {
            void confirmMockSelection();
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
            onCancel={handleRequestClose}
            onConfirm={() => {
              void confirmMockSelection();
            }}
          />
          <PlaceSuccessModal visible onClose={handleRequestClose} />
        </>
      ) : null}
    </FullScreenOverlayShell>
  );
}

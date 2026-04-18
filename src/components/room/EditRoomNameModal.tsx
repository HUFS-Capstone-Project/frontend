import { memo, useCallback, useState } from "react";

import { useOverlayFlowController, useRoomActionModalPresence } from "@/features/room/hooks";
import { cn } from "@/lib/utils";
import type { FriendRoomRow } from "@/shared/types/room";

import { RoomModalShell } from "./RoomModalShell";

const ROOM_NAME_MAX_LENGTH = 20;
const ROOM_NAME_REQUIRED_MESSAGE = "방 이름을 입력해 주세요.";
const ROOM_NAME_MAX_LENGTH_MESSAGE = "방 이름은 최대 20자까지 입력할 수 있어요.";

export type EditRoomNameModalSubmitResult = {
  success: boolean;
  fieldError?: string;
};

export type EditRoomNameModalProps = {
  room: FriendRoomRow | null;
  onClose: () => void;
  onSubmitRoomName: (
    room: FriendRoomRow,
    nextRoomName: string,
  ) => Promise<EditRoomNameModalSubmitResult>;
  isSubmitting?: boolean;
};

const EditRoomNameModalInner = memo(function EditRoomNameModalInner({
  displayRoom,
  visible,
  onClose,
  onSubmitRoomName,
  isSubmitting = false,
}: {
  displayRoom: FriendRoomRow;
  visible: boolean;
  onClose: () => void;
  onSubmitRoomName: (
    room: FriendRoomRow,
    nextRoomName: string,
  ) => Promise<EditRoomNameModalSubmitResult>;
  isSubmitting?: boolean;
}) {
  const [roomNameInput, setRoomNameInput] = useState(displayRoom.displayName);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    const trimmedName = roomNameInput.trim();
    if (trimmedName.length === 0) {
      setErrorMessage(ROOM_NAME_REQUIRED_MESSAGE);
      return;
    }

    if (trimmedName.length > ROOM_NAME_MAX_LENGTH) {
      setErrorMessage(ROOM_NAME_MAX_LENGTH_MESSAGE);
      return;
    }

    const result = await onSubmitRoomName(displayRoom, roomNameInput);
    if (result.success) {
      return;
    }

    if (result.fieldError) {
      setErrorMessage(result.fieldError);
    }
  }, [displayRoom, isSubmitting, onSubmitRoomName, roomNameInput]);

  return (
    <RoomModalShell visible={visible} onOverlayClick={onClose} className="z-60">
      <div className="px-6 pt-8 pb-5">
        <h2 className="text-foreground text-center text-lg leading-snug font-bold">방 이름 변경</h2>
        <p className="text-foreground mt-3 text-center text-sm leading-relaxed">
          새로운 방 이름을 입력해 주세요.
        </p>

        <div className="mt-4">
          <label htmlFor="edit-room-name" className="sr-only">
            방 이름
          </label>
          <input
            id="edit-room-name"
            value={roomNameInput}
            maxLength={ROOM_NAME_MAX_LENGTH}
            autoComplete="off"
            className={cn(
              "border-input placeholder:text-muted-foreground bg-background h-11 w-full rounded-xl border px-4 text-sm outline-none",
              "focus-visible:ring-ring focus-visible:ring-2",
              errorMessage ? "border-destructive" : undefined,
            )}
            placeholder="방 이름을 입력해 주세요"
            onChange={(event) => {
              setRoomNameInput(event.target.value);
              setErrorMessage(null);
            }}
            onKeyDown={(event) => {
              if (event.key !== "Enter") {
                return;
              }

              event.preventDefault();
              void handleSubmit();
            }}
          />
          {errorMessage ? (
            <p className="text-destructive mt-2 px-1 text-left text-sm" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </div>
      <div className="border-border/50 flex border-t">
        <button
          type="button"
          className={cn(
            "flex-1 py-4 text-sm font-medium transition-colors",
            "border-border/50 text-muted-foreground hover:bg-muted/25 active:bg-muted/35 border-r",
            isSubmitting ? "cursor-not-allowed opacity-60" : undefined,
          )}
          onClick={onClose}
          disabled={isSubmitting}
        >
          취소
        </button>
        <button
          type="button"
          className={cn(
            "text-foreground hover:bg-muted/25 active:bg-muted/35 flex-1 py-4 text-sm font-medium transition-colors",
            isSubmitting ? "cursor-not-allowed opacity-80" : undefined,
          )}
          onClick={() => {
            void handleSubmit();
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? "저장 중..." : "저장"}
        </button>
      </div>
    </RoomModalShell>
  );
});

/**
 * 방 이름 변경 모달. RoomActionModal과 동일한 presence/history 패턴으로 동작한다.
 */
export function EditRoomNameModal({
  room,
  onClose,
  onSubmitRoomName,
  isSubmitting,
}: EditRoomNameModalProps) {
  const { displayRoom, visible } = useRoomActionModalPresence(room);
  const { requestClose } = useOverlayFlowController({
    open: room != null,
    onClose,
    historyStateKey: "editRoomNameModal",
  });

  if (!displayRoom) {
    return null;
  }

  return (
    <EditRoomNameModalInner
      key={displayRoom.id}
      displayRoom={displayRoom}
      visible={visible}
      onClose={requestClose}
      onSubmitRoomName={onSubmitRoomName}
      isSubmitting={isSubmitting}
    />
  );
}

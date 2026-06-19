import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import {
  isApiError,
  isApiErrorCode,
  resolveFormApiError,
  resolveGeneralApiErrorMessage,
} from "@/shared/api/error";
import { ROOM_TEXT } from "@/shared/config/text";
import type { RoomListRow } from "@/shared/types/room";

import { roomQueryKeys } from "../query-keys";
import type { RoomActionType } from "../roomActionTypes";
import { removeRoomFromCache } from "../utils/room-query-cache";
import {
  mapRoomSummaryToRoomListRow,
  sortRoomListRows,
  toNonNegativeRoomCount,
} from "../utils/roomListRows";
import { useLeaveRoomMutation } from "./use-leave-room-mutation";
import { useRoomDetailQuery } from "./use-room-detail-query";
import { useRoomsQuery } from "./use-rooms-query";
import { useUpdateRoomNameMutation } from "./use-update-room-name-mutation";
import { useUpdateRoomPinMutation } from "./use-update-room-pin-mutation";

const ROOM_NAME_MAX_LENGTH = 20;

export type RenameRoomSubmitResult = {
  success: boolean;
  fieldError?: string;
};

type UseRoomMainModalsOptions = {
  showToast?: (message: string) => void;
  roomKeyword?: string;
};

/**
 * 방 메인 화면의 모달 상태와 액션 핸들러 훅
 */
export function useRoomMainModals(options?: UseRoomMainModalsOptions) {
  const queryClient = useQueryClient();
  const showToast = options?.showToast;

  const [editRoom, setEditRoom] = useState<RoomListRow | null>(null);
  const [inviteCodeRoom, setInviteCodeRoom] = useState<RoomListRow | null>(null);
  const [leaveRoom, setLeaveRoom] = useState<RoomListRow | null>(null);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);

  const roomsQuery = useRoomsQuery({ keyword: options?.roomKeyword });
  const updateRoomNameMutation = useUpdateRoomNameMutation();
  const updateRoomPinMutation = useUpdateRoomPinMutation();
  const leaveRoomMutation = useLeaveRoomMutation();

  const roomRows = useMemo(() => {
    const rooms = roomsQuery.data ?? [];

    return rooms.map(mapRoomSummaryToRoomListRow);
  }, [roomsQuery.data]);

  const sortedRows = useMemo(() => sortRoomListRows(roomRows), [roomRows]);

  const inviteCodeRoomId = inviteCodeRoom?.id ?? null;
  const inviteCodeRoomDetailQuery = useRoomDetailQuery(inviteCodeRoomId, {
    enabled: inviteCodeRoomId != null,
  });

  const inviteCodeDisplayRoom = useMemo(() => {
    if (!inviteCodeRoom) {
      return null;
    }

    const detail = inviteCodeRoomDetailQuery.data;
    if (!detail) {
      return inviteCodeRoom;
    }

    return {
      ...inviteCodeRoom,
      displayName: detail.roomName,
      avatarSeed: detail.avatarSeed,
      inviteCode: detail.inviteCode,
      memberCount: toNonNegativeRoomCount(detail.memberCount, inviteCodeRoom.memberCount),
      placeCount: toNonNegativeRoomCount(detail.placeCount, inviteCodeRoom.placeCount),
      isPinned: detail.pinned,
    };
  }, [inviteCodeRoom, inviteCodeRoomDetailQuery.data]);

  const closeRoomRelatedModals = useCallback((roomId: string) => {
    setEditRoom((previous) => (previous?.id === roomId ? null : previous));
    setInviteCodeRoom((previous) => (previous?.id === roomId ? null : previous));
    setLeaveRoom((previous) => (previous?.id === roomId ? null : previous));
  }, []);

  const handleTogglePin = useCallback(
    async (room: RoomListRow) => {
      const nextPinned = !room.isPinned;

      try {
        await updateRoomPinMutation.mutateAsync({
          roomId: room.id,
          payload: { pinned: nextPinned },
        });
        showToast?.(nextPinned ? ROOM_TEXT.toast.pinned : ROOM_TEXT.toast.unpinned);
      } catch (error) {
        if (isNotFoundRoomError(error)) {
          removeRoomFromCache(queryClient, room.id);
          closeRoomRelatedModals(room.id);
          showToast?.(resolveNotFoundMessage(error));
          return;
        }

        if (isForbiddenRoomError(error)) {
          showToast?.(resolveForbiddenMessage(error));
          void invalidateRoomQueries(queryClient, room.id);
          return;
        }

        showToast?.(resolveFallbackMessage(error, ROOM_TEXT.toast.pinUpdateFailed));
      }
    },
    [closeRoomRelatedModals, queryClient, showToast, updateRoomPinMutation],
  );

  const handleRoomAction = useCallback(
    (action: RoomActionType, room: RoomListRow) => {
      if (action === "toggle-pin") {
        void handleTogglePin(room);
        return;
      }

      if (action === "add-direct-link") {
        return;
      }

      if (action === "edit-info") {
        setEditRoom(room);
        return;
      }

      if (action === "invite-code") {
        setInviteCodeRoom(room);
        return;
      }

      if (action === "leave") {
        setLeaveRoom(room);
      }
    },
    [handleTogglePin],
  );

  const handleSubmitEditRoomName = useCallback(
    async (room: RoomListRow, nextRoomName: string): Promise<RenameRoomSubmitResult> => {
      const trimmedName = nextRoomName.trim();
      const validationMessage = validateRoomName(trimmedName);
      if (validationMessage) {
        return { success: false, fieldError: validationMessage };
      }

      try {
        await updateRoomNameMutation.mutateAsync({
          roomId: room.id,
          payload: { name: trimmedName },
        });
        setEditRoom(null);
        showToast?.(ROOM_TEXT.toast.renamed);
        return { success: true };
      } catch (error) {
        const formError = resolveFormApiError(error, { knownFields: ["name"] });

        if (formError.hasFieldErrors) {
          const fieldMessage = formError.fieldErrors.name ?? formError.formError;
          if (fieldMessage) {
            return { success: false, fieldError: fieldMessage };
          }
        }

        if (isNotFoundRoomError(error)) {
          removeRoomFromCache(queryClient, room.id);
          closeRoomRelatedModals(room.id);
          showToast?.(resolveNotFoundMessage(error));
          return { success: false };
        }

        if (isForbiddenRoomError(error)) {
          setEditRoom(null);
          showToast?.(resolveForbiddenMessage(error));
          void invalidateRoomQueries(queryClient, room.id);
          return { success: false };
        }

        showToast?.(resolveFallbackMessage(error, ROOM_TEXT.toast.renameFailed));
        return { success: false };
      }
    },
    [closeRoomRelatedModals, queryClient, showToast, updateRoomNameMutation],
  );

  const handleConfirmLeaveRoom = useCallback(
    async (room: RoomListRow) => {
      try {
        await leaveRoomMutation.mutateAsync({ roomId: room.id });
        closeRoomRelatedModals(room.id);
        showToast?.(ROOM_TEXT.toast.left);
      } catch (error) {
        if (isNotFoundRoomError(error)) {
          removeRoomFromCache(queryClient, room.id);
          closeRoomRelatedModals(room.id);
          showToast?.(resolveNotFoundMessage(error));
          return;
        }

        if (isForbiddenRoomError(error)) {
          setLeaveRoom(null);
          showToast?.(resolveForbiddenMessage(error));
          void invalidateRoomQueries(queryClient, room.id);
          return;
        }

        showToast?.(resolveFallbackMessage(error, ROOM_TEXT.toast.leaveFailed));
      }
    },
    [closeRoomRelatedModals, leaveRoomMutation, queryClient, showToast],
  );

  const closeEditRoomModal = useCallback(() => {
    setEditRoom(null);
  }, []);

  const closeInviteCodeModal = useCallback(() => {
    setInviteCodeRoom(null);
  }, []);

  const openInviteCodeModal = useCallback((room: RoomListRow) => {
    setInviteCodeRoom(room);
  }, []);

  const closeLeaveRoomModal = useCallback(() => {
    setLeaveRoom(null);
  }, []);

  const openAddRoom = useCallback(() => {
    setIsAddRoomOpen(true);
  }, []);

  const closeAddRoom = useCallback(() => {
    setIsAddRoomOpen(false);
  }, []);

  return {
    sortedRows,
    editRoom,
    inviteCodeRoom: inviteCodeDisplayRoom,
    leaveRoom,
    isAddRoomOpen,
    isRenamePending: updateRoomNameMutation.isPending,
    isLeavePending: leaveRoomMutation.isPending,
    isRoomsLoading: roomsQuery.isLoading,
    roomsError: roomsQuery.error,
    handleRoomAction,
    handleSubmitEditRoomName,
    handleConfirmLeaveRoom,
    closeEditRoomModal,
    closeInviteCodeModal,
    openInviteCodeModal,
    closeLeaveRoomModal,
    openAddRoom,
    closeAddRoom,
  };
}

function validateRoomName(value: string): string | null {
  if (value.length === 0) {
    return ROOM_TEXT.validation.nameRequired;
  }

  if (value.length > ROOM_NAME_MAX_LENGTH) {
    return ROOM_TEXT.validation.nameMaxLength;
  }

  return null;
}

function isForbiddenRoomError(error: unknown): boolean {
  if (!isApiError(error)) {
    return false;
  }

  return error.status === 403 || error.code === "E403_FORBIDDEN";
}

function isNotFoundRoomError(error: unknown): boolean {
  if (!isApiError(error)) {
    return false;
  }

  return error.status === 404 || isApiErrorCode(error, "ROOM_NOT_FOUND");
}

function resolveNotFoundMessage(error: unknown): string {
  return resolveGeneralApiErrorMessage(error, {
    fallback: ROOM_TEXT.toast.notFound,
  });
}

function resolveForbiddenMessage(error: unknown): string {
  return resolveGeneralApiErrorMessage(error, {
    fallback: ROOM_TEXT.toast.forbidden,
  });
}

function resolveFallbackMessage(error: unknown, fallback: string): string {
  return resolveGeneralApiErrorMessage(error, { fallback });
}

async function invalidateRoomQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  roomId: string,
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: roomQueryKeys.rooms() }),
    queryClient.invalidateQueries({ queryKey: roomQueryKeys.roomDetail(roomId) }),
  ]);
}

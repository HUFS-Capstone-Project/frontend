import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import type { ApiError } from "@/shared/api/axios";
import { isApiError } from "@/shared/api/axios";
import type { FriendRoomRow } from "@/shared/types/room";

import type { RoomSummaryResponse } from "../api";
import { roomQueryKeys } from "../query-keys";
import type { RoomActionType } from "../roomActionTypes";
import { sortFriendRoomRows } from "../utils/friendRoomRows";
import { removeRoomFromCache } from "../utils/room-query-cache";
import { useLeaveRoomMutation } from "./use-leave-room-mutation";
import { useRoomDetailQuery } from "./use-room-detail-query";
import { useRoomsQuery } from "./use-rooms-query";
import { useUpdateRoomNameMutation } from "./use-update-room-name-mutation";
import { useUpdateRoomPinMutation } from "./use-update-room-pin-mutation";

const ROOM_NAME_MAX_LENGTH = 20;

const RENAME_SUCCESS_TOAST = "방 이름이 변경되었습니다.";
const LEAVE_SUCCESS_TOAST = "방에서 나갔습니다.";
const PINNED_SUCCESS_TOAST = "방을 상단 고정했습니다.";
const UNPINNED_SUCCESS_TOAST = "방 상단 고정을 해제했습니다.";

const ROOM_NOT_FOUND_TOAST = "이미 삭제되었거나 존재하지 않는 방입니다.";
const ROOM_FORBIDDEN_TOAST = "방 접근 권한이 없습니다.";
const ROOM_NAME_INVALID_TOAST = "방 이름을 다시 확인해 주세요.";
const ROOM_NAME_REQUIRED_TOAST = "방 이름을 입력해 주세요.";
const ROOM_NAME_MAX_LENGTH_TOAST = "방 이름은 최대 20자까지 입력할 수 있어요.";

export type RenameRoomSubmitResult = {
  success: boolean;
  fieldError?: string;
};

type UseRoomMainModalsOptions = {
  showToast?: (message: string) => void;
};

/**
 * 방 메인 화면의 모달 상태와 액션 핸들러 훅
 */
export function useRoomMainModals(options?: UseRoomMainModalsOptions) {
  const queryClient = useQueryClient();
  const showToast = options?.showToast;

  const [editRoom, setEditRoom] = useState<FriendRoomRow | null>(null);
  const [inviteCodeRoom, setInviteCodeRoom] = useState<FriendRoomRow | null>(null);
  const [leaveRoom, setLeaveRoom] = useState<FriendRoomRow | null>(null);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);

  const roomsQuery = useRoomsQuery();
  const updateRoomNameMutation = useUpdateRoomNameMutation();
  const updateRoomPinMutation = useUpdateRoomPinMutation();
  const leaveRoomMutation = useLeaveRoomMutation();

  const roomRows = useMemo(() => {
    const rooms = roomsQuery.data ?? [];

    return rooms.map(mapRoomSummaryToRow);
  }, [roomsQuery.data]);

  const sortedRows = useMemo(() => sortFriendRoomRows(roomRows), [roomRows]);

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
      inviteCode: detail.inviteCode,
      memberCount: toNonNegativeNumber(detail.memberCount, inviteCodeRoom.memberCount),
      placeCount: toNonNegativeNumber(
        detail.placeCount ?? detail.linkCount,
        inviteCodeRoom.placeCount,
      ),
      isPinned: detail.pinned,
    };
  }, [inviteCodeRoom, inviteCodeRoomDetailQuery.data]);

  const closeRoomRelatedModals = useCallback((roomId: string) => {
    setEditRoom((previous) => (previous?.id === roomId ? null : previous));
    setInviteCodeRoom((previous) => (previous?.id === roomId ? null : previous));
    setLeaveRoom((previous) => (previous?.id === roomId ? null : previous));
  }, []);

  const handleTogglePin = useCallback(
    async (room: FriendRoomRow) => {
      const nextPinned = !room.isPinned;

      try {
        const result = await updateRoomPinMutation.mutateAsync({
          roomId: room.id,
          payload: { pinned: nextPinned },
        });
        showToast?.(result.message ?? (nextPinned ? PINNED_SUCCESS_TOAST : UNPINNED_SUCCESS_TOAST));
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

        showToast?.(
          resolveFallbackMessage(error, "상단 고정 변경에 실패했습니다. 다시 시도해 주세요."),
        );
      }
    },
    [closeRoomRelatedModals, queryClient, showToast, updateRoomPinMutation],
  );

  const handleRoomAction = useCallback(
    (action: RoomActionType, room: FriendRoomRow) => {
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
    async (room: FriendRoomRow, nextRoomName: string): Promise<RenameRoomSubmitResult> => {
      const trimmedName = nextRoomName.trim();
      const validationMessage = validateRoomName(trimmedName);
      if (validationMessage) {
        showToast?.(validationMessage);
        return { success: false, fieldError: validationMessage };
      }

      try {
        const result = await updateRoomNameMutation.mutateAsync({
          roomId: room.id,
          payload: { name: trimmedName },
        });
        setEditRoom(null);
        showToast?.(result.message ?? RENAME_SUCCESS_TOAST);
        return { success: true };
      } catch (error) {
        if (isRoomNameValidationError(error)) {
          const message = resolveRoomNameValidationMessage(error);
          showToast?.(message);
          return { success: false, fieldError: message };
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

        showToast?.(
          resolveFallbackMessage(error, "방 이름 변경에 실패했습니다. 다시 시도해 주세요."),
        );
        return { success: false };
      }
    },
    [closeRoomRelatedModals, queryClient, showToast, updateRoomNameMutation],
  );

  const handleConfirmLeaveRoom = useCallback(
    async (room: FriendRoomRow) => {
      try {
        const result = await leaveRoomMutation.mutateAsync({ roomId: room.id });
        closeRoomRelatedModals(room.id);
        showToast?.(result.message ?? LEAVE_SUCCESS_TOAST);
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

        showToast?.(resolveFallbackMessage(error, "방 나가기에 실패했습니다. 다시 시도해 주세요."));
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

  const openInviteCodeModal = useCallback((room: FriendRoomRow) => {
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

function mapRoomSummaryToRow(room: RoomSummaryResponse): FriendRoomRow {
  return {
    id: room.roomId,
    displayName: room.roomName,
    memberCount: toNonNegativeNumber(room.memberCount, 1),
    placeCount: toNonNegativeNumber(room.placeCount ?? room.linkCount, 0),
    isPinned: room.pinned,
  };
}

function toNonNegativeNumber(value: number | null | undefined, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    return fallback;
  }

  return value;
}

function validateRoomName(value: string): string | null {
  if (value.length === 0) {
    return ROOM_NAME_REQUIRED_TOAST;
  }

  if (value.length > ROOM_NAME_MAX_LENGTH) {
    return ROOM_NAME_MAX_LENGTH_TOAST;
  }

  return null;
}

function isForbiddenRoomError(error: unknown): error is ApiError {
  if (!isApiError(error)) {
    return false;
  }

  return error.status === 403 || error.code === "E403_FORBIDDEN";
}

function isNotFoundRoomError(error: unknown): error is ApiError {
  if (!isApiError(error)) {
    return false;
  }

  return error.status === 404 || error.code === "E404_NOT_FOUND";
}

function isRoomNameValidationError(error: unknown): error is ApiError {
  if (!isApiError(error)) {
    return false;
  }

  if (error.status !== 400) {
    return false;
  }

  return error.code === "E400_VALIDATION" || error.code === "E400_ILLEGAL_ARGUMENT";
}

function resolveRoomNameValidationMessage(error: ApiError): string {
  const fieldError = error.fieldErrors?.find((item) => item.field === "name")?.message;
  if (fieldError) {
    return fieldError;
  }

  return error.detail ?? ROOM_NAME_INVALID_TOAST;
}

function resolveNotFoundMessage(error: ApiError): string {
  return error.detail ?? ROOM_NOT_FOUND_TOAST;
}

function resolveForbiddenMessage(error: ApiError): string {
  return error.detail ?? ROOM_FORBIDDEN_TOAST;
}

function resolveFallbackMessage(error: unknown, fallback: string): string {
  if (!isApiError(error)) {
    return fallback;
  }

  return error.detail ?? error.message ?? fallback;
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

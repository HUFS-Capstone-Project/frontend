import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useRoomSelectionStore } from "@/store/room-selection-store";

import { roomService } from "../api/room-service";
import type { RoomDetailResponse, RoomSummaryResponse, UpdateRoomNameRequest } from "../api/types";
import { roomQueryKeys } from "../query-keys";
import { setRoomNameInCache } from "../utils/room-query-cache";

type UpdateRoomNameVariables = {
  roomId: string;
  payload: UpdateRoomNameRequest;
};

type UpdateRoomNameContext = {
  previousRooms?: RoomSummaryResponse[];
  previousDetail?: RoomDetailResponse;
  previousSelectedRoomName?: string;
};

export function useUpdateRoomNameMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...roomQueryKeys.all, "update-room-name"],
    mutationFn: ({ roomId, payload }: UpdateRoomNameVariables) =>
      roomService.updateRoomName(roomId, payload),
    onMutate: async ({ roomId, payload }) => {
      const nextName = payload.name.trim();

      await Promise.all([
        queryClient.cancelQueries({ queryKey: roomQueryKeys.rooms() }),
        queryClient.cancelQueries({ queryKey: roomQueryKeys.roomDetail(roomId) }),
      ]);

      const previousRooms = queryClient.getQueryData<RoomSummaryResponse[]>(roomQueryKeys.rooms());
      const previousDetail = queryClient.getQueryData<RoomDetailResponse>(
        roomQueryKeys.roomDetail(roomId),
      );
      const previousSelectedRoom = useRoomSelectionStore.getState().selectedRoom;
      const previousSelectedRoomName =
        previousSelectedRoom?.id === roomId ? previousSelectedRoom.name : undefined;

      setRoomNameInCache(queryClient, roomId, nextName);
      syncSelectedRoomName(roomId, nextName);

      return {
        previousRooms,
        previousDetail,
        previousSelectedRoomName,
      } satisfies UpdateRoomNameContext;
    },
    onError: (_error, variables, context) => {
      restoreRoomListSnapshot(queryClient, context?.previousRooms);
      restoreRoomDetailSnapshot(queryClient, variables.roomId, context?.previousDetail);
      restoreSelectedRoomName(variables.roomId, context?.previousSelectedRoomName);
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: roomQueryKeys.rooms() });
      void queryClient.invalidateQueries({ queryKey: roomQueryKeys.roomDetail(variables.roomId) });
    },
  });
}

function syncSelectedRoomName(roomId: string, roomName: string) {
  const roomSelectionStore = useRoomSelectionStore.getState();
  const selectedRoom = roomSelectionStore.selectedRoom;
  if (!selectedRoom || selectedRoom.id !== roomId) {
    return;
  }

  roomSelectionStore.selectRoom({ ...selectedRoom, name: roomName });
}

function restoreSelectedRoomName(roomId: string, previousRoomName: string | undefined) {
  if (!previousRoomName) {
    return;
  }

  const roomSelectionStore = useRoomSelectionStore.getState();
  const selectedRoom = roomSelectionStore.selectedRoom;
  if (!selectedRoom || selectedRoom.id !== roomId) {
    return;
  }

  roomSelectionStore.selectRoom({ ...selectedRoom, name: previousRoomName });
}

function restoreRoomListSnapshot(
  queryClient: ReturnType<typeof useQueryClient>,
  previousRooms: RoomSummaryResponse[] | undefined,
) {
  if (previousRooms) {
    queryClient.setQueryData(roomQueryKeys.rooms(), previousRooms);
    return;
  }

  queryClient.removeQueries({ queryKey: roomQueryKeys.rooms() });
}

function restoreRoomDetailSnapshot(
  queryClient: ReturnType<typeof useQueryClient>,
  roomId: string,
  previousDetail: RoomDetailResponse | undefined,
) {
  if (previousDetail) {
    queryClient.setQueryData(roomQueryKeys.roomDetail(roomId), previousDetail);
    return;
  }

  queryClient.removeQueries({ queryKey: roomQueryKeys.roomDetail(roomId) });
}

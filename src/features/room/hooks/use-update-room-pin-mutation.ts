import { useMutation, useQueryClient } from "@tanstack/react-query";

import { roomService } from "../api/room-service";
import type { RoomDetailResponse, RoomSummaryResponse, UpdateRoomPinRequest } from "../api/types";
import { roomQueryKeys } from "../query-keys";
import { setRoomPinInCache } from "../utils/room-query-cache";

type UpdateRoomPinVariables = {
  roomId: string;
  payload: UpdateRoomPinRequest;
};

type UpdateRoomPinContext = {
  previousRooms?: RoomSummaryResponse[];
  previousDetail?: RoomDetailResponse;
};

export function useUpdateRoomPinMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...roomQueryKeys.all, "update-room-pin"],
    mutationFn: ({ roomId, payload }: UpdateRoomPinVariables) =>
      roomService.updateRoomPin(roomId, payload),
    onMutate: async ({ roomId, payload }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: roomQueryKeys.rooms() }),
        queryClient.cancelQueries({ queryKey: roomQueryKeys.roomDetail(roomId) }),
      ]);

      const previousRooms = queryClient.getQueryData<RoomSummaryResponse[]>(roomQueryKeys.rooms());
      const previousDetail = queryClient.getQueryData<RoomDetailResponse>(
        roomQueryKeys.roomDetail(roomId),
      );

      setRoomPinInCache(queryClient, roomId, payload.pinned);

      return {
        previousRooms,
        previousDetail,
      } satisfies UpdateRoomPinContext;
    },
    onError: (_error, variables, context) => {
      restoreRoomListSnapshot(queryClient, context?.previousRooms);
      restoreRoomDetailSnapshot(queryClient, variables.roomId, context?.previousDetail);
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: roomQueryKeys.rooms() });
      void queryClient.invalidateQueries({ queryKey: roomQueryKeys.roomDetail(variables.roomId) });
    },
  });
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

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { roomPlaceApi } from "../api/room-place-api";
import { roomPlaceQueryKeys } from "../query-keys";
import type { UpdateRoomPlaceMemoRequest } from "../types/room-place.types";

type UseUpdateRoomPlaceMemoOptions = {
  roomId: string | null;
};

export function useUpdateRoomPlaceMemo({ roomId }: UseUpdateRoomPlaceMemoOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...roomPlaceQueryKeys.all, "update-memo", roomId],
    mutationFn: ({
      roomPlaceId,
      payload,
    }: {
      roomPlaceId: number;
      payload: UpdateRoomPlaceMemoRequest;
    }) => {
      if (!roomId) {
        throw new Error("roomId is required");
      }

      return roomPlaceApi.updateMemo(roomId, roomPlaceId, payload);
    },
    onSuccess: async () => {
      if (!roomId) {
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: roomPlaceQueryKeys.room(roomId),
      });
    },
  });
}

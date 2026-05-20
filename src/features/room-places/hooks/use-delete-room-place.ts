import { useMutation, useQueryClient } from "@tanstack/react-query";

import { decrementRoomPlaceCountInCache } from "@/features/room/utils/room-query-cache";

import { roomPlaceApi } from "../api/room-place-api";
import { roomPlaceQueryKeys } from "../query-keys";

type UseDeleteRoomPlaceOptions = {
  roomId: string | null;
};

export function useDeleteRoomPlace({ roomId }: UseDeleteRoomPlaceOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...roomPlaceQueryKeys.all, "delete", roomId],
    mutationFn: (roomPlaceId: number) => {
      if (!roomId) {
        throw new Error("roomId is required");
      }

      return roomPlaceApi.deleteRoomPlace(roomId, roomPlaceId);
    },
    onSuccess: async () => {
      if (!roomId) {
        return;
      }

      decrementRoomPlaceCountInCache(queryClient, roomId);

      await queryClient.invalidateQueries({
        queryKey: roomPlaceQueryKeys.room(roomId),
      });
    },
  });
}

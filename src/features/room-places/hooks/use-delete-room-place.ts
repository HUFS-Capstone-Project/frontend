import { useMutation, useQueryClient } from "@tanstack/react-query";

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

      await queryClient.invalidateQueries({
        queryKey: roomPlaceQueryKeys.room(roomId),
      });
    },
  });
}

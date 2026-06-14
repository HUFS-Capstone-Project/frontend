import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { roomPlaceApi, roomPlaceQueryKeys } from "@/features/room-places";
import { userQueryKeys } from "@/features/users";
import type { SavedPlace } from "@/shared/types/my-page";

type SavedPlaceMutationTarget = {
  roomId: string;
  roomPlaceId: number;
};

type UpdateSavedPlaceMemoVariables = SavedPlaceMutationTarget & {
  memo: string;
};

function getMutationTarget(place: SavedPlace | undefined): SavedPlaceMutationTarget | null {
  if (!place?.roomId || place.roomPlaceId == null) {
    return null;
  }

  return {
    roomId: place.roomId,
    roomPlaceId: place.roomPlaceId,
  };
}

export function useSavedPlaceActions(places: SavedPlace[]) {
  const queryClient = useQueryClient();

  const invalidateSavedPlaces = useCallback(
    async (roomId?: string | null) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userQueryKeys.myPlacesRoot() }),
        roomId
          ? queryClient.invalidateQueries({ queryKey: roomPlaceQueryKeys.room(roomId) })
          : Promise.resolve(),
      ]);
    },
    [queryClient],
  );

  const resolveMutationTarget = useCallback(
    (placeId: string) => getMutationTarget(places.find((place) => place.id === placeId)),
    [places],
  );

  const updateMemoMutation = useMutation({
    mutationFn: ({ roomId, roomPlaceId, memo }: UpdateSavedPlaceMemoVariables) =>
      roomPlaceApi.updateMemo(roomId, roomPlaceId, { memo }),
    onSuccess: async (_, variables) => {
      await invalidateSavedPlaces(variables.roomId);
    },
  });

  const deletePlaceMutation = useMutation({
    mutationFn: ({ roomId, roomPlaceId }: SavedPlaceMutationTarget) =>
      roomPlaceApi.deleteRoomPlace(roomId, roomPlaceId),
    onSuccess: async (_, variables) => {
      await invalidateSavedPlaces(variables.roomId);
    },
  });

  return {
    resolveMutationTarget,
    updateMemoMutation,
    deletePlaceMutation,
  };
}

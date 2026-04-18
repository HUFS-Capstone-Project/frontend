import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useRoomSelectionStore } from "@/store/room-selection-store";

import { roomService } from "../api/room-service";
import { roomQueryKeys } from "../query-keys";
import { removeRoomFromCache } from "../utils/room-query-cache";

type LeaveRoomVariables = {
  roomId: string;
};

export function useLeaveRoomMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...roomQueryKeys.all, "leave-room"],
    mutationFn: ({ roomId }: LeaveRoomVariables) => roomService.leaveRoom(roomId),
    onSuccess: (_result, variables) => {
      removeRoomFromCache(queryClient, variables.roomId);
      clearSelectedRoomIfMatch(variables.roomId);
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: roomQueryKeys.rooms() });
      void queryClient.invalidateQueries({ queryKey: roomQueryKeys.roomDetail(variables.roomId) });
    },
  });
}

function clearSelectedRoomIfMatch(roomId: string) {
  const roomSelectionStore = useRoomSelectionStore.getState();
  if (roomSelectionStore.selectedRoom?.id !== roomId) {
    return;
  }

  roomSelectionStore.clearSelectedRoom();
}

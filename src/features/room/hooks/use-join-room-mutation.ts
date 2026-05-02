import { useMutation, useQueryClient } from "@tanstack/react-query";

import { roomService } from "../api/room-service";
import type { JoinRoomRequest, JoinRoomResponse, RoomSummaryResponse } from "../api/types";
import { roomQueryKeys } from "../query-keys";
import { prependRoomSummary } from "../utils/room-query-cache";

export function useJoinRoomMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...roomQueryKeys.all, "join-room"],
    mutationFn: (payload: JoinRoomRequest) => roomService.joinRoom(payload),
    onSuccess: (joinedRoom) => {
      prependRoomSummary(queryClient, mapJoinRoomToSummary(joinedRoom));

      void queryClient.invalidateQueries({ queryKey: roomQueryKeys.rooms() });
      void queryClient.invalidateQueries({ queryKey: roomQueryKeys.roomDetail(joinedRoom.roomId) });
    },
  });
}

function mapJoinRoomToSummary(joinedRoom: JoinRoomResponse): RoomSummaryResponse {
  return {
    roomId: joinedRoom.roomId,
    roomName: joinedRoom.roomName,
    pinned: joinedRoom.pinned,
    createdAt: joinedRoom.createdAt,
    linkCount: 0,
    placeCount: 0,
    memberCount: 1,
  };
}

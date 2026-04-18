import { useMutation, useQueryClient } from "@tanstack/react-query";

import { roomService } from "../api/room-service";
import type { CreateRoomRequest, CreateRoomResponse, RoomSummaryResponse } from "../api/types";
import { roomQueryKeys } from "../query-keys";
import { prependRoomSummary } from "../utils/room-query-cache";

export function useCreateRoomMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...roomQueryKeys.all, "create-room"],
    mutationFn: (payload: CreateRoomRequest) => roomService.createRoom(payload),
    onSuccess: (createdRoom) => {
      queryClient.setQueryData(roomQueryKeys.roomDetail(createdRoom.roomId), {
        roomId: createdRoom.roomId,
        roomName: createdRoom.roomName,
        inviteCode: createdRoom.inviteCode,
        pinned: createdRoom.pinned,
        memberCount: 1,
        linkCount: 0,
        createdAt: createdRoom.createdAt,
      });
      prependRoomSummary(queryClient, mapCreateRoomToSummary(createdRoom));
    },
  });
}

function mapCreateRoomToSummary(createdRoom: CreateRoomResponse): RoomSummaryResponse {
  return {
    roomId: createdRoom.roomId,
    roomName: createdRoom.roomName,
    pinned: createdRoom.pinned,
    createdAt: createdRoom.createdAt,
    linkCount: 0,
    memberCount: 1,
  };
}

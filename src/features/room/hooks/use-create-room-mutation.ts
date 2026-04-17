import { useMutation, useQueryClient } from "@tanstack/react-query";

import { roomService } from "../api/room-service";
import type { CreateRoomRequest, CreateRoomResponse, RoomSummaryResponse } from "../api/types";
import { roomQueryKeys } from "../query-keys";

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
        role: createdRoom.role,
        memberCount: 1,
        linkCount: 0,
        createdAt: createdRoom.createdAt,
      });

      queryClient.setQueryData(
        roomQueryKeys.rooms(),
        (previous: RoomSummaryResponse[] | undefined) => {
          if (!previous) {
            return [mapCreateRoomToSummary(createdRoom)];
          }

          const next = previous.filter((room) => room.roomId !== createdRoom.roomId);
          return [mapCreateRoomToSummary(createdRoom), ...next];
        },
      );
    },
  });
}

function mapCreateRoomToSummary(createdRoom: CreateRoomResponse): RoomSummaryResponse {
  return {
    roomId: createdRoom.roomId,
    roomName: createdRoom.roomName,
    role: createdRoom.role,
    createdAt: createdRoom.createdAt,
    linkCount: 0,
    memberCount: 1,
  };
}

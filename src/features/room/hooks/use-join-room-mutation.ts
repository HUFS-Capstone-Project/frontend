import { useMutation, useQueryClient } from "@tanstack/react-query";

import { roomService } from "../api/room-service";
import type { JoinRoomRequest, JoinRoomResponse, RoomSummaryResponse } from "../api/types";
import { roomQueryKeys } from "../query-keys";

export function useJoinRoomMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [...roomQueryKeys.all, "join-room"],
    mutationFn: (payload: JoinRoomRequest) => roomService.joinRoom(payload),
    onSuccess: (joinedRoom) => {
      queryClient.setQueryData(
        roomQueryKeys.rooms(),
        (previous: RoomSummaryResponse[] | undefined) => {
          const summary = mapJoinRoomToSummary(joinedRoom);

          if (!previous) {
            return [summary];
          }

          const next = previous.filter((room) => room.roomId !== joinedRoom.roomId);
          return [summary, ...next];
        },
      );

      void queryClient.invalidateQueries({ queryKey: roomQueryKeys.roomDetail(joinedRoom.roomId) });
    },
  });
}

function mapJoinRoomToSummary(joinedRoom: JoinRoomResponse): RoomSummaryResponse {
  return {
    roomId: joinedRoom.roomId,
    roomName: joinedRoom.roomName,
    role: joinedRoom.role,
    createdAt: joinedRoom.createdAt,
    linkCount: 0,
    memberCount: 1,
  };
}

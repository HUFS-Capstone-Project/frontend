import { useMemo } from "react";

import type { RoomListRow } from "@/shared/types/room";

import { mapRoomSummaryToRoomListRow } from "../utils/roomListRows";
import { useRoomsQuery } from "./use-rooms-query";

export function useRoomListRowById(roomId: string | undefined): RoomListRow | null {
  const roomsQuery = useRoomsQuery();

  return useMemo(() => {
    if (roomId == null || roomId.length === 0) {
      return null;
    }

    const rooms = roomsQuery.data ?? [];
    const summary = rooms.find((r) => r.roomId === roomId);
    if (summary) {
      return mapRoomSummaryToRoomListRow(summary);
    }

    return {
      id: roomId,
      displayName: "방",
      memberCount: 1,
      placeCount: 0,
      isPinned: false,
    };
  }, [roomId, roomsQuery.data]);
}

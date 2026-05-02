import { useMemo } from "react";

import type { FriendRoomRow } from "@/shared/types/room";

import type { RoomSummaryResponse } from "../api";
import { useRoomsQuery } from "./use-rooms-query";

export function useFriendRoomRowById(roomId: string | undefined): FriendRoomRow | null {
  const roomsQuery = useRoomsQuery();

  return useMemo(() => {
    if (roomId == null || roomId.length === 0) {
      return null;
    }

    const rooms = roomsQuery.data ?? [];
    const summary = rooms.find((r) => r.roomId === roomId);
    if (summary) {
      return mapRoomSummaryToRow(summary);
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

function mapRoomSummaryToRow(room: RoomSummaryResponse): FriendRoomRow {
  return {
    id: room.roomId,
    displayName: room.roomName,
    memberCount: toNonNegativeNumber(room.memberCount, 1),
    placeCount: toNonNegativeNumber(room.placeCount ?? room.linkCount, 0),
    isPinned: room.pinned,
  };
}

function toNonNegativeNumber(value: number | null | undefined, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    return fallback;
  }

  return value;
}

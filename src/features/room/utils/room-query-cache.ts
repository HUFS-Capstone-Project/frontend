import type { QueryClient } from "@tanstack/react-query";

import type { RoomDetailResponse, RoomSummaryResponse } from "@/features/room/api/types";
import { roomQueryKeys } from "@/features/room/query-keys";

export function prependRoomSummary(queryClient: QueryClient, summary: RoomSummaryResponse): void {
  queryClient.setQueryData(roomQueryKeys.rooms(), (previous: RoomSummaryResponse[] | undefined) => {
    if (!previous) {
      return [summary];
    }

    const deduped = previous.filter((room) => room.roomId !== summary.roomId);
    return [summary, ...deduped];
  });
}

export function patchRoomSummary(
  queryClient: QueryClient,
  roomId: string,
  updater: (room: RoomSummaryResponse) => RoomSummaryResponse,
): void {
  queryClient.setQueryData(roomQueryKeys.rooms(), (previous: RoomSummaryResponse[] | undefined) => {
    if (!previous) {
      return previous;
    }

    return previous.map((room) => {
      if (room.roomId !== roomId) {
        return room;
      }

      return updater(room);
    });
  });
}

export function patchRoomDetail(
  queryClient: QueryClient,
  roomId: string,
  updater: (room: RoomDetailResponse) => RoomDetailResponse,
): void {
  queryClient.setQueryData(
    roomQueryKeys.roomDetail(roomId),
    (previous: RoomDetailResponse | undefined) => {
      if (!previous) {
        return previous;
      }

      return updater(previous);
    },
  );
}

export function setRoomNameInCache(
  queryClient: QueryClient,
  roomId: string,
  roomName: string,
): void {
  patchRoomSummary(queryClient, roomId, (room) => ({ ...room, roomName }));
  patchRoomDetail(queryClient, roomId, (room) => ({ ...room, roomName }));
}

export function setRoomPinInCache(queryClient: QueryClient, roomId: string, pinned: boolean): void {
  patchRoomSummary(queryClient, roomId, (room) => ({ ...room, pinned }));
  patchRoomDetail(queryClient, roomId, (room) => ({ ...room, pinned }));
}

export function incrementRoomLinkCountInCache(queryClient: QueryClient, roomId: string): void {
  patchRoomSummary(queryClient, roomId, (room) => ({
    ...room,
    linkCount: incrementCount(room.linkCount),
  }));
  patchRoomDetail(queryClient, roomId, (room) => ({
    ...room,
    linkCount: incrementCount(room.linkCount),
  }));
}

export function removeRoomFromCache(queryClient: QueryClient, roomId: string): void {
  queryClient.setQueryData(roomQueryKeys.rooms(), (previous: RoomSummaryResponse[] | undefined) => {
    if (!previous) {
      return previous;
    }

    return previous.filter((room) => room.roomId !== roomId);
  });

  queryClient.removeQueries({ queryKey: roomQueryKeys.roomDetail(roomId) });
}

function incrementCount(value: number | null | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    return 1;
  }

  return value + 1;
}

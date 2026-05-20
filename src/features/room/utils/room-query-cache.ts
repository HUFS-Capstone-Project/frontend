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
  queryClient.setQueriesData<RoomSummaryResponse[]>(
    { queryKey: roomQueryKeys.rooms() },
    (previous) => {
      if (!previous) {
        return previous;
      }

      return previous.map((room) => {
        if (room.roomId !== roomId) {
          return room;
        }

        return updater(room);
      });
    },
  );
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

export function incrementRoomPlaceCountInCache(
  queryClient: QueryClient,
  roomId: string,
  amount = 1,
): void {
  adjustRoomPlaceCountInCache(queryClient, roomId, normalizePositiveAmount(amount));
}

export function decrementRoomPlaceCountInCache(
  queryClient: QueryClient,
  roomId: string,
  amount = 1,
): void {
  adjustRoomPlaceCountInCache(queryClient, roomId, -normalizePositiveAmount(amount));
}

function adjustRoomPlaceCountInCache(
  queryClient: QueryClient,
  roomId: string,
  amount: number,
): void {
  patchRoomSummary(queryClient, roomId, (room) => ({
    ...room,
    placeCount: adjustCount(room.placeCount, amount),
  }));
  patchRoomDetail(queryClient, roomId, (room) => ({
    ...room,
    placeCount: adjustCount(room.placeCount, amount),
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

function normalizePositiveAmount(amount: number): number {
  return Number.isFinite(amount) && amount > 0 ? amount : 1;
}

function adjustCount(value: number | null | undefined, amount: number): number {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    return Math.max(0, amount);
  }

  return Math.max(0, value + amount);
}

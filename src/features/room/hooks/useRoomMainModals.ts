import { useCallback, useMemo, useState } from "react";

import type { RoomActionType } from "@/features/room/roomActionTypes";
import {
  applyPinOverrides,
  type PinOverride,
  sortFriendRoomRows,
} from "@/features/room/utils/friendRoomRows";
import type { FriendRoomRow } from "@/shared/types/room";

import type { RoomSummaryResponse } from "../api";
import { useRoomDetailQuery } from "./use-room-detail-query";
import { useRoomsQuery } from "./use-rooms-query";

/**
 * 방 메인 화면의 모달 상태와 액션 핸들러 훅
 */
export function useRoomMainModals() {
  const [pinOverrides, setPinOverrides] = useState<Record<string, PinOverride>>({});
  const [inviteCodeRoom, setInviteCodeRoom] = useState<FriendRoomRow | null>(null);
  const [leaveRoom, setLeaveRoom] = useState<FriendRoomRow | null>(null);
  const [linkAddRoom, setLinkAddRoom] = useState<FriendRoomRow | null>(null);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);

  const roomsQuery = useRoomsQuery();
  const roomRows = useMemo(() => {
    const rooms = roomsQuery.data ?? [];

    return rooms.map(mapRoomSummaryToRow);
  }, [roomsQuery.data]);

  const sortedRows = useMemo(() => {
    const merged = applyPinOverrides(roomRows, pinOverrides);
    return sortFriendRoomRows(merged);
  }, [pinOverrides, roomRows]);

  const inviteCodeRoomId = inviteCodeRoom?.id ?? null;
  const inviteCodeRoomDetailQuery = useRoomDetailQuery(inviteCodeRoomId, {
    enabled: inviteCodeRoomId != null,
  });

  const inviteCodeDisplayRoom = useMemo(() => {
    if (!inviteCodeRoom) {
      return null;
    }

    const detail = inviteCodeRoomDetailQuery.data;
    if (!detail) {
      return inviteCodeRoom;
    }

    return {
      ...inviteCodeRoom,
      displayName: detail.roomName,
      inviteCode: detail.inviteCode,
      memberCount: toNonNegativeNumber(detail.memberCount, inviteCodeRoom.memberCount),
      placeCount: toNonNegativeNumber(detail.linkCount, inviteCodeRoom.placeCount),
    };
  }, [inviteCodeRoom, inviteCodeRoomDetailQuery.data]);

  const handleRoomAction = useCallback((action: RoomActionType, room: FriendRoomRow) => {
    if (action === "toggle-pin") {
      const nextPinned = !room.isPinned;
      setPinOverrides((prev) => ({
        ...prev,
        [room.id]: nextPinned
          ? { isPinned: true, pinnedAt: Date.now() }
          : { isPinned: false, pinnedAt: undefined },
      }));
      return;
    }

    if (action === "add-direct-link") {
      setLinkAddRoom(room);
      return;
    }

    if (action === "edit-info") {
      // TODO: 방 이름 변경 플로우
      void room.id;
      return;
    }

    if (action === "invite-code") {
      setInviteCodeRoom(room);
      return;
    }

    if (action === "leave") {
      setLeaveRoom(room);
    }
  }, []);

  const handleConfirmLeaveRoom = useCallback((room: FriendRoomRow) => {
    setLeaveRoom(null);
    // TODO: 방 나가기 API(room.id)
    void room.id;
  }, []);

  const closeInviteCodeModal = useCallback(() => {
    setInviteCodeRoom(null);
  }, []);

  const openInviteCodeModal = useCallback((room: FriendRoomRow) => {
    setInviteCodeRoom(room);
  }, []);

  const closeLeaveRoomModal = useCallback(() => {
    setLeaveRoom(null);
  }, []);

  const closeLinkAddModal = useCallback(() => {
    setLinkAddRoom(null);
  }, []);

  const openAddRoom = useCallback(() => {
    setIsAddRoomOpen(true);
  }, []);

  const closeAddRoom = useCallback(() => {
    setIsAddRoomOpen(false);
  }, []);

  return {
    sortedRows,
    inviteCodeRoom: inviteCodeDisplayRoom,
    leaveRoom,
    linkAddRoom,
    isAddRoomOpen,
    isRoomsLoading: roomsQuery.isLoading,
    roomsError: roomsQuery.error,
    handleRoomAction,
    handleConfirmLeaveRoom,
    closeInviteCodeModal,
    openInviteCodeModal,
    closeLeaveRoomModal,
    closeLinkAddModal,
    openAddRoom,
    closeAddRoom,
  };
}

function mapRoomSummaryToRow(room: RoomSummaryResponse): FriendRoomRow {
  return {
    id: room.roomId,
    displayName: room.roomName,
    memberCount: toNonNegativeNumber(room.memberCount, 1),
    placeCount: toNonNegativeNumber(room.linkCount, 0),
  };
}

function toNonNegativeNumber(value: number | null | undefined, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    return fallback;
  }

  return value;
}

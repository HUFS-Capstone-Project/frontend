import type { RoomListRow } from "@/shared/types/room";

export type { RoomListRow } from "@/shared/types/room";

export const ROOM_LIST_MOCK_ROWS: RoomListRow[] = [
  {
    id: "1",
    avatarSeed: "mock-room-1",
    displayName: "내꺼♥",
    memberCount: 2,
    placeCount: 5,
    isPinned: true,
    pinnedAt: 1_700_000_000_000,
    inviteCode: "28194",
  },
  {
    id: "2",
    avatarSeed: "mock-room-2",
    displayName: "가족방",
    memberCount: 4,
    placeCount: 6,
    inviteCode: "44102",
  },
  {
    id: "3",
    avatarSeed: "mock-room-3",
    displayName: "재수팟",
    memberCount: 6,
    placeCount: 6,
    inviteCode: "90351",
  },
];

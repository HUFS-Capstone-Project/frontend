import type { FriendRoomRow } from "@/shared/types/room";

export type { FriendRoomRow } from "@/shared/types/room";

export const FRIEND_ROOM_MOCK_ROWS: FriendRoomRow[] = [
  {
    id: "1",
    displayName: "내꺼♥️",
    memberCount: 2,
    placeCount: 5,
    liked: true,
  },
  {
    id: "2",
    displayName: "가족방",
    memberCount: 4,
    placeCount: 6,
    liked: false,
  },
  {
    id: "3",
    displayName: "재수팟",
    memberCount: 6,
    placeCount: 6,
    liked: false,
  },
];

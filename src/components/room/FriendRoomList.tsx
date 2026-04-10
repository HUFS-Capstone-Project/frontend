import { useState } from "react";

import type { FriendRoomRow } from "@/shared/types/room";

import { FriendRoomItem } from "./FriendRoomItem";

export type FriendRoomListProps = {
  rows: FriendRoomRow[];
};

export function FriendRoomList({ rows }: FriendRoomListProps) {
  const [likes, setLikes] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(rows.map((r) => [r.id, r.liked])),
  );

  return (
    <ul className="divide-y divide-border/35" role="list">
      {rows.map((row) => (
        <li key={row.id}>
          <FriendRoomItem
            row={row}
            liked={likes[row.id] ?? false}
            onToggleFavorite={() => {
              setLikes((prev) => ({ ...prev, [row.id]: !prev[row.id] }));
            }}
          />
        </li>
      ))}
    </ul>
  );
}

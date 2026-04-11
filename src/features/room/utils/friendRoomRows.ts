import type { FriendRoomRow } from "@/shared/types/room";

export type PinOverride = { isPinned: boolean; pinnedAt?: number };

/**
 * 서버/목 데이터 행에 로컬 고정 오버레이를 합칩니다. 추후 API 응답 + optimistic 업데이트에도 동일 패턴을 쓸 수 있습니다.
 */
export function applyPinOverrides(
  rows: FriendRoomRow[],
  overrides: Record<string, PinOverride>,
): FriendRoomRow[] {
  return rows.map((row) => {
    const o = overrides[row.id];
    if (!o) return row;
    return { ...row, isPinned: o.isPinned, pinnedAt: o.pinnedAt };
  });
}

/**
 * 1) 고정된 방 먼저 (pinnedAt 내림차순, 동률이면 원래 순서)
 * 2) 고정되지 않은 방은 입력 배열의 상대 순서 유지
 */
export function sortFriendRoomRows(rows: FriendRoomRow[]): FriendRoomRow[] {
  const indexed = rows.map((row, originalIndex) => ({ row, originalIndex }));
  const pinned = indexed.filter(({ row }) => row.isPinned);
  const unpinned = indexed.filter(({ row }) => !row.isPinned);

  pinned.sort((a, b) => {
    const bt = b.row.pinnedAt ?? 0;
    const at = a.row.pinnedAt ?? 0;
    if (bt !== at) return bt - at;
    return a.originalIndex - b.originalIndex;
  });

  unpinned.sort((a, b) => a.originalIndex - b.originalIndex);

  return [...pinned.map((x) => x.row), ...unpinned.map((x) => x.row)];
}

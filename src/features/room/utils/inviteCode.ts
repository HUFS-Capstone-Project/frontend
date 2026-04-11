import type { FriendRoomRow } from "@/shared/types/room";

/** 초대코드 5자리 문자열(표시·복사 공통). inviteCode 미설정 시 room.id 기반 임시값. */
export function getInviteCodeDigits(room: FriendRoomRow): string {
  const raw = room.inviteCode?.replace(/\D/g, "") ?? "";
  if (raw.length >= 5) return raw.slice(0, 5);
  if (raw.length > 0) return raw.padStart(5, "0").slice(0, 5);
  const n = Number.parseInt(room.id, 10);
  const base = Number.isFinite(n) ? n : room.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return String(10000 + (base % 90000)).slice(0, 5);
}

export function formatInviteCodeForDisplay(digits: string): string {
  return digits.split("").join(" ");
}

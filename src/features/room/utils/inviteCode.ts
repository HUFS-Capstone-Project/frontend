import type { FriendRoomRow } from "@/shared/types/room";

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const INVITE_CODE_LENGTH = 12;

/**
 * 초대코드 표시/복사용 문자열.
 * 서버에서 base62 코드를 내려주므로 숫자 필터링 없이 그대로 사용한다.
 */
export function getInviteCodeDigits(room: FriendRoomRow): string {
  const raw = normalizeInviteCode(room.inviteCode);
  if (raw) {
    return raw;
  }

  return buildFallbackInviteCode(room.id, INVITE_CODE_LENGTH);
}

export function formatInviteCodeForDisplay(code: string): string {
  const normalized = code.trim();
  if (normalized.length === 0) {
    return "";
  }

  const chunked = normalized.match(/.{1,4}/g);
  if (!chunked) {
    return normalized;
  }

  return chunked.join("-");
}

function normalizeInviteCode(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  if (normalized.length === 0) {
    return null;
  }

  return normalized;
}

function buildFallbackInviteCode(seed: string, length: number): string {
  let hash = 0;
  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  let current = hash || 1;
  let code = "";

  for (let index = 0; index < length; index += 1) {
    current = (current * 1664525 + 1013904223) >>> 0;
    code += BASE62[current % BASE62.length];
  }

  return code;
}

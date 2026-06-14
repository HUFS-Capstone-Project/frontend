const APP_DISPLAY_NAME = "어디더라";

export type ShareRoomInvitePayload = {
  roomName: string;
  inviteCode: string;
};

export type ShareRoomInviteResult = "shared" | "copied" | "cancelled" | "failed";

export function buildRoomInviteShareText(roomName: string, inviteCode: string): string {
  const trimmedName = roomName.trim();
  const trimmedCode = inviteCode.trim();

  return `[${APP_DISPLAY_NAME}] ${trimmedName}에서 초대장이 날라왔어요!\n아래의 초대코드를 붙여넣고 함께 지도를 만들어나가요!\n${trimmedCode}`;
}

function isShareCancelled(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

async function copyShareText(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to legacy copy
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";

  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);

  return copied;
}

export async function shareRoomInvite(
  payload: ShareRoomInvitePayload,
): Promise<ShareRoomInviteResult> {
  const trimmedName = payload.roomName.trim();
  const trimmedCode = payload.inviteCode.trim();

  if (trimmedName.length === 0 || trimmedCode.length === 0) {
    return "failed";
  }

  const text = buildRoomInviteShareText(trimmedName, trimmedCode);
  const title = `[${APP_DISPLAY_NAME}] ${trimmedName} 초대`;

  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ title, text });
      return "shared";
    } catch (error) {
      if (isShareCancelled(error)) {
        return "cancelled";
      }
    }
  }

  const copied = await copyShareText(text);
  return copied ? "copied" : "failed";
}

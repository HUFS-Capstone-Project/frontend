import { type NativeShareResult, shareWithNativeFallback } from "@/shared/lib/native-share";

const APP_DISPLAY_NAME = "어디더라";

export type ShareRoomInvitePayload = {
  roomName: string;
  inviteCode: string;
};

export type ShareRoomInviteResult = NativeShareResult;

export function buildRoomInviteShareText(roomName: string, inviteCode: string): string {
  const trimmedName = roomName.trim();
  const trimmedCode = inviteCode.trim();

  return `[${APP_DISPLAY_NAME}] ${trimmedName}에서 초대장이 날라왔어요!\n아래의 초대코드를 붙여넣고 함께 지도를 만들어나가요!\n${trimmedCode}`;
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

  return shareWithNativeFallback({
    title,
    text,
    dialogTitle: "초대장 공유",
  });
}

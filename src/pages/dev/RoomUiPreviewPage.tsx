import { RoomMainPage } from "@/pages/room/RoomMainPage";

/**
 * 로그인·온보딩 없이 방 메인 UI만 확인할 때 사용합니다.
 * 주소: `/dev/room-ui`
 */
export function RoomUiPreviewPage() {
  return <RoomMainPage />;
}

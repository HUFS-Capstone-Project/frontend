import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { FloatingActionButton } from "@/components/common/FloatingActionButton";
import { FriendRoomList } from "@/components/room/FriendRoomList";
import { RoomMainHeader } from "@/components/room/RoomMainHeader";
import { RoomMainShell } from "@/components/room/RoomMainShell";
import { FRIEND_ROOM_MOCK_ROWS } from "@/pages/room/friend-room-mock";

export function RoomMainPage() {
  return (
    <RoomMainShell
      header={<RoomMainHeader title="홍길동님의 데이트 지도" />}
      fab={<FloatingActionButton label="방 생성" />}
      bottomNav={<BottomNavigationBar activeId="room" />}
    >
      <FriendRoomList rows={FRIEND_ROOM_MOCK_ROWS} />
    </RoomMainShell>
  );
}
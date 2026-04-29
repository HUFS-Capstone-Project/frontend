import { useLayoutEffect } from "react";

import MyHomePage_WithDetail from "@/pages/MyHomePage_WithDetail";
import { useRoomSelectionStore } from "@/store/room-selection-store";

const DEV_ROOM = {
  id: "dev-room-click-place",
  name: "친구 님과의 데이트 지도",
  memberCount: 3,
};

export default function DevClickPlacePage() {
  const selectRoom = useRoomSelectionStore((state) => state.selectRoom);
  const selectedRoom = useRoomSelectionStore((state) => state.selectedRoom);
  const isDevRoomReady = selectedRoom?.id === DEV_ROOM.id;

  useLayoutEffect(() => {
    if (!isDevRoomReady) {
      selectRoom(DEV_ROOM);
    }
  }, [isDevRoomReady, selectRoom]);

  if (!isDevRoomReady) {
    return null;
  }

  return <MyHomePage_WithDetail />;
}

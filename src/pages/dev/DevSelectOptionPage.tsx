import { useLayoutEffect } from "react";

import { MapHomePage } from "@/pages/MapHomePage";
import { useRoomSelectionStore } from "@/store/room-selection-store";
import { useUiStore } from "@/store/uiStore";

const DEV_ROOM = {
  id: "dev-room-select-option",
  name: "심심한 두쫀쿠 지도",
  memberCount: 4,
};

export function DevSelectOptionPage() {
  const selectRoom = useRoomSelectionStore((state) => state.selectRoom);
  const selectedRoom = useRoomSelectionStore((state) => state.selectedRoom);
  const setFilterOpen = useUiStore((state) => state.setFilterOpen);
  const isDevRoomReady = selectedRoom?.id === DEV_ROOM.id;

  useLayoutEffect(() => {
    if (!isDevRoomReady) {
      selectRoom(DEV_ROOM);
    }
    setFilterOpen(true);

    return () => {
      setFilterOpen(false);
    };
  }, [isDevRoomReady, selectRoom, setFilterOpen]);

  if (!isDevRoomReady) {
    return null;
  }

  return <MapHomePage />;
}

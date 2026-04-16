import { useEffect } from "react";

import { useRoomSelectionStore } from "@/store/room-selection-store";
import { useUiStore } from "@/store/uiStore";

import { MapHomePage } from "./MapHomePage";

const DEV_PREVIEW_ROOM = {
  id: "dev-map-select-room",
  name: "심심한 두쫀쿠 지도",
  memberCount: 2,
} as const;

export function MapHomePage_Select() {
  const selectRoom = useRoomSelectionStore((state) => state.selectRoom);
  const selectedRoom = useRoomSelectionStore((state) => state.selectedRoom);
  const setFilterOpen = useUiStore((state) => state.setFilterOpen);

  useEffect(() => {
    selectRoom(DEV_PREVIEW_ROOM);
    setFilterOpen(true);
  }, [selectRoom, setFilterOpen]);

  if (selectedRoom?.id !== DEV_PREVIEW_ROOM.id) {
    return null;
  }
  return <MapHomePage />;
}

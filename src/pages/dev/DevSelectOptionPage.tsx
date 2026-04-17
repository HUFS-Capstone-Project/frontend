import { useLayoutEffect } from "react";

import { MapHomePage_WithFilter } from "@/pages/MapHomePage_WithFilter";
import { useRoomSelectionStore } from "@/store/room-selection-store";
import { useUiStore } from "@/store/uiStore";

const DEV_ROOM = {
  id: "dev-room-select-option",
  name: "심심한 두쫀쿠 지도",
  memberCount: 4,
};

export function DevSelectOptionPage() {
  const selectRoom = useRoomSelectionStore((state) => state.selectRoom);
  const setFilterOpen = useUiStore((state) => state.setFilterOpen);

  useLayoutEffect(() => {
    selectRoom(DEV_ROOM);
    setFilterOpen(true);

    return () => {
      setFilterOpen(false);
    };
  }, [selectRoom, setFilterOpen]);

  return <MapHomePage_WithFilter />;
}

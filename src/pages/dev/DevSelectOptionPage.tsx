import { lazy, Suspense, useLayoutEffect } from "react";

import { useRoomSelectionStore } from "@/store/room-selection-store";

const MapHomePage = lazy(() => import("@/pages/MapHomePage"));

const DEV_ROOM = {
  id: "dev-room-select-option",
  name: "심심한 두쫀쿠 지도",
  memberCount: 4,
};

export default function DevSelectOptionPage() {
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

  return (
    <Suspense fallback={null}>
      <MapHomePage defaultFilterPanelOpen />
    </Suspense>
  );
}

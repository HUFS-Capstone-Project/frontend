import { Navigate } from "react-router-dom";

import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { BottomNavToast } from "@/components/common/BottomNavToast";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";
import { useRoomSelectionStore } from "@/store/room-selection-store";

export default function PlaceListPage() {
  const selectedRoom = useRoomSelectionStore((s) => s.selectedRoom);
  const { toastMessage, toastPlacement, handleSelectBottomNav } = useBottomNavController();

  if (!selectedRoom) {
    return <Navigate to="/room" replace />;
  }

  return (
    <div className="room-no-caret -m-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <main className="bg-background min-h-0 flex-1 overflow-hidden" />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 [&>*]:pointer-events-auto">
        <BottomNavToast message={toastMessage} placement={toastPlacement} />
        <BottomNavigationBar activeId="list" onSelect={handleSelectBottomNav} />
      </div>
    </div>
  );
}

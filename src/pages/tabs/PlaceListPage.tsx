import { Navigate } from "react-router-dom";

import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { BottomNavToast } from "@/components/common/BottomNavToast";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";
import { useRoomSelectionStore } from "@/store/room-selection-store";

export function PlaceListPage() {
  const selectedRoom = useRoomSelectionStore((s) => s.selectedRoom);
  const { toastMessage, handleSelectBottomNav } = useBottomNavController();

  if (!selectedRoom) {
    return <Navigate to="/room" replace />;
  }

  return (
    <div className="-m-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <main className="bg-background min-h-0 flex-1" />
      <BottomNavToast message={toastMessage} />
      <BottomNavigationBar activeId="list" onSelect={handleSelectBottomNav} />
    </div>
  );
}

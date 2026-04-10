import { useCallback, useState } from "react";
import { Navigate } from "react-router-dom";

import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { BottomNavToast } from "@/components/common/BottomNavToast";
import { FriendFloatingMenu } from "@/components/map/FriendFloatingMenu";
import { KakaoMapView } from "@/components/map/KakaoMapView";
import { MapHeader } from "@/components/map/MapHeader";
import { MapSearchOverlay } from "@/components/map/MapSearchOverlay";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";
import {
  MAP_CATEGORY_ITEMS,
  MAP_INITIAL_CENTER,
  MAP_SEARCH_PLACEHOLDER,
  ROOM_FRIEND_MOCKS,
  SAVED_PLACE_MOCKS,
} from "@/pages/map/map-home-mock";
import type { SavedPlace } from "@/shared/types/map-home";
import { useRoomSelectionStore } from "@/store/room-selection-store";

const KAKAO_MAP_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY;

export function MapHomePage() {
  const selectedRoom = useRoomSelectionStore((s) => s.selectedRoom);
  const { toastMessage, handleSelectBottomNav } = useBottomNavController();
  const [filteredPlaces, setFilteredPlaces] = useState<SavedPlace[]>(SAVED_PLACE_MOCKS);
  const [friendMenuOpen, setFriendMenuOpen] = useState(false);
  const mapTitle = selectedRoom ? selectedRoom.name : "데이트 지도";

  const handleFilteredPlacesChange = useCallback((nextPlaces: SavedPlace[]) => {
    setFilteredPlaces(nextPlaces);
  }, []);

  if (!selectedRoom) {
    return <Navigate to="/room" replace />;
  }

  return (
    <div className="-m-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <MapHeader title={mapTitle} />

      <main className="relative min-h-0 flex-1">
        <KakaoMapView
          appKey={KAKAO_MAP_APP_KEY}
          places={filteredPlaces}
          center={MAP_INITIAL_CENTER}
          className="absolute inset-0"
        />

        <div className="px-page pointer-events-none absolute inset-x-0 top-0 z-20 pt-3">
          <MapSearchOverlay
            places={SAVED_PLACE_MOCKS}
            categories={MAP_CATEGORY_ITEMS}
            placeholder={MAP_SEARCH_PLACEHOLDER}
            onFilteredPlacesChange={handleFilteredPlacesChange}
          />
        </div>
      </main>

      <div className="relative shrink-0">
        <BottomNavToast message={toastMessage} />
        <FriendFloatingMenu
          friends={ROOM_FRIEND_MOCKS}
          open={friendMenuOpen}
          onToggle={() => setFriendMenuOpen((prev) => !prev)}
          className="bottom-fab-above-nav end-page-safe absolute z-10"
        />
        <BottomNavigationBar activeId="map" onSelect={handleSelectBottomNav} />
      </div>
    </div>
  );
}

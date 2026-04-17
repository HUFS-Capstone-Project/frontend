import { type JSX, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";

import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { BottomNavToast } from "@/components/common/BottomNavToast";
import { FriendFloatingMenu } from "@/components/map/FriendFloatingMenu";
import { KakaoMapView } from "@/components/map/KakaoMapView";
import { MapHeader } from "@/components/map/MapHeader";
import { MapSearchOverlay } from "@/components/map/MapSearchOverlay";
import { useMapSearchFilters } from "@/features/map/hooks/use-map-search-filters";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";
import {
  MAP_CATEGORY_ITEMS,
  MAP_INITIAL_CENTER,
  MAP_PRIMARY_CATEGORY_ITEMS,
  MAP_SEARCH_PLACEHOLDER,
  SAVED_PLACE_MOCKS,
} from "@/pages/map/map-home-mock";
import type { RoomFriend } from "@/shared/types/map-home";
import type { SelectedRoom } from "@/store/room-selection-store";
import { useRoomSelectionStore } from "@/store/room-selection-store";

/** 선택된 방 멤버 수만큼 FAB 위 프로필 슬롯 생성 (이름은 추후 멤버 API 연동 시 대체) */
function roomFriendsForFab(room: SelectedRoom): RoomFriend[] {
  const n = Math.max(0, room.memberCount);
  return Array.from({ length: n }, (_, i) => ({
    id: `${room.id}-member-${i + 1}`,
    name: `멤버 ${i + 1}`,
  }));
}

const KAKAO_MAP_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY;

type MapHomePageContentProps = {
  defaultFilterPanelOpen?: boolean;
};

export function MapHomePageContent({
  defaultFilterPanelOpen = false,
}: MapHomePageContentProps): JSX.Element {
  const selectedRoom = useRoomSelectionStore((s) => s.selectedRoom);
  const { toastMessage, handleSelectBottomNav } = useBottomNavController();
  const [friendMenuOpen, setFriendMenuOpen] = useState(false);
  const mapTitle = selectedRoom ? selectedRoom.name : "데이트 지도";

  const {
    keyword,
    setKeyword,
    activeCategories,
    focusedCategory,
    toggleCategory,
    closeTagPanel,
    isTagPanelOpen,
    selectedTagKeysByCategory,
    selectedTagCountByCategory,
    toggleTagInCategory,
    resetFocusedCategoryTags,
    filteredPlaces,
  } = useMapSearchFilters({
    places: SAVED_PLACE_MOCKS,
    initialFocusedCategory: defaultFilterPanelOpen ? MAP_PRIMARY_CATEGORY_ITEMS[0] : null,
  });

  const fabFriends = useMemo(
    () => (selectedRoom ? roomFriendsForFab(selectedRoom) : []),
    [selectedRoom],
  );

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
            placeholder={MAP_SEARCH_PLACEHOLDER}
            keyword={keyword}
            onKeywordChange={setKeyword}
            categories={MAP_CATEGORY_ITEMS}
            activeCategories={activeCategories}
            focusedCategory={focusedCategory}
            onToggleCategory={toggleCategory}
            isTagPanelOpen={isTagPanelOpen}
            selectedTagKeysByCategory={selectedTagKeysByCategory}
            selectedTagCountByCategory={selectedTagCountByCategory}
            onToggleTagInCategory={toggleTagInCategory}
            onResetFocusedCategoryTags={resetFocusedCategoryTags}
            onCloseTagPanel={closeTagPanel}
          />
        </div>
      </main>

      <div className="relative shrink-0">
        <BottomNavToast message={toastMessage} />
        <FriendFloatingMenu
          friends={fabFriends}
          open={friendMenuOpen}
          onToggle={() => setFriendMenuOpen((prev) => !prev)}
          className="bottom-fab-above-nav end-page-safe absolute z-10"
        />
        <BottomNavigationBar activeId="map" onSelect={handleSelectBottomNav} />
      </div>
    </div>
  );
}

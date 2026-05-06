import { type JSX, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate } from "react-router-dom";

import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { BottomNavToast } from "@/components/common/BottomNavToast";
import { FriendFloatingMenu } from "@/components/map/FriendFloatingMenu";
import { MapHeader } from "@/components/map/MapHeader";
import { MapSearchOverlay } from "@/components/map/MapSearchOverlay";
import type { PlaceFilterData } from "@/features/map/api/place-taxonomy-types";
import { useMapSearchFilters } from "@/features/map/hooks/use-map-search-filters";
import { usePlaceFilterData } from "@/features/map/hooks/use-place-filter-data";
import {
  buildMapSearchSuggestions,
  findMapLocationMatchedPlaces,
  findMapSearchCenter,
  findMapSearchMatchedPlaces,
  isMapLocationSearch,
} from "@/features/map/utils/map-search";
import { roomPlaceToSavedPlace, useRoomPlaces } from "@/features/room-places";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";
import { APP_ROUTES } from "@/shared/config/routes";
import { resolveSavedPlacesBusinessHours, useKoreanNow } from "@/shared/lib/place-business-hours";
import { MAP_INITIAL_CENTER, MAP_SEARCH_PLACEHOLDER } from "@/shared/mocks/place-mocks";
import type { MapCoordinate, RoomFriend, SavedPlace } from "@/shared/types/map-home";
import { PLACE_DETAIL_OPEN_EVENT } from "@/store/place-detail-store";
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
const KakaoMapView = lazy(() =>
  import("@/components/map/KakaoMapView").then((module) => ({ default: module.KakaoMapView })),
);

const MAP_SEARCH_HISTORY_STATE_KEY = "mapSearch";

type MapViewport = {
  center: MapCoordinate;
  fitBoundsPlaces: SavedPlace[];
  geocodeKeyword: string;
  key: string;
};

type MapHomePageContentProps = {
  defaultFilterPanelOpen?: boolean;
  filterDataOverride?: PlaceFilterData | null;
};

export function MapHomePageContent({
  defaultFilterPanelOpen = false,
  filterDataOverride = null,
}: MapHomePageContentProps): JSX.Element {
  const selectedRoom = useRoomSelectionStore((s) => s.selectedRoom);
  const { toastMessage, toastPlacement, handleSelectBottomNav } = useBottomNavController();
  const [friendMenuOpen, setFriendMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [selectedSearchPlaceId, setSelectedSearchPlaceId] = useState<string | null>(null);
  const [isSearchSuggestionDismissed, setIsSearchSuggestionDismissed] = useState(false);
  const [mapViewport, setMapViewport] = useState<MapViewport>({
    center: MAP_INITIAL_CENTER,
    fitBoundsPlaces: [],
    geocodeKeyword: "",
    key: "initial",
  });
  const searchHistoryPushedRef = useRef(false);
  const now = useKoreanNow();
  const mapTitle = selectedRoom ? selectedRoom.name : "데이트 지도";
  const roomPlacesQuery = useRoomPlaces({
    roomId: selectedRoom?.id ?? null,
    params: { page: 0, size: 20 },
  });
  const savedPlaces = useMemo(
    () => (roomPlacesQuery.data?.items ?? []).map(roomPlaceToSavedPlace),
    [roomPlacesQuery.data?.items],
  );
  const places = useMemo(
    () => resolveSavedPlacesBusinessHours(savedPlaces, now),
    [now, savedPlaces],
  );
  const {
    categories,
    categoryNameByCode,
    filterCategories,
    isInitialLoading,
    isInitialError,
    retryLoad,
  } = usePlaceFilterData(filterDataOverride);

  const {
    keyword: appliedKeyword,
    setKeyword: setAppliedKeyword,
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
    places,
    filterCategories,
    initialFocusedCategory: defaultFilterPanelOpen ? (filterCategories[0]?.code ?? null) : null,
  });

  const fabFriends = useMemo(
    () => (selectedRoom ? roomFriendsForFab(selectedRoom) : []),
    [selectedRoom],
  );
  const searchSuggestions = useMemo(
    () => buildMapSearchSuggestions(places, searchInput),
    [places, searchInput],
  );
  const isSearchSuggestionsOpen = searchInput.trim().length > 0 && !isSearchSuggestionDismissed;
  const effectiveMapViewport = useMemo((): MapViewport => {
    if (mapViewport.key !== "initial" || roomPlacesQuery.dataUpdatedAt === 0) {
      return mapViewport;
    }

    if (savedPlaces.length === 0) {
      return mapViewport;
    }

    const [firstPlace] = savedPlaces;
    return {
      center:
        savedPlaces.length === 1 && firstPlace
          ? { latitude: firstPlace.latitude, longitude: firstPlace.longitude }
          : mapViewport.center,
      fitBoundsPlaces: savedPlaces,
      geocodeKeyword: "",
      key: `room-places-${roomPlacesQuery.dataUpdatedAt}-${savedPlaces.length}`,
    };
  }, [mapViewport, roomPlacesQuery.dataUpdatedAt, savedPlaces]);

  const clearSearchKeepViewport = useCallback(() => {
    if (!appliedKeyword && !searchInput && !selectedSearchPlaceId) {
      return;
    }

    setSelectedSearchPlaceId(null);
    setIsSearchSuggestionDismissed(true);
    setSearchInput("");
    setAppliedKeyword("");
  }, [appliedKeyword, searchInput, selectedSearchPlaceId, setAppliedKeyword]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (!searchHistoryPushedRef.current) {
        return;
      }

      if (event.state?.[MAP_SEARCH_HISTORY_STATE_KEY]) {
        return;
      }

      searchHistoryPushedRef.current = false;
      clearSearchKeepViewport();
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [clearSearchKeepViewport]);

  const pushSearchHistory = useCallback(() => {
    if (searchHistoryPushedRef.current) {
      window.history.replaceState({ [MAP_SEARCH_HISTORY_STATE_KEY]: true }, "");
      return;
    }

    window.history.pushState({ [MAP_SEARCH_HISTORY_STATE_KEY]: true }, "");
    searchHistoryPushedRef.current = true;
  }, []);

  const handleKeywordChange = useCallback((nextKeyword: string) => {
    setSelectedSearchPlaceId(null);
    setIsSearchSuggestionDismissed(nextKeyword.trim().length === 0);
    setSearchInput(nextKeyword);
  }, []);

  const handleSubmitSearch = useCallback(() => {
    const nextKeyword = searchInput.trim();
    setSelectedSearchPlaceId(null);
    setIsSearchSuggestionDismissed(true);

    if (!nextKeyword) {
      searchHistoryPushedRef.current = false;
      setSearchInput("");
      setAppliedKeyword("");
      setMapViewport({
        center: MAP_INITIAL_CENTER,
        fitBoundsPlaces: [],
        geocodeKeyword: "",
        key: "initial",
      });
      return;
    }

    const isLocationSearch = isMapLocationSearch(nextKeyword);
    const matchedPlaces = isLocationSearch
      ? findMapLocationMatchedPlaces(places, nextKeyword)
      : findMapSearchMatchedPlaces(places, nextKeyword);
    const shouldUseKakaoSearch = matchedPlaces.length === 0;
    const nextCenter = isLocationSearch
      ? findMapSearchCenter(places, nextKeyword, mapViewport.center)
      : matchedPlaces.length === 1
        ? {
            latitude: matchedPlaces[0].latitude,
            longitude: matchedPlaces[0].longitude,
          }
        : findMapSearchCenter(places, nextKeyword, effectiveMapViewport.center);

    setAppliedKeyword(isLocationSearch || shouldUseKakaoSearch ? "" : nextKeyword);
    setMapViewport({
      center: nextCenter,
      fitBoundsPlaces: matchedPlaces,
      geocodeKeyword: shouldUseKakaoSearch ? nextKeyword : "",
      key: `${nextKeyword}-${Date.now()}`,
    });
    pushSearchHistory();
  }, [
    effectiveMapViewport.center,
    mapViewport.center,
    places,
    pushSearchHistory,
    searchInput,
    setAppliedKeyword,
  ]);

  const handleCloseTagPanel = useCallback(() => {
    setIsSearchSuggestionDismissed(true);
    closeTagPanel();
  }, [closeTagPanel]);

  const handleOpenTagPanel = useCallback(
    (...params: Parameters<typeof toggleCategory>) => {
      setIsSearchSuggestionDismissed(true);
      toggleCategory(...params);
    },
    [toggleCategory],
  );

  const handleSelectSearchPlace = useCallback(
    (placeId: string) => {
      const place = places.find((item) => item.id === placeId);
      if (!place) {
        return;
      }

      setSelectedSearchPlaceId(place.id);
      setIsSearchSuggestionDismissed(true);
      setSearchInput(place.name);
      setAppliedKeyword(place.name);
      setMapViewport({
        center: { latitude: place.latitude, longitude: place.longitude },
        fitBoundsPlaces: [place],
        geocodeKeyword: "",
        key: `pan-${place.id}-${Date.now()}`,
      });
      pushSearchHistory();
      window.dispatchEvent(
        new CustomEvent(PLACE_DETAIL_OPEN_EVENT, {
          detail: { placeId: place.id },
        }),
      );
    },
    [places, pushSearchHistory, setAppliedKeyword],
  );

  const handleMapClick = useCallback(() => {
    clearSearchKeepViewport();
    setIsSearchSuggestionDismissed(true);
    handleCloseTagPanel();
  }, [clearSearchKeepViewport, handleCloseTagPanel]);

  if (!selectedRoom) {
    return <Navigate to={APP_ROUTES.room} replace />;
  }

  return (
    <div className="room-no-caret -m-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <MapHeader title={mapTitle} />

      <main className="relative min-h-0 flex-1">
        <Suspense fallback={<div className="absolute inset-0" aria-hidden />}>
          <KakaoMapView
            appKey={KAKAO_MAP_APP_KEY}
            places={filteredPlaces}
            center={effectiveMapViewport.center}
            fitBoundsPlaces={effectiveMapViewport.fitBoundsPlaces}
            geocodeKeyword={effectiveMapViewport.geocodeKeyword}
            viewportKey={effectiveMapViewport.key}
            showCurrentLocationButton
            onMapClick={handleMapClick}
            className="absolute inset-0"
          />
        </Suspense>

        <div className="px-page pointer-events-none absolute inset-x-0 top-0 z-20 pt-3">
          <MapSearchOverlay
            placeholder={MAP_SEARCH_PLACEHOLDER}
            keyword={searchInput}
            searchSuggestions={searchSuggestions}
            isSearchSuggestionsOpen={isSearchSuggestionsOpen}
            onKeywordChange={handleKeywordChange}
            onSubmitSearch={handleSubmitSearch}
            onSelectSearchPlace={handleSelectSearchPlace}
            categories={categories}
            categoryNameByCode={categoryNameByCode}
            filterCategories={filterCategories}
            isCategoryLoading={isInitialLoading}
            isCategoryError={isInitialError}
            onRetryLoadCategories={() => {
              void retryLoad();
            }}
            activeCategories={activeCategories}
            focusedCategory={focusedCategory}
            onToggleCategory={handleOpenTagPanel}
            isTagPanelOpen={isTagPanelOpen}
            selectedTagKeysByCategory={selectedTagKeysByCategory}
            selectedTagCountByCategory={selectedTagCountByCategory}
            onToggleTagInCategory={toggleTagInCategory}
            onResetFocusedCategoryTags={resetFocusedCategoryTags}
            onCloseTagPanel={handleCloseTagPanel}
          />
        </div>
      </main>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 [&>*]:pointer-events-auto">
        <BottomNavToast message={toastMessage} placement={toastPlacement} />
        <FriendFloatingMenu
          friends={fabFriends}
          open={friendMenuOpen}
          onToggle={() => setFriendMenuOpen((prev) => !prev)}
          className="bottom-fab-above-nav absolute left-[max(1rem,env(safe-area-inset-left))] z-10"
        />
        <BottomNavigationBar activeId="map" onSelect={handleSelectBottomNav} />
      </div>
    </div>
  );
}

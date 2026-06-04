import { type JSX, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

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
import { useRoomMembersQuery } from "@/features/room";
import { roomPlaceToSavedPlace, useAllRoomPlaces } from "@/features/room-places";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";
import { MAP_INITIAL_CENTER, MAP_KOREA_BOUNDS, MAP_SEARCH_PLACEHOLDER } from "@/shared/config/map";
import { APP_ROUTES, ROOM_APP_PATHS } from "@/shared/config/routes";
import type { MapCoordinate, RoomFriend, SavedPlace } from "@/shared/types/map-home";
import { PLACE_DETAIL_OPEN_EVENT } from "@/store/place-detail-store";
import { useRoomSelectionStore } from "@/store/room-selection-store";

const KAKAO_MAP_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
const KakaoMapView = lazy(() =>
  import("@/components/map/KakaoMapView").then((module) => ({ default: module.KakaoMapView })),
);

const MAP_SEARCH_HISTORY_STATE_KEY = "mapSearch";

type MapViewport = {
  center: MapCoordinate;
  fitBoundsPlaces: SavedPlace[];
  fitBoundsCoordinates: MapCoordinate[];
  geocodeKeyword: string;
  key: string;
};

type SelectedMemberFilter = {
  roomId: string;
  userId: number;
};

type MemberViewportRequest = {
  roomId: string;
  userId: number | null;
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
  const navigate = useNavigate();
  const { toastMessage, toastPlacement, handleSelectBottomNav } = useBottomNavController();
  const [friendMenuOpen, setFriendMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<SelectedMemberFilter | null>(
    null,
  );
  const [memberViewportRequest, setMemberViewportRequest] = useState<MemberViewportRequest | null>(
    null,
  );
  const [selectedSearchPlaceId, setSelectedSearchPlaceId] = useState<string | null>(null);
  const [isSearchSuggestionDismissed, setIsSearchSuggestionDismissed] = useState(false);
  const [mapViewport, setMapViewport] = useState<MapViewport>(() => createKoreaMapViewport());
  const searchHistoryPushedRef = useRef(false);
  const mapTitle = selectedRoom ? selectedRoom.name : "데이트 지도";
  const selectedMemberId =
    selectedMemberFilter && selectedRoom && selectedMemberFilter.roomId === selectedRoom.id
      ? selectedMemberFilter.userId
      : null;
  const roomMembersQuery = useRoomMembersQuery(selectedRoom?.id ?? null);
  const roomPlacesQuery = useAllRoomPlaces({
    roomId: selectedRoom?.id ?? null,
    params: { createdBy: selectedMemberId },
  });
  const savedPlaces = useMemo(
    () => (roomPlacesQuery.data?.items ?? []).map(roomPlaceToSavedPlace),
    [roomPlacesQuery.data?.items],
  );
  const places = savedPlaces;
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

  const fabFriends = useMemo<RoomFriend[]>(
    () =>
      (roomMembersQuery.data ?? []).map((member) => ({
        id: String(member.userId),
        userId: member.userId,
        name: member.nickname,
        profileImageUrl: member.profileImageUrl,
        me: member.me,
      })),
    [roomMembersQuery.data],
  );
  const searchSuggestions = useMemo(
    () => buildMapSearchSuggestions(places, searchInput),
    [places, searchInput],
  );
  const isSearchSuggestionsOpen = searchInput.trim().length > 0 && !isSearchSuggestionDismissed;
  const memberRequestedViewport = useMemo((): MapViewport | null => {
    if (
      !selectedRoom ||
      !memberViewportRequest ||
      memberViewportRequest.roomId !== selectedRoom.id ||
      memberViewportRequest.userId !== selectedMemberId ||
      !roomPlacesQuery.isFetched ||
      roomPlacesQuery.isFetching ||
      filteredPlaces.length === 0
    ) {
      return null;
    }

    return {
      center: averageMapCenter(filteredPlaces),
      fitBoundsPlaces: filteredPlaces,
      fitBoundsCoordinates: [],
      geocodeKeyword: "",
      key: `${memberViewportRequest.key}-${roomPlacesQuery.dataUpdatedAt}-${filteredPlaces.length}`,
    };
  }, [
    filteredPlaces,
    memberViewportRequest,
    roomPlacesQuery.dataUpdatedAt,
    roomPlacesQuery.isFetched,
    roomPlacesQuery.isFetching,
    selectedMemberId,
    selectedRoom,
  ]);
  const effectiveMapViewport = useMemo((): MapViewport => {
    if (memberRequestedViewport) {
      return memberRequestedViewport;
    }

    return mapViewport;
  }, [mapViewport, memberRequestedViewport]);

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
    setMemberViewportRequest(null);
    setSelectedSearchPlaceId(null);
    setIsSearchSuggestionDismissed(true);

    if (!nextKeyword) {
      searchHistoryPushedRef.current = false;
      setSearchInput("");
      setAppliedKeyword("");
      setMapViewport(createKoreaMapViewport());
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
      fitBoundsCoordinates: [],
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

      setMemberViewportRequest(null);
      setSelectedSearchPlaceId(place.id);
      setIsSearchSuggestionDismissed(true);
      setSearchInput(place.name);
      setAppliedKeyword(place.name);
      setMapViewport({
        center: { latitude: place.latitude, longitude: place.longitude },
        fitBoundsPlaces: [place],
        fitBoundsCoordinates: [],
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

  const handlePlaceMarkerClick = useCallback((place: SavedPlace) => {
    window.dispatchEvent(
      new CustomEvent(PLACE_DETAIL_OPEN_EVENT, {
        detail: { placeId: place.id },
      }),
    );
  }, []);

  const handleMapClick = useCallback(() => {
    clearSearchKeepViewport();
    setIsSearchSuggestionDismissed(true);
    handleCloseTagPanel();
  }, [clearSearchKeepViewport, handleCloseTagPanel]);

  const handleOpenPlaceList = useCallback(() => {
    if (!selectedRoom) {
      return;
    }

    navigate(ROOM_APP_PATHS.places(selectedRoom.id));
  }, [navigate, selectedRoom]);

  const handleSelectMember = useCallback(
    (friendId: number | null) => {
      if (!selectedRoom) {
        return;
      }

      if (friendId == null) {
        setSelectedMemberFilter(null);
      } else {
        setSelectedMemberFilter({ roomId: selectedRoom.id, userId: friendId });
      }

      setMemberViewportRequest({
        roomId: selectedRoom.id,
        userId: friendId,
        key: `member-${friendId ?? "all"}-${Date.now()}`,
      });
    },
    [selectedRoom],
  );

  if (!selectedRoom) {
    return <Navigate to={APP_ROUTES.room} replace />;
  }

  return (
    <div className="room-no-caret -m-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <MapHeader title={mapTitle} onOpenList={handleOpenPlaceList} />

      <main className="relative min-h-0 flex-1">
        <Suspense fallback={<div className="absolute inset-0" aria-hidden />}>
          <KakaoMapView
            appKey={KAKAO_MAP_APP_KEY}
            places={filteredPlaces}
            center={effectiveMapViewport.center}
            fitBoundsPlaces={effectiveMapViewport.fitBoundsPlaces}
            fitBoundsCoordinates={effectiveMapViewport.fitBoundsCoordinates}
            geocodeKeyword={effectiveMapViewport.geocodeKeyword}
            viewportKey={effectiveMapViewport.key}
            showCurrentLocationButton
            onMapClick={handleMapClick}
            onPlaceMarkerClick={handlePlaceMarkerClick}
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

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 *:pointer-events-auto">
        <BottomNavToast message={toastMessage} placement={toastPlacement} />
        <FriendFloatingMenu
          friends={fabFriends}
          selectedFriendId={selectedMemberId}
          open={friendMenuOpen}
          onToggle={() => setFriendMenuOpen((prev) => !prev)}
          onSelectFriend={handleSelectMember}
          className="bottom-fab-above-nav absolute left-[max(1rem,env(safe-area-inset-left))] z-10"
        />
        <BottomNavigationBar activeId="map" onSelect={handleSelectBottomNav} />
      </div>
    </div>
  );
}

function averageMapCenter(places: Pick<SavedPlace, "latitude" | "longitude">[]): MapCoordinate {
  if (places.length === 0) {
    return MAP_INITIAL_CENTER;
  }

  const total = places.reduce(
    (acc, place) => ({
      latitude: acc.latitude + place.latitude,
      longitude: acc.longitude + place.longitude,
    }),
    { latitude: 0, longitude: 0 },
  );

  return {
    latitude: total.latitude / places.length,
    longitude: total.longitude / places.length,
  };
}

function createKoreaMapViewport(): MapViewport {
  return {
    center: MAP_INITIAL_CENTER,
    fitBoundsPlaces: [],
    fitBoundsCoordinates: MAP_KOREA_BOUNDS,
    geocodeKeyword: "",
    key: "korea",
  };
}

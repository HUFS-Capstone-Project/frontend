import { type JSX, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { BottomNavToast } from "@/components/common/BottomNavToast";
import { FriendFloatingMenu } from "@/components/map/FriendFloatingMenu";
import type { KakaoMapViewport } from "@/components/map/KakaoMapView";
import { MapHeader } from "@/components/map/MapHeader";
import { MapSearchOverlay } from "@/components/map/MapSearchOverlay";
import { isAndroidCapacitorApp } from "@/features/auth/lib/capacitor-platform";
import type { PlaceFilterData } from "@/features/map/api/place-taxonomy-types";
import { useMapSearchFilters } from "@/features/map/hooks/use-map-search-filters";
import { usePlaceFilterData } from "@/features/map/hooks/use-place-filter-data";
import {
  findMapLocationMatchedPlaces,
  findMapSearchCenter,
  findMapSearchMatchedPlaces,
  includesMapSearchText,
  isMapLocationSearch,
} from "@/features/map/utils/map-search";
import { useRoomMembersQuery } from "@/features/room";
import type { RoomPlaceMapBoundsParams } from "@/features/room-places";
import {
  roomPlaceMapPinToSavedPlace,
  roomPlaceToSavedPlace,
  useRoomPlaceMapPins,
  useRoomPlaces,
} from "@/features/room-places";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";
import {
  MAP_ANDROID_INITIAL_BOUNDS,
  MAP_BOUNDS_DEBOUNCE_MS,
  MAP_INITIAL_CENTER,
  MAP_KOREA_BOUNDS,
  MAP_SEARCH_PLACEHOLDER,
} from "@/shared/config/map";
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

type MapHomePageContentProps = {
  defaultFilterPanelOpen?: boolean;
  filterDataOverride?: PlaceFilterData | null;
};

export function MapHomePageContent({
  defaultFilterPanelOpen = false,
  filterDataOverride = null,
}: MapHomePageContentProps): JSX.Element {
  const selectedRoom = useRoomSelectionStore((s) => s.selectedRoom);
  const isAndroidApp = isAndroidCapacitorApp();
  const navigate = useNavigate();
  const { toastMessage, toastPlacement, handleSelectBottomNav } = useBottomNavController();
  const [friendMenuOpen, setFriendMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<SelectedMemberFilter | null>(
    null,
  );
  const [selectedSearchPlaceId, setSelectedSearchPlaceId] = useState<string | null>(null);
  const [isSearchSuggestionDismissed, setIsSearchSuggestionDismissed] = useState(false);
  const [mapViewport, setMapViewport] = useState<MapViewport>(() =>
    createKoreaMapViewport(isAndroidApp),
  );
  const [mapBounds, setMapBounds] = useState<RoomPlaceMapBoundsParams | null>(null);
  const [viewportSnapshot, setViewportSnapshot] = useState<KakaoMapViewport | null>(null);
  const [debouncedSearchInput, setDebouncedSearchInput] = useState("");
  const searchHistoryPushedRef = useRef(false);
  const mapTitle = selectedRoom ? selectedRoom.name : "데이트 지도";
  const selectedMemberId =
    selectedMemberFilter && selectedRoom && selectedMemberFilter.roomId === selectedRoom.id
      ? selectedMemberFilter.userId
      : null;
  const roomMembersQuery = useRoomMembersQuery(selectedRoom?.id ?? null);
  const roomPlaceMapPinsQuery = useRoomPlaceMapPins({
    roomId: selectedRoom?.id ?? null,
    bounds: mapBounds ? { ...mapBounds, createdBy: selectedMemberId } : null,
  });
  const trimmedSearchInput = searchInput.trim();
  const searchKeyword = debouncedSearchInput.trim();
  const roomPlaceSearchQuery = useRoomPlaces({
    roomId: selectedRoom?.id ?? null,
    params: {
      keyword: searchKeyword,
      limit: 20,
      createdBy: selectedMemberId,
    },
    enabled: searchKeyword.length > 0 && !isSearchSuggestionDismissed,
  });
  const mapPinPlaces = useMemo(
    () => (roomPlaceMapPinsQuery.data?.items ?? []).map(roomPlaceMapPinToSavedPlace),
    [roomPlaceMapPinsQuery.data?.items],
  );
  const searchedPlaces = useMemo(
    () =>
      (roomPlaceSearchQuery.data?.pages ?? []).flatMap((page) =>
        page.items.map(roomPlaceToSavedPlace),
      ),
    [roomPlaceSearchQuery.data?.pages],
  );
  const shouldUseSearchPlacesOnMap =
    trimmedSearchInput.length > 0 && isSearchSuggestionDismissed && searchedPlaces.length > 0;
  const places = shouldUseSearchPlacesOnMap ? searchedPlaces : mapPinPlaces;
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
    () =>
      searchedPlaces.map((place) => ({
        place,
        matchType: includesMapSearchText(place.name, searchKeyword)
          ? ("name" as const)
          : ("address" as const),
      })),
    [searchedPlaces, searchKeyword],
  );
  const isSearchSuggestionsOpen = trimmedSearchInput.length > 0 && !isSearchSuggestionDismissed;
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
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchInput(searchInput);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchInput]);

  useEffect(() => {
    if (!viewportSnapshot) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const nextBounds = roundMapBounds(viewportSnapshot);
      setMapBounds((previous) => (areMapBoundsEqual(previous, nextBounds) ? previous : nextBounds));
    }, MAP_BOUNDS_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [viewportSnapshot]);

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
      setMapViewport(createKoreaMapViewport(isAndroidApp));
      return;
    }

    const isLocationSearch = isMapLocationSearch(nextKeyword);
    const searchSourcePlaces = searchedPlaces.length > 0 ? searchedPlaces : places;
    const matchedPlaces = isLocationSearch
      ? findMapLocationMatchedPlaces(searchSourcePlaces, nextKeyword)
      : findMapSearchMatchedPlaces(searchSourcePlaces, nextKeyword);
    const shouldUseKakaoSearch = matchedPlaces.length === 0;
    const nextCenter = isLocationSearch
      ? findMapSearchCenter(searchSourcePlaces, nextKeyword, mapViewport.center)
      : matchedPlaces.length === 1
        ? {
            latitude: matchedPlaces[0].latitude,
            longitude: matchedPlaces[0].longitude,
          }
        : findMapSearchCenter(searchSourcePlaces, nextKeyword, mapViewport.center);

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
    isAndroidApp,
    mapViewport.center,
    places,
    pushSearchHistory,
    searchInput,
    searchedPlaces,
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
      const place =
        searchedPlaces.find((item) => item.id === placeId) ??
        places.find((item) => item.id === placeId);
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
    [places, pushSearchHistory, searchedPlaces, setAppliedKeyword],
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

  const handleMapViewportIdle = useCallback((viewport: KakaoMapViewport) => {
    setViewportSnapshot(viewport);
  }, []);

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

      setSelectedSearchPlaceId(null);
      setIsSearchSuggestionDismissed(true);
      setSearchInput("");
      setAppliedKeyword("");
      setViewportSnapshot(null);

      if (friendId == null) {
        setSelectedMemberFilter(null);
        return;
      }

      setSelectedMemberFilter({ roomId: selectedRoom.id, userId: friendId });
    },
    [selectedRoom, setAppliedKeyword],
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
            center={mapViewport.center}
            fitBoundsPlaces={mapViewport.fitBoundsPlaces}
            fitBoundsCoordinates={mapViewport.fitBoundsCoordinates}
            geocodeKeyword={mapViewport.geocodeKeyword}
            viewportKey={mapViewport.key}
            showCurrentLocationButton
            onMapClick={handleMapClick}
            onPlaceMarkerClick={handlePlaceMarkerClick}
            onViewportIdle={handleMapViewportIdle}
            className="absolute inset-0"
          />
        </Suspense>

        <div className="px-page pointer-events-none absolute inset-x-0 top-0 z-20 pt-3">
          <MapSearchOverlay
            placeholder={MAP_SEARCH_PLACEHOLDER}
            keyword={searchInput}
            searchSuggestions={searchSuggestions}
            isSearchSuggestionsOpen={isSearchSuggestionsOpen}
            isFetchingNextSearchPage={roomPlaceSearchQuery.isFetchingNextPage}
            hasNextSearchPage={roomPlaceSearchQuery.hasNextPage}
            onKeywordChange={handleKeywordChange}
            onSubmitSearch={handleSubmitSearch}
            onLoadMoreSearchResults={() => {
              void roomPlaceSearchQuery.fetchNextPage();
            }}
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

      <div className="android-keyboard-lift pointer-events-none absolute inset-x-0 bottom-0 z-30 *:pointer-events-auto">
        <BottomNavToast message={toastMessage} placement={toastPlacement} />
        <FriendFloatingMenu
          friends={fabFriends}
          selectedFriendId={selectedMemberId}
          open={friendMenuOpen}
          onToggle={() => setFriendMenuOpen((prev) => !prev)}
          onSelectFriend={handleSelectMember}
          className="bottom-fab-above-nav absolute left-[max(1rem,var(--inset-left))] z-10"
        />
        <BottomNavigationBar activeId="map" onSelect={handleSelectBottomNav} />
      </div>
    </div>
  );
}

function createKoreaMapViewport(isAndroidApp: boolean): MapViewport {
  return {
    center: MAP_INITIAL_CENTER,
    fitBoundsPlaces: [],
    fitBoundsCoordinates: isAndroidApp ? MAP_ANDROID_INITIAL_BOUNDS : MAP_KOREA_BOUNDS,
    geocodeKeyword: "",
    key: isAndroidApp ? "korea-android" : "korea",
  };
}

function areMapBoundsEqual(
  previous: RoomPlaceMapBoundsParams | null,
  next: RoomPlaceMapBoundsParams,
): boolean {
  if (!previous) {
    return false;
  }

  return (
    previous.swLat === next.swLat &&
    previous.swLng === next.swLng &&
    previous.neLat === next.neLat &&
    previous.neLng === next.neLng &&
    previous.zoom === next.zoom
  );
}

function roundMapBounds(viewport: KakaoMapViewport): RoomPlaceMapBoundsParams {
  return {
    swLat: roundCoordinate(viewport.swLat),
    swLng: roundCoordinate(viewport.swLng),
    neLat: roundCoordinate(viewport.neLat),
    neLng: roundCoordinate(viewport.neLng),
    zoom: viewport.zoom,
  };
}

function roundCoordinate(value: number): number {
  return Math.round(value * 100_000) / 100_000;
}

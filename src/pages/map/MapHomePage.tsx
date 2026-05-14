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
import { roomPlaceToSavedPlace, useRoomPlaces } from "@/features/room-places";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";
import { APP_ROUTES } from "@/shared/config/routes";
import { MAP_INITIAL_CENTER, MAP_SEARCH_PLACEHOLDER } from "@/shared/mocks/place-mocks";
import type { MapCoordinate, RoomFriend, SavedPlace } from "@/shared/types/map-home";
import { PLACE_DETAIL_OPEN_EVENT } from "@/store/place-detail-store";
import { useRoomSelectionStore } from "@/store/room-selection-store";

const KAKAO_MAP_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
const KakaoMapView = lazy(() =>
  import("@/components/map/KakaoMapView").then((module) => ({ default: module.KakaoMapView })),
);

const MAP_SEARCH_HISTORY_STATE_KEY = "mapSearch";
const MAP_LAST_VIEWED_PLACE_STORAGE_PREFIX = "map:last-viewed-place:";

type MapViewport = {
  center: MapCoordinate;
  fitBoundsPlaces: SavedPlace[];
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

type LastViewedPlace = {
  placeId: string;
  center: MapCoordinate;
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
  const [mapViewport, setMapViewport] = useState<MapViewport>({
    center: MAP_INITIAL_CENTER,
    fitBoundsPlaces: [],
    geocodeKeyword: "",
    key: "initial",
  });
  const [currentLocationCenter, setCurrentLocationCenter] = useState<MapCoordinate | null>(null);
  const [lastViewedPlacesByRoom, setLastViewedPlacesByRoom] = useState<
    Record<string, LastViewedPlace>
  >({});
  const searchHistoryPushedRef = useRef(false);
  const mapTitle = selectedRoom ? selectedRoom.name : "데이트 지도";
  const selectedMemberId =
    selectedMemberFilter && selectedRoom && selectedMemberFilter.roomId === selectedRoom.id
      ? selectedMemberFilter.userId
      : null;
  const roomMembersQuery = useRoomMembersQuery(selectedRoom?.id ?? null);
  const roomPlacesQuery = useRoomPlaces({
    roomId: selectedRoom?.id ?? null,
    params: { page: 0, size: 20, createdBy: selectedMemberId },
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
  const lastViewedPlace = useMemo(
    () =>
      selectedRoom
        ? (lastViewedPlacesByRoom[selectedRoom.id] ?? readLastViewedPlace(selectedRoom.id))
        : null,
    [lastViewedPlacesByRoom, selectedRoom],
  );
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

    if (mapViewport.key !== "initial" || roomPlacesQuery.dataUpdatedAt === 0) {
      return mapViewport;
    }

    if (savedPlaces.length === 0) {
      if (currentLocationCenter && selectedMemberId == null) {
        return {
          center: currentLocationCenter,
          fitBoundsPlaces: [],
          geocodeKeyword: "",
          key: "current-location-empty-room",
        };
      }

      return mapViewport;
    }

    const lastViewedSavedPlace = lastViewedPlace
      ? savedPlaces.find((place) => place.id === lastViewedPlace.placeId)
      : null;
    const focusPlace = lastViewedSavedPlace ?? findMostRecentlySavedPlace(savedPlaces);
    const center = focusPlace
      ? { latitude: focusPlace.latitude, longitude: focusPlace.longitude }
      : mapViewport.center;

    return {
      center,
      fitBoundsPlaces: [],
      geocodeKeyword: "",
      key: `room-place-focus-${roomPlacesQuery.dataUpdatedAt}-${focusPlace?.id ?? "none"}`,
    };
  }, [
    currentLocationCenter,
    lastViewedPlace,
    mapViewport,
    memberRequestedViewport,
    roomPlacesQuery.dataUpdatedAt,
    savedPlaces,
    selectedMemberId,
  ]);

  useEffect(() => {
    if (
      selectedMemberId != null ||
      mapViewport.key !== "initial" ||
      !roomPlacesQuery.isFetched ||
      savedPlaces.length > 0 ||
      currentLocationCenter ||
      !("geolocation" in navigator)
    ) {
      return;
    }

    let disposed = false;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (disposed) {
          return;
        }

        const nextCenter = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        setCurrentLocationCenter(nextCenter);
      },
      () => {
        // Keep the fallback center if the browser cannot provide the current location.
      },
      {
        enableHighAccuracy: true,
        maximumAge: 30_000,
        timeout: 8_000,
      },
    );

    return () => {
      disposed = true;
    };
  }, [
    currentLocationCenter,
    mapViewport.key,
    roomPlacesQuery.isFetched,
    savedPlaces.length,
    selectedMemberId,
  ]);

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

  const rememberViewedPlace = useCallback(
    (place: SavedPlace) => {
      if (!selectedRoom) {
        return;
      }

      const nextViewedPlace = toLastViewedPlace(place);
      writeLastViewedPlace(selectedRoom.id, nextViewedPlace);
      setLastViewedPlacesByRoom((previous) => {
        const current = previous[selectedRoom.id];
        if (
          current?.placeId === nextViewedPlace.placeId &&
          current.center.latitude === nextViewedPlace.center.latitude &&
          current.center.longitude === nextViewedPlace.center.longitude
        ) {
          return previous;
        }

        return {
          ...previous,
          [selectedRoom.id]: nextViewedPlace,
        };
      });
    },
    [selectedRoom],
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
      rememberViewedPlace(place);
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
    [places, pushSearchHistory, rememberViewedPlace, setAppliedKeyword],
  );

  const handlePlaceMarkerClick = useCallback(
    (place: SavedPlace) => {
      rememberViewedPlace(place);

      window.dispatchEvent(
        new CustomEvent(PLACE_DETAIL_OPEN_EVENT, {
          detail: { placeId: place.id },
        }),
      );
    },
    [rememberViewedPlace],
  );

  const handleMapClick = useCallback(() => {
    clearSearchKeepViewport();
    setIsSearchSuggestionDismissed(true);
    handleCloseTagPanel();
  }, [clearSearchKeepViewport, handleCloseTagPanel]);

  const handleOpenPlaceList = useCallback(() => {
    navigate(APP_ROUTES.list);
  }, [navigate]);

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

function findMostRecentlySavedPlace(places: SavedPlace[]): SavedPlace | null {
  if (places.length === 0) {
    return null;
  }

  return [...places].sort((a, b) => toTimeValue(b.createdAt) - toTimeValue(a.createdAt))[0] ?? null;
}

function toTimeValue(value: string | null | undefined): number {
  if (!value) {
    return 0;
  }

  const time = Date.parse(value);
  return Number.isFinite(time) ? time : 0;
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

function toLastViewedPlace(place: SavedPlace): LastViewedPlace {
  return {
    placeId: place.id,
    center: {
      latitude: place.latitude,
      longitude: place.longitude,
    },
  };
}

function readLastViewedPlace(roomId: string): LastViewedPlace | null {
  try {
    const raw = window.sessionStorage.getItem(`${MAP_LAST_VIEWED_PLACE_STORAGE_PREFIX}${roomId}`);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<LastViewedPlace>;
    const latitude = parsed.center?.latitude;
    const longitude = parsed.center?.longitude;
    if (
      typeof parsed.placeId !== "string" ||
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return null;
    }

    return {
      placeId: parsed.placeId,
      center: { latitude, longitude },
    };
  } catch {
    return null;
  }
}

function writeLastViewedPlace(roomId: string, place: LastViewedPlace): void {
  try {
    window.sessionStorage.setItem(
      `${MAP_LAST_VIEWED_PLACE_STORAGE_PREFIX}${roomId}`,
      JSON.stringify(place),
    );
  } catch {
    // Ignore storage failures; map interaction should still work.
  }
}

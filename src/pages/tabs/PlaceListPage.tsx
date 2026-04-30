import "@/components/map/filter-bar.css";

import { AlertCircle, ArrowLeft, MapPin } from "lucide-react";
import { lazy, Suspense, useMemo, useRef, useState } from "react";

import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { BottomNavToast } from "@/components/common/BottomNavToast";
import { CoursePlannerBottomSheet } from "@/components/course-planner/CoursePlannerBottomSheet";
import { RegionSelectionPanel } from "@/components/course-planner/RegionSelectionPanel";
import { FilterBar } from "@/components/map/FilterBar";
import {
  mapPlacesMatchingMySaved,
  weightedMapCenter,
} from "@/components/mypage/map-places-from-my-saved";
import type { SavedPlace } from "@/components/mypage/mypage-mock-data";
import { SavedPlaceItem } from "@/components/mypage/SavedPlaceItem";
import { PlaceDetailSheet } from "@/components/place/PlaceDetailSheet";
import { PLACE_LIST_TEXT } from "@/components/place-list/place-list-mock-data";
import { useMapSearchFilters } from "@/features/map/hooks/use-map-search-filters";
import { usePlaceFilterData } from "@/features/map/hooks/use-place-filter-data";
import { FALLBACK_PLACE_FILTER_DATA } from "@/features/map/lib/fallback-place-filter-data";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";
import { usePlaceDetailOpenEvent } from "@/hooks/use-place-detail-open-event";
import { usePointerDownOutside } from "@/hooks/use-pointer-down-outside";
import { cn } from "@/lib/utils";
import { SAVED_PLACE_MOCKS } from "@/pages/map/map-home-mock";
import { resolveSavedPlacesBusinessHours, useKoreanNow } from "@/shared/lib/place-business-hours";
import { MAP_ALL_CATEGORY_FILTER_CHIP, type MapPrimaryCategory } from "@/shared/types/map-home";
import { usePlaceDetailStore } from "@/store/placeDetailStore";

const KAKAO_MAP_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
const KakaoMapView = lazy(() =>
  import("@/components/map/KakaoMapView").then((module) => ({ default: module.KakaoMapView })),
);

function formatCount(count: number) {
  return count > 999 ? "999+" : String(count);
}

function placeMatchesRegion(placeAddress: string, city: string, district: string) {
  const matchesCity = placeAddress.includes(city);
  const matchesDistrict = district === "전체" || placeAddress.includes(district);
  return matchesCity && matchesDistrict;
}

export default function PlaceListPage() {
  const now = useKoreanNow();
  const { toastMessage, toastPlacement, handleSelectBottomNav } = useBottomNavController();

  const resolvedPlaces = useMemo(
    () => resolveSavedPlacesBusinessHours(SAVED_PLACE_MOCKS, now),
    [now],
  );

  const {
    filterCategories: apiFilterCategories,
    isInitialLoading: isTaxonomyLoading,
    isInitialError: isTaxonomyError,
    retryLoad,
  } = usePlaceFilterData();

  const filterCategories = useMemo(() => {
    if (apiFilterCategories.length > 0) return apiFilterCategories;
    if (isTaxonomyLoading && !isTaxonomyError) return [];
    return FALLBACK_PLACE_FILTER_DATA.categories;
  }, [apiFilterCategories, isTaxonomyError, isTaxonomyLoading]);

  const categories = useMemo(
    () => [MAP_ALL_CATEGORY_FILTER_CHIP, ...filterCategories.map((category) => category.code)],
    [filterCategories],
  );

  const categoryNameByCode = useMemo(
    () =>
      filterCategories.reduce(
        (accumulator, category) => {
          accumulator[category.code as MapPrimaryCategory] = category.name;
          return accumulator;
        },
        {} as Record<MapPrimaryCategory, string>,
      ),
    [filterCategories],
  );

  const isCategoryLoading = filterCategories.length === 0 && isTaxonomyLoading && !isTaxonomyError;

  const {
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
    places: resolvedPlaces,
    filterCategories,
    categoriesOnly: true,
  });

  const [selectedCity, setSelectedCity] = useState("서울");
  const [selectedDistrict, setSelectedDistrict] = useState("동대문구");
  const [draftCity, setDraftCity] = useState("서울");
  const [draftDistrict, setDraftDistrict] = useState("동대문구");
  const [isRegionPanelOpen, setIsRegionPanelOpen] = useState(false);

  const categoryFilteredPlaces = filteredPlaces;

  const listPlacesBase = useMemo((): SavedPlace[] => {
    return categoryFilteredPlaces
      .filter((place) => placeMatchesRegion(place.address, selectedCity, selectedDistrict))
      .map((place) => ({
        id: place.id,
        name: place.name,
        address: place.address,
        category: place.category,
        tagKeys: place.tagKeys,
      }));
  }, [categoryFilteredPlaces, selectedCity, selectedDistrict]);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null);
  const [memoDraft, setMemoDraft] = useState("");
  const [placeMemos, setPlaceMemos] = useState<Record<string, string>>({});
  const [removedPlaceIds, setRemovedPlaceIds] = useState<string[]>([]);

  const displayedPlaces = useMemo((): SavedPlace[] => {
    const removed = new Set(removedPlaceIds);
    return listPlacesBase
      .filter((place) => !removed.has(place.id))
      .map((place) => ({
        ...place,
        memo: placeMemos[place.id] ?? place.memo,
      }));
  }, [listPlacesBase, placeMemos, removedPlaceIds]);

  const mapPins = useMemo(
    () => resolveSavedPlacesBusinessHours(mapPlacesMatchingMySaved(displayedPlaces), now),
    [displayedPlaces, now],
  );

  const detailOpen = usePlaceDetailStore((s) => s.isOpen);
  const selectedPlaceId = usePlaceDetailStore((s) => s.selectedPlaceId);
  const closeDetail = usePlaceDetailStore((s) => s.closeDetail);
  const openPlaceDetail = usePlaceDetailStore((s) => s.openDetail);

  usePlaceDetailOpenEvent(true);

  const filterChromeRef = useRef<HTMLDivElement>(null);
  usePointerDownOutside(filterChromeRef, isTagPanelOpen, closeTagPanel);

  const mapCenter = useMemo(() => {
    if (selectedPlaceId) {
      const pin = mapPins.find((p) => p.id === selectedPlaceId);
      if (pin) {
        return { latitude: pin.latitude, longitude: pin.longitude };
      }
    }
    return weightedMapCenter(mapPins);
  }, [mapPins, selectedPlaceId]);

  const regionFieldValue =
    selectedDistrict === "전체" ? selectedCity : `${selectedCity} ${selectedDistrict}`;

  const handleOpenRegionSelect = () => {
    closeTagPanel();
    setDraftCity(selectedCity);
    setDraftDistrict(selectedDistrict);
    setIsRegionPanelOpen(true);
  };

  const handleSelectDraftCity = (city: string) => {
    setDraftCity(city);
    setDraftDistrict("전체");
  };

  const handleConfirmRegion = () => {
    setSelectedCity(draftCity);
    setSelectedDistrict(draftDistrict);
    setIsRegionPanelOpen(false);
  };

  const shownCount = displayedPlaces.length;
  const regionTotal = listPlacesBase.length;
  const categoryTotal = categoryFilteredPlaces.length;
  const displayedCountLabel =
    shownCount === regionTotal && regionTotal === categoryTotal
      ? `${formatCount(shownCount)}개`
      : shownCount === regionTotal
        ? `${formatCount(shownCount)}개 · 전체 ${formatCount(categoryTotal)}`
        : `${formatCount(shownCount)}개 · 전체 ${formatCount(regionTotal)}`;

  const emptyMessage =
    resolvedPlaces.length === 0 ? PLACE_LIST_TEXT.emptySaved : PLACE_LIST_TEXT.emptyFiltered;

  const handleHeaderBack = () => {
    if (detailOpen) {
      closeDetail();
    }
  };

  const handleStartMemo = (place: SavedPlace) => {
    setOpenMenuId(null);
    setEditingPlaceId(place.id);
    setMemoDraft(place.memo ?? "");
  };

  const handleSaveMemo = () => {
    if (!editingPlaceId) {
      return;
    }

    const nextMemo = memoDraft.trim();
    setPlaceMemos((previous) => {
      const next = { ...previous };
      if (nextMemo) {
        next[editingPlaceId] = nextMemo;
      } else {
        delete next[editingPlaceId];
      }
      return next;
    });
    setEditingPlaceId(null);
    setMemoDraft("");
  };

  const handleDeletePlace = (id: string) => {
    setRemovedPlaceIds((previous) => (previous.includes(id) ? previous : [...previous, id]));
    setOpenMenuId(null);
    setPlaceMemos((previous) => {
      if (!(id in previous)) {
        return previous;
      }
      const next = { ...previous };
      delete next[id];
      return next;
    });
    if (editingPlaceId === id) {
      setEditingPlaceId(null);
      setMemoDraft("");
    }
    if (selectedPlaceId === id) {
      closeDetail();
    }
  };

  return (
    <div className="room-no-caret -m-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {detailOpen ? (
        <div className="absolute inset-0 z-0">
          <Suspense fallback={<div className="bg-map-placeholder-bg h-full w-full" aria-hidden />}>
            <KakaoMapView
              appKey={KAKAO_MAP_APP_KEY}
              places={mapPins}
              center={mapCenter}
              className="h-full w-full"
            />
          </Suspense>
        </div>
      ) : null}

      <header
        className={cn(
          "relative z-20 shrink-0 pt-[max(1rem,env(safe-area-inset-top))]",
          detailOpen
            ? "border-border/55 bg-background/93 supports-[backdrop-filter]:bg-background/82 border-b border-transparent shadow-[0_8px_24px_oklch(0_0_0/0.05)] backdrop-blur-md backdrop-saturate-150"
            : "bg-background sticky top-0",
        )}
      >
        <div className="flex h-12 items-center px-5">
          {detailOpen ? (
            <button
              type="button"
              onClick={handleHeaderBack}
              className="touch-target-min -ml-3 flex items-center justify-center rounded-full"
            >
              <ArrowLeft className="size-5 text-[#222222]" aria-hidden />
              <span className="sr-only">장소 상세 닫기</span>
            </button>
          ) : (
            <span className="w-9 shrink-0" aria-hidden />
          )}
          <h1 className="flex-1 text-center text-base leading-tight font-semibold tracking-tight text-[#111111]">
            목록
          </h1>
          <span className="max-w-[48%] shrink-0 truncate text-right text-xs font-semibold text-[#555555]">
            {displayedCountLabel}
          </span>
        </div>

        {!detailOpen ? (
          <div className="space-y-2 px-5 pb-2">
            <button
              type="button"
              onClick={handleOpenRegionSelect}
              className="border-border bg-background hover:bg-muted/35 focus-visible:ring-ring/50 flex h-11 w-full min-w-0 items-center gap-3 rounded-lg border px-3 text-left transition-colors focus-visible:ring-3 focus-visible:outline-none"
            >
              <MapPin className="text-muted-foreground size-[1.125rem] shrink-0" aria-hidden />
              <span className="text-foreground truncate text-sm font-medium">
                {regionFieldValue}
              </span>
            </button>

            <div ref={filterChromeRef}>
              <FilterBar
                hideTagPanel
                categories={categories}
                categoryNameByCode={categoryNameByCode}
                filterCategories={filterCategories}
                isCategoryLoading={isCategoryLoading}
                isCategoryError={Boolean(isTaxonomyError && apiFilterCategories.length === 0)}
                onRetryLoadCategories={() => {
                  void retryLoad();
                }}
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
          </div>
        ) : null}
      </header>

      <CoursePlannerBottomSheet
        open={isRegionPanelOpen && !detailOpen}
        onClose={() => setIsRegionPanelOpen(false)}
      >
        <RegionSelectionPanel
          selectedCity={draftCity}
          selectedDistrict={draftDistrict}
          onSelectCity={handleSelectDraftCity}
          onSelectDistrict={setDraftDistrict}
          onClose={() => setIsRegionPanelOpen(false)}
          onConfirm={handleConfirmRegion}
        />
      </CoursePlannerBottomSheet>

      {!detailOpen ? (
        <div className="scrollbar-hide relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-3 pb-[max(1rem,calc(env(safe-area-inset-bottom)+5.75rem))]">
          {displayedPlaces.length > 0 ? (
            <div className="space-y-2 pb-2" role="list" aria-label="장소 목록">
              {displayedPlaces.map((place) => (
                <SavedPlaceItem
                  key={place.id}
                  place={place}
                  isMenuOpen={openMenuId === place.id}
                  isEditing={editingPlaceId === place.id}
                  memoDraft={memoDraft}
                  onToggleMenu={(id) => setOpenMenuId((current) => (current === id ? null : id))}
                  onStartMemo={handleStartMemo}
                  onChangeMemo={setMemoDraft}
                  onSaveMemo={handleSaveMemo}
                  onClearMemo={() => setMemoDraft("")}
                  onDelete={handleDeletePlace}
                  onSelect={(p) => openPlaceDetail(p.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-[12rem] flex-col items-center justify-center py-8 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-[#777777] text-white">
                <AlertCircle className="size-5" aria-hidden />
              </span>
              <p className="mt-4 text-sm font-medium text-[#8a8a8a]">{emptyMessage}</p>
            </div>
          )}
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 [&>*]:pointer-events-auto">
        <BottomNavToast message={toastMessage} placement={toastPlacement} />
        <BottomNavigationBar activeId="list" onSelect={handleSelectBottomNav} />
      </div>

      <PlaceDetailSheet />
    </div>
  );
}

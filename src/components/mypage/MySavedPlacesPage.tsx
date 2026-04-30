import "@/components/map/filter-bar.css";

import { AlertCircle, ArrowLeft } from "lucide-react";
import { lazy, Suspense, useMemo, useRef, useState } from "react";

import { FilterBar } from "@/components/map/FilterBar";
import {
  mapPlacesMatchingMySaved,
  weightedMapCenter,
} from "@/components/mypage/map-places-from-my-saved";
import { useMapSearchFilters } from "@/features/map/hooks/use-map-search-filters";
import { usePlaceFilterData } from "@/features/map/hooks/use-place-filter-data";
import { FALLBACK_PLACE_FILTER_DATA } from "@/features/map/lib/fallback-place-filter-data";
import { usePointerDownOutside } from "@/hooks/use-pointer-down-outside";
import { cn } from "@/lib/utils";
import { SAVED_PLACE_MOCKS } from "@/pages/map/map-home-mock";
import { resolveSavedPlacesBusinessHours, useKoreanNow } from "@/shared/lib/place-business-hours";
import {
  MAP_ALL_CATEGORY_FILTER_CHIP,
  type MapPrimaryCategory,
  type SavedPlace as MapSavedPlace,
} from "@/shared/types/map-home";
import { usePlaceDetailStore } from "@/store/placeDetailStore";

import type { SavedPlace } from "./mypage-mock-data";
import { SavedPlaceItem } from "./SavedPlaceItem";

const KAKAO_MAP_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
const KakaoMapView = lazy(() =>
  import("@/components/map/KakaoMapView").then((module) => ({ default: module.KakaoMapView })),
);

const MOCK_BY_ID = new Map(SAVED_PLACE_MOCKS.map((place) => [place.id, place]));

type MySavedPlacesPageProps = {
  places: SavedPlace[];
  onBack: () => void;
  onChangePlaces: (places: SavedPlace[]) => void;
  onSelectPlace: (place: SavedPlace) => void;
};

function formatCount(count: number) {
  return count > 999 ? "999+" : String(count);
}

export function MySavedPlacesPage({
  places,
  onBack,
  onChangePlaces,
  onSelectPlace,
}: MySavedPlacesPageProps) {
  const now = useKoreanNow();
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

  const mergedForFilter = useMemo(
    (): MapSavedPlace[] =>
      places.map((place) => {
        const mock = MOCK_BY_ID.get(place.id);
        return {
          id: place.id,
          name: place.name,
          address: place.address,
          category: place.category,
          tagKeys: place.tagKeys ?? mock?.tagKeys,
          latitude: mock?.latitude ?? 0,
          longitude: mock?.longitude ?? 0,
          reelsUrl: mock?.reelsUrl,
          businessHours: mock?.businessHours,
        };
      }),
    [places],
  );

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
    places: mergedForFilter,
    filterCategories,
    categoriesOnly: true,
  });

  const listPlaces = useMemo(() => {
    const allow = new Set(filteredPlaces.map((place) => place.id));
    return places.filter((place) => allow.has(place.id));
  }, [filteredPlaces, places]);

  const mapPins = useMemo(
    () => resolveSavedPlacesBusinessHours(mapPlacesMatchingMySaved(listPlaces), now),
    [listPlaces, now],
  );

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null);
  const [memoDraft, setMemoDraft] = useState("");

  const detailOpen = usePlaceDetailStore((s) => s.isOpen);
  const selectedPlaceId = usePlaceDetailStore((s) => s.selectedPlaceId);
  const closeDetail = usePlaceDetailStore((s) => s.closeDetail);

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

  const emptyMessage =
    places.length === 0 ? "나의 장소를 저장해보세요!" : "해당하는 장소가 없습니다.";

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
    onChangePlaces(
      places.map((place) =>
        place.id === editingPlaceId ? { ...place, memo: nextMemo || undefined } : place,
      ),
    );
    setEditingPlaceId(null);
    setMemoDraft("");
  };

  const handleDeletePlace = (id: string) => {
    onChangePlaces(places.filter((place) => place.id !== id));
    setOpenMenuId(null);
    if (editingPlaceId === id) {
      setEditingPlaceId(null);
      setMemoDraft("");
    }
  };

  const handleHeaderBack = () => {
    if (detailOpen) {
      closeDetail();
      return;
    }
    onBack();
  };

  const displayedCountLabel =
    listPlaces.length === places.length
      ? `${formatCount(places.length)}개`
      : `${formatCount(listPlaces.length)}개 · 전체 ${formatCount(places.length)}`;

  return (
    <div
      className={cn(
        "relative flex min-h-0 w-full flex-1 flex-col overflow-hidden",
        detailOpen ? "bg-[var(--map-placeholder-bg,#ece8e5)]" : "bg-background",
      )}
    >
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
          <button
            type="button"
            onClick={handleHeaderBack}
            className="touch-target-min -ml-3 flex items-center justify-center rounded-full"
          >
            <ArrowLeft className="size-5 text-[#222222]" aria-hidden />
            <span className="sr-only">
              {detailOpen ? "장소 상세 닫기" : "마이페이지로 돌아가기"}
            </span>
          </button>
          <h1 className="flex-1 text-center text-base leading-tight font-semibold tracking-tight text-[#111111]">
            나의 장소
          </h1>
          <span className="max-w-[48%] truncate text-right text-xs font-semibold text-[#555555]">
            {displayedCountLabel}
          </span>
        </div>

        {!detailOpen ? (
          <div ref={filterChromeRef} className="px-5 pb-2">
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
        ) : null}
      </header>

      {!detailOpen ? (
        <div className="scrollbar-hide relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-3 pb-[max(1rem,calc(env(safe-area-inset-bottom)+5.75rem))]">
          {listPlaces.length > 0 ? (
            <div className="space-y-2 pb-2">
              {listPlaces.map((place) => (
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
                  onSelect={onSelectPlace}
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
    </div>
  );
}

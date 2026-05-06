import "@/components/map/filter-bar.css";

import { AlertCircle, ArrowLeft, MapPin } from "lucide-react";
import { lazy, Suspense, useMemo, useRef, useState } from "react";

import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { BottomNavToast } from "@/components/common/BottomNavToast";
import { EmptyState } from "@/components/common/EmptyState";
import { MapBackdropLayer } from "@/components/common/MapBackdropLayer";
import { CoursePlannerBottomSheet } from "@/components/course-planner/CoursePlannerBottomSheet";
import { RegionSelectionPanel } from "@/components/course-planner/RegionSelectionPanel";
import { FilterBar } from "@/components/map/FilterBar";
import { weightedMapCenter } from "@/components/mypage/map-places-from-my-saved";
import { SavedPlaceItem } from "@/components/mypage/SavedPlaceItem";
import { PlaceDetailSheet } from "@/components/place/PlaceDetailSheet";
import { RoomConfirmModal } from "@/components/room/RoomConfirmModal";
import { useMapSearchFilters } from "@/features/map/hooks/use-map-search-filters";
import { usePlaceFilterViewModel } from "@/features/map/hooks/use-place-filter-view-model";
import {
  REGION_ALL_CODE,
  REGION_ALL_OPTION,
  type RegionSelectionOption,
  useSidosQuery,
  useSigungusQueries,
  useSigungusQuery,
} from "@/features/regions";
import {
  roomPlaceToSavedPlace,
  useDeleteRoomPlace,
  useRoomPlaces,
  useUpdateRoomPlaceMemo,
} from "@/features/room-places";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";
import { usePlaceDetailOpenEvent } from "@/hooks/use-place-detail-open-event";
import { usePointerDownOutside } from "@/hooks/use-pointer-down-outside";
import { cn } from "@/lib/utils";
import { PLACE_LIST_TEXT } from "@/shared/config/text";
import { resolveSavedPlacesBusinessHours, useKoreanNow } from "@/shared/lib/place-business-hours";
import type { SavedPlace } from "@/shared/types/map-home";
import type { SavedPlace as MySavedPlace } from "@/shared/types/my-page";
import { usePlaceDetailStore } from "@/store/place-detail-store";
import { useRoomSelectionStore } from "@/store/room-selection-store";

const KAKAO_MAP_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
const KakaoMapView = lazy(() =>
  import("@/components/map/KakaoMapView").then((module) => ({ default: module.KakaoMapView })),
);

function formatCount(count: number) {
  return count > 999 ? "999+" : String(count);
}

export default function PlaceListPage() {
  const now = useKoreanNow();
  const { toastMessage, toastPlacement, handleSelectBottomNav } = useBottomNavController();
  const selectedRoom = useRoomSelectionStore((state) => state.selectedRoom);
  const [selectedSido, setSelectedSido] = useState<RegionSelectionOption>(REGION_ALL_OPTION);
  const [selectedSigungu, setSelectedSigungu] = useState<RegionSelectionOption>(REGION_ALL_OPTION);
  const [draftSido, setDraftSido] = useState<RegionSelectionOption>(REGION_ALL_OPTION);
  const [draftSigungu, setDraftSigungu] = useState<RegionSelectionOption>(REGION_ALL_OPTION);
  const [regionSearchKeyword, setRegionSearchKeyword] = useState("");
  const [isRegionPanelOpen, setIsRegionPanelOpen] = useState(false);
  const roomPlaceListParams = useMemo(() => {
    const hasSido = selectedSido.code !== REGION_ALL_CODE;
    const hasSigungu = hasSido && selectedSigungu.code !== REGION_ALL_CODE;

    return {
      page: 0,
      size: 20,
      ...(hasSido ? { sidoCode: selectedSido.code } : {}),
      ...(hasSigungu ? { sigunguCode: selectedSigungu.code } : {}),
    };
  }, [selectedSido.code, selectedSigungu.code]);
  const roomPlacesQuery = useRoomPlaces({
    roomId: selectedRoom?.id ?? null,
    params: roomPlaceListParams,
  });
  const sidosQuery = useSidosQuery();
  const sigungusQuery = useSigungusQuery({
    sidoCode: draftSido.code,
    enabled: isRegionPanelOpen,
  });
  const searchableSidoOptions = useMemo(
    () => sidosQuery.data?.filter((sido) => sido.code !== REGION_ALL_CODE) ?? [],
    [sidosQuery.data],
  );
  const isRegionSearching = regionSearchKeyword.trim().length > 0;
  const allSigungusQueries = useSigungusQueries({
    sidoCodes: searchableSidoOptions.map((sido) => sido.code),
    enabled: isRegionPanelOpen && isRegionSearching,
  });
  const updateRoomPlaceMemoMutation = useUpdateRoomPlaceMemo({
    roomId: selectedRoom?.id ?? null,
  });
  const deleteRoomPlaceMutation = useDeleteRoomPlace({
    roomId: selectedRoom?.id ?? null,
  });

  const resolvedPlaces = useMemo(
    () =>
      resolveSavedPlacesBusinessHours(
        (roomPlacesQuery.data?.items ?? []).map(roomPlaceToSavedPlace),
        now,
      ),
    [now, roomPlacesQuery.data?.items],
  );

  const {
    filterCategories,
    categories,
    categoryNameByCode,
    isCategoryLoading,
    isCategoryError,
    retryLoad,
  } = usePlaceFilterViewModel();

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

  const sidoOptions = sidosQuery.data?.length ? sidosQuery.data : [REGION_ALL_OPTION];
  const allSigunguOptions = useMemo((): RegionSelectionOption[] => {
    return allSigungusQueries.flatMap((query, index) => {
      const parentSido = searchableSidoOptions[index];
      if (!parentSido || !query.data) {
        return [];
      }

      return query.data
        .filter((sigungu) => sigungu.code !== REGION_ALL_CODE)
        .map((sigungu) => ({
          code: sigungu.code,
          name: sigungu.name,
          displayName: `${parentSido.name} ${sigungu.name}`,
          parentSidoCode: parentSido.code,
          parentSidoName: parentSido.name,
        }));
    });
  }, [allSigungusQueries, searchableSidoOptions]);
  const sigunguOptions = isRegionSearching
    ? allSigunguOptions
    : draftSido.code === REGION_ALL_CODE
      ? [REGION_ALL_OPTION]
      : sigungusQuery.data?.length
        ? sigungusQuery.data
        : [REGION_ALL_OPTION];
  const isAllSigunguSearchLoading =
    isRegionSearching &&
    allSigungusQueries.some((query) => query.isLoading || query.isFetching) &&
    allSigunguOptions.length === 0;
  const isAllSigunguSearchError =
    isRegionSearching &&
    allSigungusQueries.length > 0 &&
    allSigungusQueries.every((query) => query.isError);

  const categoryFilteredPlaces = filteredPlaces;

  const listPlacesBase = useMemo((): SavedPlace[] => {
    return categoryFilteredPlaces.map((place) => ({
      id: place.id,
      name: place.name,
      address: place.address,
      category: place.category,
      tagKeys: place.tagKeys,
      latitude: place.latitude,
      longitude: place.longitude,
      shareLinkUrl: place.shareLinkUrl,
      memo: place.memo,
    }));
  }, [categoryFilteredPlaces]);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null);
  const [memoDraft, setMemoDraft] = useState("");
  const [pendingDeletePlaceId, setPendingDeletePlaceId] = useState<string | null>(null);

  const displayedPlaces = listPlacesBase;

  const mapPins = useMemo(
    () => resolveSavedPlacesBusinessHours(displayedPlaces, now),
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
    selectedSido.code === REGION_ALL_CODE
      ? REGION_ALL_OPTION.name
      : selectedSigungu.code === REGION_ALL_CODE
        ? selectedSido.name
        : `${selectedSido.name} ${selectedSigungu.name}`;

  const handleOpenRegionSelect = () => {
    closeTagPanel();
    setDraftSido(selectedSido);
    setDraftSigungu(selectedSigungu);
    setRegionSearchKeyword("");
    setIsRegionPanelOpen(true);
  };

  const handleSelectDraftSido = (sidoName: string, option?: RegionSelectionOption) => {
    setDraftSido(option ?? { code: sidoName, name: sidoName });
    setDraftSigungu(REGION_ALL_OPTION);
  };

  const handleSelectDraftSigungu = (sigunguName: string, option?: RegionSelectionOption) => {
    if (option?.parentSidoCode && option.parentSidoName) {
      setDraftSido({ code: option.parentSidoCode, name: option.parentSidoName });
      setDraftSigungu({ code: option.code, name: option.name });
      return;
    }

    setDraftSigungu(option ?? { code: sigunguName, name: sigunguName });
  };

  const handleConfirmRegion = () => {
    if (draftSido.code === REGION_ALL_CODE) {
      setSelectedSido(REGION_ALL_OPTION);
      setSelectedSigungu(REGION_ALL_OPTION);
      setIsRegionPanelOpen(false);
      return;
    }

    setSelectedSido(draftSido);
    setSelectedSigungu(draftSigungu);
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

  const hasRegionFilter = selectedSido.code !== REGION_ALL_CODE;
  const emptyMessage = roomPlacesQuery.isError
    ? "장소 목록을 불러오지 못했어요."
    : roomPlacesQuery.isLoading
      ? "장소 목록을 불러오는 중이에요."
      : resolvedPlaces.length === 0 && !hasRegionFilter
        ? PLACE_LIST_TEXT.emptySaved
        : PLACE_LIST_TEXT.emptyFiltered;

  const handleHeaderBack = () => {
    if (detailOpen) {
      closeDetail();
    }
  };

  const handleStartMemo = (place: MySavedPlace) => {
    setOpenMenuId(null);
    setEditingPlaceId(place.id);
    setMemoDraft(place.memo ?? "");
  };

  const handleSavePlaceMemo = (id: string, memo: string) => {
    const roomPlaceId = Number(id);
    if (!Number.isFinite(roomPlaceId)) {
      return;
    }

    updateRoomPlaceMemoMutation.mutate({
      roomPlaceId,
      payload: { memo: memo.trim() },
    });
  };

  const handleSaveMemo = () => {
    if (!editingPlaceId) {
      return;
    }

    handleSavePlaceMemo(editingPlaceId, memoDraft);
    setEditingPlaceId(null);
    setMemoDraft("");
  };

  const handleDeletePlace = (id: string) => {
    const roomPlaceId = Number(id);
    if (Number.isFinite(roomPlaceId)) {
      deleteRoomPlaceMutation.mutate(roomPlaceId);
    }
    setOpenMenuId(null);
    if (editingPlaceId === id) {
      setEditingPlaceId(null);
      setMemoDraft("");
    }
    if (selectedPlaceId === id) {
      closeDetail();
    }
  };

  const handleRequestDeletePlace = (id: string) => {
    setOpenMenuId(null);
    setPendingDeletePlaceId(id);
  };

  const handleConfirmDeletePlace = () => {
    if (!pendingDeletePlaceId) {
      return;
    }

    handleDeletePlace(pendingDeletePlaceId);
    setPendingDeletePlaceId(null);
  };

  return (
    <div className="room-no-caret -m-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {detailOpen ? (
        <MapBackdropLayer>
          <Suspense fallback={<div className="bg-map-placeholder-bg h-full w-full" aria-hidden />}>
            <KakaoMapView
              appKey={KAKAO_MAP_APP_KEY}
              places={mapPins}
              center={mapCenter}
              className="h-full w-full"
            />
          </Suspense>
        </MapBackdropLayer>
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
                isCategoryError={isCategoryError}
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
          selectedCity={draftSido.name}
          selectedDistrict={draftSigungu.name}
          cityOptions={sidoOptions}
          districtOptions={sigunguOptions}
          isCityLoading={sidosQuery.isLoading}
          isDistrictLoading={
            isAllSigunguSearchLoading ||
            (!isRegionSearching && draftSido.code !== REGION_ALL_CODE && sigungusQuery.isLoading)
          }
          cityErrorMessage={sidosQuery.isError ? "지역 정보를 불러오지 못했어요." : null}
          districtErrorMessage={
            isAllSigunguSearchError
              ? "시/군/구 정보를 확인할 수 없어요."
              : !isRegionSearching && draftSido.code !== REGION_ALL_CODE && sigungusQuery.isError
                ? "시/군/구 정보를 확인할 수 없어요."
                : null
          }
          searchKeyword={regionSearchKeyword}
          onSearchKeywordChange={setRegionSearchKeyword}
          onSelectCity={handleSelectDraftSido}
          onSelectDistrict={handleSelectDraftSigungu}
          onClose={() => {
            setRegionSearchKeyword("");
            setIsRegionPanelOpen(false);
          }}
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
                  onDelete={handleRequestDeletePlace}
                  onSelect={(p) => openPlaceDetail(p.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<AlertCircle className="size-5" aria-hidden />}
              message={emptyMessage}
            />
          )}
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 [&>*]:pointer-events-auto">
        <BottomNavToast message={toastMessage} placement={toastPlacement} />
        <BottomNavigationBar activeId="list" onSelect={handleSelectBottomNav} />
      </div>

      <PlaceDetailSheet
        savedPlaces={displayedPlaces}
        onSaveMemo={handleSavePlaceMemo}
        onDeletePlace={handleDeletePlace}
      />

      <RoomConfirmModal
        open={pendingDeletePlaceId != null}
        message="이 장소를 삭제할까요?"
        description="삭제하면 목록에서 더 이상 보이지 않아요."
        cancelLabel="취소"
        confirmLabel="삭제"
        confirmButtonClassName="text-[var(--brand-coral-solid)]"
        onCancel={() => setPendingDeletePlaceId(null)}
        onConfirm={handleConfirmDeletePlace}
      />
    </div>
  );
}

import "@/components/map/filter-bar.css";

import { MapPin } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { BottomNavToast } from "@/components/common/BottomNavToast";
import { LIST_TOP_BAR_AFTER_TITLE_CLASS, ListTopBar } from "@/components/common/ListTopBar";
import { MapBackdropLayer } from "@/components/common/MapBackdropLayer";
import { CoursePlannerBottomSheet } from "@/components/course-planner/CoursePlannerBottomSheet";
import { RegionSelectionPanel } from "@/components/course-planner/RegionSelectionPanel";
import { FilterBar } from "@/components/map/FilterBar";
import { weightedMapCenter } from "@/components/mypage/map-places-from-my-saved";
import { SavedPlaceItem } from "@/components/mypage/SavedPlaceItem";
import { PlaceDetailSheet } from "@/components/place/PlaceDetailSheet";
import { PlaceUsedInDateCourseAlertModal } from "@/components/place/PlaceUsedInDateCourseAlertModal";
import { PlaceListSavedCoursesPage } from "@/components/place-list/PlaceListSavedCoursesPage";
import { RoomConfirmModal } from "@/components/room/RoomConfirmModal";
import { BrandMarkerLoader } from "@/components/ui/BrandMarkerLoader";
import { useMapSearchFilters } from "@/features/map/hooks/use-map-search-filters";
import { usePlaceFilterViewModel } from "@/features/map/hooks/use-place-filter-view-model";
import {
  REGION_ALL_CODE,
  REGION_ALL_OPTION,
  type RegionSelectionOption,
  toRegionSelectionOption,
  useSidosQuery,
  useSigungusQueries,
  useSigungusQuery,
} from "@/features/regions";
import { useRoomDetailQuery } from "@/features/room";
import {
  roomPlaceToSavedPlace,
  useDeleteRoomPlace,
  useRoomPlaces,
  useUpdateRoomPlaceMemo,
} from "@/features/room-places";
import { useBottomNavController } from "@/hooks/use-bottom-nav-controller";
import { useInfiniteScrollTrigger } from "@/hooks/use-infinite-scroll-trigger";
import { usePlaceDetailOpenEvent } from "@/hooks/use-place-detail-open-event";
import { usePlaceUsedInDateCourseAlert } from "@/hooks/use-place-used-in-date-course-alert";
import { usePointerDownOutside } from "@/hooks/use-pointer-down-outside";
import { cn } from "@/lib/utils";
import { APP_ROUTES } from "@/shared/config/routes";
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
  const navigate = useNavigate();
  const { roomId: routeRoomId } = useParams<{ roomId?: string }>();
  const { toastMessage, toastPlacement, handleSelectBottomNav, showToast } =
    useBottomNavController();
  const {
    open: isUsedInDateCourseAlertOpen,
    close: closeUsedInDateCourseAlert,
    handleDeleteError: handlePlaceDeleteError,
  } = usePlaceUsedInDateCourseAlert();
  const selectedRoom = useRoomSelectionStore((state) => state.selectedRoom);
  const selectRoom = useRoomSelectionStore((state) => state.selectRoom);
  const effectiveRoomId = routeRoomId ?? selectedRoom?.id ?? null;
  const roomDetailQuery = useRoomDetailQuery(effectiveRoomId, {
    enabled: Boolean(routeRoomId) && selectedRoom?.id !== routeRoomId,
  });
  const [selectedSido, setSelectedSido] = useState<RegionSelectionOption>(REGION_ALL_OPTION);
  const [selectedSigungu, setSelectedSigungu] = useState<RegionSelectionOption>(REGION_ALL_OPTION);
  const [draftSido, setDraftSido] = useState<RegionSelectionOption>(REGION_ALL_OPTION);
  const [draftSigungu, setDraftSigungu] = useState<RegionSelectionOption>(REGION_ALL_OPTION);
  const [regionSearchKeyword, setRegionSearchKeyword] = useState("");
  const [isRegionPanelOpen, setIsRegionPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"places" | "courses">("places");
  const roomPlaceListParams = useMemo(() => {
    const hasSido = selectedSido.code !== REGION_ALL_CODE;
    const hasSigungu = hasSido && selectedSigungu.code !== REGION_ALL_CODE;

    return {
      limit: 20,
      ...(hasSido ? { sidoCode: selectedSido.code } : {}),
      ...(hasSigungu ? { sigunguCode: selectedSigungu.code } : {}),
    };
  }, [selectedSido.code, selectedSigungu.code]);
  const roomPlacesQuery = useRoomPlaces({
    roomId: effectiveRoomId,
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
    roomId: effectiveRoomId,
  });
  const deleteRoomPlaceMutation = useDeleteRoomPlace({
    roomId: effectiveRoomId,
  });

  useEffect(() => {
    const roomDetail = roomDetailQuery.data;
    if (!roomDetail || selectedRoom?.id === roomDetail.roomId) {
      return;
    }

    selectRoom({
      id: roomDetail.roomId,
      name: roomDetail.roomName,
      avatarSeed: roomDetail.avatarSeed,
      memberCount: roomDetail.memberCount,
    });
  }, [roomDetailQuery.data, selectRoom, selectedRoom?.id]);

  const resolvedPlaces = useMemo(
    () =>
      (roomPlacesQuery.data?.pages ?? []).flatMap((page) => page.items.map(roomPlaceToSavedPlace)),
    [roomPlacesQuery.data?.pages],
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

  const sidoOptions = useMemo(
    () =>
      sidosQuery.data?.length ? sidosQuery.data.map(toRegionSelectionOption) : [REGION_ALL_OPTION],
    [sidosQuery.data],
  );
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
  const sigunguOptions = useMemo<RegionSelectionOption[]>(() => {
    if (isRegionSearching) {
      return allSigunguOptions;
    }

    if (draftSido.code === REGION_ALL_CODE) {
      return [REGION_ALL_OPTION];
    }

    return sigungusQuery.data?.length
      ? sigungusQuery.data.map(toRegionSelectionOption)
      : [REGION_ALL_OPTION];
  }, [allSigunguOptions, draftSido.code, isRegionSearching, sigungusQuery.data]);
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
      categoryName: place.categoryName,
      tagKeys: place.tagKeys,
      tagNames: place.tagNames,
      latitude: place.latitude,
      longitude: place.longitude,
      shareLinkUrl: place.shareLinkUrl,
      addedVia: place.addedVia,
      linkSourceType: place.linkSourceType,
      memo: place.memo,
      memos: place.memos,
      businessHours: place.businessHours,
    }));
  }, [categoryFilteredPlaces]);

  const savedPlacesForCourses = useMemo(
    () =>
      listPlacesBase.map((place) => ({
        id: place.id,
        name: place.name,
        address: place.address,
        category: place.category,
        shareLinkUrl: place.shareLinkUrl,
        roomId: effectiveRoomId ?? undefined,
        memo: place.memo,
        memos: place.memos,
      })),
    [effectiveRoomId, listPlacesBase],
  );

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null);
  const [memoDraft, setMemoDraft] = useState("");
  const [pendingDeletePlaceId, setPendingDeletePlaceId] = useState<string | null>(null);

  const displayedPlaces = listPlacesBase;

  const mapPins = displayedPlaces;

  const detailOpen = usePlaceDetailStore((s) => s.isOpen);
  const selectedPlaceId = usePlaceDetailStore((s) => s.selectedPlaceId);
  const closeDetail = usePlaceDetailStore((s) => s.closeDetail);
  const openPlaceDetail = usePlaceDetailStore((s) => s.openDetail);

  usePlaceDetailOpenEvent(true);

  const filterChromeRef = useRef<HTMLDivElement>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const loadMorePlacesRef = useInfiniteScrollTrigger({
    enabled:
      !detailOpen &&
      roomPlacesQuery.hasNextPage &&
      !roomPlacesQuery.isFetching &&
      !roomPlacesQuery.isFetchingNextPage,
    rootRef: listScrollRef,
    onLoadMore: () => {
      void roomPlacesQuery.fetchNextPage();
    },
  });
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

  const firstRoomPlacePage = roomPlacesQuery.data?.pages[0] ?? null;
  const totalPlaceCount = firstRoomPlacePage
    ? firstRoomPlacePage.roomPlaceTotalCount
    : displayedPlaces.length;
  const displayedCountLabel = `${formatCount(totalPlaceCount)}개`;
  const roomName =
    selectedRoom?.id === effectiveRoomId ? selectedRoom.name : roomDetailQuery.data?.roomName;
  const pageTitle = roomName;

  if (activeTab === "courses") {
    return (
      <PlaceListSavedCoursesPage
        roomId={effectiveRoomId}
        roomName={roomName}
        savedPlaces={savedPlacesForCourses}
        toastMessage={toastMessage}
        toastPlacement={toastPlacement}
        onShowToast={showToast}
        onSelectBottomNav={handleSelectBottomNav}
        onBackToMap={() => navigate(APP_ROUTES.map)}
        onSwitchTab={setActiveTab}
      />
    );
  }

  const hasRegionFilter = selectedSido.code !== REGION_ALL_CODE;
  const emptyTitle =
    resolvedPlaces.length === 0 && !hasRegionFilter
      ? "아직 저장한 장소가 없어요"
      : "조건에 맞는 장소가 없어요";
  const emptyDescription =
    resolvedPlaces.length === 0 && !hasRegionFilter
      ? "마음에 드는 장소를 저장해보세요!"
      : "필터를 바꾸면 저장해둔 다른 장소를 볼 수 있어요";

  const handleHeaderBack = () => {
    if (detailOpen) {
      closeDetail();
      return;
    }

    navigate(APP_ROUTES.map);
  };

  const handleStartMemo = (place: MySavedPlace) => {
    setOpenMenuId(null);
    setEditingPlaceId(place.id);
    setMemoDraft(place.memo ?? "");
  };

  const findRoomPlaceId = (id: string): number | null => {
    const place = displayedPlaces.find((item) => item.id === id);
    if (typeof place?.roomPlaceId === "number") {
      return place.roomPlaceId;
    }

    const parsed = Number(id);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const handleSavePlaceMemo = (id: string, memo: string) => {
    const roomPlaceId = findRoomPlaceId(id);
    if (roomPlaceId == null) {
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

  const handleDeletePlace = async (id: string): Promise<boolean> => {
    const roomPlaceId = findRoomPlaceId(id);
    if (roomPlaceId == null) {
      return false;
    }

    try {
      await deleteRoomPlaceMutation.mutateAsync(roomPlaceId);
    } catch (error) {
      if (handlePlaceDeleteError(error)) {
        return false;
      }
      console.error("Failed to delete room place", error);
      return false;
    }

    setOpenMenuId(null);
    if (editingPlaceId === id) {
      setEditingPlaceId(null);
      setMemoDraft("");
    }
    if (selectedPlaceId === id) {
      closeDetail();
    }

    return true;
  };

  const handleRequestDeletePlace = (id: string) => {
    setOpenMenuId(null);
    setPendingDeletePlaceId(id);
  };

  const handleConfirmDeletePlace = () => {
    if (!pendingDeletePlaceId) {
      return;
    }

    const placeId = pendingDeletePlaceId;
    const roomPlaceId = findRoomPlaceId(placeId);
    if (roomPlaceId == null) {
      setPendingDeletePlaceId(null);
      return;
    }

    deleteRoomPlaceMutation.mutate(roomPlaceId, {
      onSuccess: () => {
        setOpenMenuId(null);
        if (editingPlaceId === placeId) {
          setEditingPlaceId(null);
          setMemoDraft("");
        }
        if (selectedPlaceId === placeId) {
          closeDetail();
        }
      },
      onError: (error) => {
        handlePlaceDeleteError(error);
      },
      onSettled: () => {
        setPendingDeletePlaceId(null);
      },
    });
  };

  return (
    <div className="room-no-caret -m-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
      {detailOpen ? (
        <MapBackdropLayer>
          <Suspense fallback={<div className="bg-muted h-full w-full" aria-hidden />}>
            <KakaoMapView
              appKey={KAKAO_MAP_APP_KEY}
              places={mapPins}
              center={mapCenter}
              className="h-full w-full"
            />
          </Suspense>
        </MapBackdropLayer>
      ) : null}

      <ListTopBar
        title={pageTitle}
        trailing={displayedCountLabel}
        variant={detailOpen ? "overlay" : "sticky"}
        backLabel={detailOpen ? "장소 상세 닫기" : "지도 화면으로 돌아가기"}
        onBack={handleHeaderBack}
      >
        {!detailOpen ? (
          <div className={cn(LIST_TOP_BAR_AFTER_TITLE_CLASS, "space-y-3")}>
            <div className="grid grid-cols-2 border-b border-[#ececec]">
              <button
                type="button"
                className="border-b-2 border-[#f38c86] pb-2 text-center text-sm font-semibold text-[#f38c86]"
              >
                장소 목록
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("courses")}
                className="border-l border-[#ececec] pb-2 text-center text-sm font-medium text-[#b3b3b3]"
              >
                저장된 데이트 코스
              </button>
            </div>

            <button
              type="button"
              onClick={handleOpenRegionSelect}
              className="border-border bg-background hover:bg-muted/35 focus-visible:ring-ring/50 flex h-11 w-full min-w-0 items-center gap-3 rounded-lg border px-3 text-left transition-colors focus-visible:ring-3 focus-visible:outline-none"
            >
              <MapPin className="text-muted-foreground size-4.5 shrink-0" aria-hidden />
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
      </ListTopBar>

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
          cityErrorMessage={sidosQuery.isError ? "지역 정보를 불러오지 못했어요" : null}
          districtErrorMessage={
            isAllSigunguSearchError
              ? "시/군/구 정보를 확인할 수 없어요"
              : !isRegionSearching && draftSido.code !== REGION_ALL_CODE && sigungusQuery.isError
                ? "시/군/구 정보를 확인할 수 없어요"
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
        <div
          ref={listScrollRef}
          className="scrollbar-hide relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-3 pb-[max(1rem,calc(var(--inset-bottom)+5.75rem))]"
        >
          {roomPlacesQuery.isLoading ? (
            <PlaceListSkeleton />
          ) : displayedPlaces.length > 0 ? (
            <div className="space-y-2 pb-2" role="list" aria-label="장소 목록">
              {displayedPlaces.map((place) => (
                <SavedPlaceItem
                  key={place.id}
                  place={place}
                  categoryNameByCode={categoryNameByCode}
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
              <div ref={loadMorePlacesRef} className="h-1" aria-hidden />
              {roomPlacesQuery.isFetchingNextPage ? (
                <div className="flex justify-center px-5 py-6">
                  <BrandMarkerLoader />
                </div>
              ) : null}
            </div>
          ) : roomPlacesQuery.isError ? (
            <PlaceListState
              title="장소 목록을 불러오지 못했어요"
              description="잠시 뒤에 다시 확인해주세요"
            />
          ) : (
            <PlaceListState title={emptyTitle} description={emptyDescription} />
          )}
        </div>
      ) : null}

      <div className="android-keyboard-lift pointer-events-none absolute inset-x-0 bottom-0 z-30 *:pointer-events-auto">
        <BottomNavToast message={toastMessage} placement={toastPlacement} />
        <BottomNavigationBar activeId="map" onSelect={handleSelectBottomNav} />
      </div>

      <PlaceDetailSheet
        roomId={effectiveRoomId}
        onSaveMemo={handleSavePlaceMemo}
        onDeletePlace={handleDeletePlace}
      />

      <RoomConfirmModal
        open={pendingDeletePlaceId != null}
        message="이 장소를 삭제할까요?"
        description="삭제하면 목록에서 더 이상 보이지 않아요"
        cancelLabel="취소"
        confirmLabel="삭제"
        historyStateKey="placeListDeleteConfirm"
        confirmButtonClassName="text-primary"
        onCancel={() => setPendingDeletePlaceId(null)}
        onConfirm={handleConfirmDeletePlace}
      />

      <PlaceUsedInDateCourseAlertModal
        open={isUsedInDateCourseAlertOpen}
        className="z-95"
        historyStateKey="placeListUsedInDateCourseAlert"
        onClose={closeUsedInDateCourseAlert}
      />
    </div>
  );
}

function PlaceListSkeleton() {
  return (
    <div className="space-y-3 pb-2" aria-label="장소 목록을 불러오는 중">
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={`room-place-skeleton-${index}`}
          className="bg-card rounded-[1.15rem] px-3.5 py-3.5 shadow-[0_8px_24px_rgba(15,23,42,0.035)]"
        >
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="bg-muted/70 h-4 w-[42%] animate-pulse rounded-md" />
                <div className="bg-muted/60 size-6 animate-pulse rounded-full" />
                <div className="bg-muted/50 h-3 w-10 animate-pulse rounded-md" />
              </div>
              <div className="bg-muted/55 h-3.5 w-[72%] animate-pulse rounded-md" />
            </div>
            <div className="bg-muted/50 size-9 shrink-0 animate-pulse rounded-full" />
          </div>
          <div className="mt-3 flex gap-1.5">
            <div className="bg-muted/45 h-6 w-16 animate-pulse rounded-full" />
            <div className="bg-muted/40 h-6 w-20 animate-pulse rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function PlaceListState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center px-5 py-10 text-center">
      <p className="text-foreground text-sm font-semibold">{title}</p>
      <p className="text-muted-foreground mt-1.5 max-w-64 text-xs leading-relaxed font-medium">
        {description}
      </p>
    </div>
  );
}

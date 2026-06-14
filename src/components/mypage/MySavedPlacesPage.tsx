import "@/components/map/filter-bar.css";

import { lazy, Suspense, useMemo, useRef, useState } from "react";

import { LIST_TOP_BAR_AFTER_TITLE_CLASS, ListTopBar } from "@/components/common/ListTopBar";
import { MapBackdropLayer } from "@/components/common/MapBackdropLayer";
import { FilterBar } from "@/components/map/FilterBar";
import {
  mapPlacesMatchingMySaved,
  weightedMapCenter,
} from "@/components/mypage/map-places-from-my-saved";
import { MAX_MEMO_LENGTH } from "@/components/mypage/SavedPlaceMemoEditor";
import { PlaceUsedInDateCourseAlertModal } from "@/components/place/PlaceUsedInDateCourseAlertModal";
import { RoomConfirmModal } from "@/components/room/RoomConfirmModal";
import { useMapSearchFilters } from "@/features/map/hooks/use-map-search-filters";
import { usePlaceFilterViewModel } from "@/features/map/hooks/use-place-filter-view-model";
import { useMyPlacesQuery, userPlaceToSavedPlace } from "@/features/users";
import { useInfiniteScrollTrigger } from "@/hooks/use-infinite-scroll-trigger";
import { usePlaceUsedInDateCourseAlert } from "@/hooks/use-place-used-in-date-course-alert";
import { usePointerDownOutside } from "@/hooks/use-pointer-down-outside";
import { cn } from "@/lib/utils";
import type { ServiceCategoryCode } from "@/shared/types/map-home";
import type { SavedPlace } from "@/shared/types/my-page";
import { usePlaceDetailStore } from "@/store/place-detail-store";

import { SavedPlaceItem } from "./SavedPlaceItem";
import { useSavedPlaceActions } from "./use-saved-place-actions";

const KAKAO_MAP_APP_KEY = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
const KakaoMapView = lazy(() =>
  import("@/components/map/KakaoMapView").then((module) => ({ default: module.KakaoMapView })),
);

type MySavedPlacesPageProps = {
  onBack: () => void;
  onSelectPlace: (place: SavedPlace) => void;
};

function formatCount(count: number) {
  return count > 999 ? "999+" : String(count);
}

function toApiCategory(category: string | undefined): ServiceCategoryCode | undefined {
  if (category === "FOOD" || category === "CAFE" || category === "ACTIVITY") return category;
  return undefined;
}

export function MySavedPlacesPage({ onBack, onSelectPlace }: MySavedPlacesPageProps) {
  const {
    open: isUsedInDateCourseAlertOpen,
    close: closeUsedInDateCourseAlert,
    handleDeleteError: handlePlaceDeleteError,
  } = usePlaceUsedInDateCourseAlert();
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
  } = useMapSearchFilters({
    places: [],
    filterCategories,
    categoriesOnly: true,
  });

  const selectedApiCategory = toApiCategory(activeCategories[0]);
  const myPlacesQuery = useMyPlacesQuery({
    params: {
      category: selectedApiCategory,
      limit: 20,
    },
  });

  const apiPlaces = useMemo(
    () =>
      (myPlacesQuery.data?.pages ?? []).flatMap((page) => page.items.map(userPlaceToSavedPlace)),
    [myPlacesQuery.data?.pages],
  );

  const listPlaces = apiPlaces;

  const mapPins = useMemo(() => mapPlacesMatchingMySaved(listPlaces), [listPlaces]);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null);
  const [memoDraft, setMemoDraft] = useState("");
  const [pendingDeletePlaceId, setPendingDeletePlaceId] = useState<string | null>(null);
  const { resolveMutationTarget, updateMemoMutation, deletePlaceMutation } =
    useSavedPlaceActions(listPlaces);

  const detailOpen = usePlaceDetailStore((s) => s.isOpen);
  const selectedPlaceId = usePlaceDetailStore((s) => s.selectedPlaceId);
  const closeDetail = usePlaceDetailStore((s) => s.closeDetail);

  const filterChromeRef = useRef<HTMLDivElement>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const loadMorePlacesRef = useInfiniteScrollTrigger({
    enabled:
      !detailOpen &&
      myPlacesQuery.hasNextPage &&
      !myPlacesQuery.isFetching &&
      !myPlacesQuery.isFetchingNextPage,
    rootRef: listScrollRef,
    onLoadMore: () => {
      void myPlacesQuery.fetchNextPage();
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

  const isInitialPlacesLoading = myPlacesQuery.isLoading && myPlacesQuery.data == null;
  const emptyTitle =
    activeCategories.length === 0 ? "아직 저장한 장소가 없어요" : "조건에 맞는 장소가 없어요";
  const emptyDescription =
    activeCategories.length === 0
      ? "마음에 드는 장소를 저장해보세요!"
      : "필터를 바꾸면 저장해둔 다른 장소를 볼 수 있어요";

  const handleStartMemo = (place: SavedPlace) => {
    setOpenMenuId(null);
    setEditingPlaceId(place.id);
    setMemoDraft((place.memo ?? "").slice(0, MAX_MEMO_LENGTH));
  };

  const handleSaveMemo = () => {
    if (!editingPlaceId) {
      return;
    }

    const target = resolveMutationTarget(editingPlaceId);
    if (!target) {
      return;
    }

    const nextMemo = memoDraft.trim().slice(0, MAX_MEMO_LENGTH);
    updateMemoMutation.mutate(
      { ...target, memo: nextMemo },
      {
        onSuccess: () => {
          setEditingPlaceId(null);
          setMemoDraft("");
        },
      },
    );
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
    const target = resolveMutationTarget(placeId);
    if (!target) {
      setPendingDeletePlaceId(null);
      return;
    }

    deletePlaceMutation.mutate(
      { roomId: target.roomId, roomPlaceId: target.roomPlaceId },
      {
        onSuccess: () => {
          if (editingPlaceId === placeId) {
            setEditingPlaceId(null);
            setMemoDraft("");
          }
        },
        onError: (error) => {
          handlePlaceDeleteError(error);
        },
        onSettled: () => {
          setPendingDeletePlaceId(null);
        },
      },
    );
  };

  const handleHeaderBack = () => {
    if (detailOpen) {
      closeDetail();
      return;
    }
    onBack();
  };

  const totalPlaceCount = myPlacesQuery.data?.pages[0]?.totalCount ?? listPlaces.length;
  const displayedCountLabel =
    myPlacesQuery.isLoading && myPlacesQuery.data == null ? (
      <span
        className="bg-muted/70 inline-block h-3.5 w-8 animate-pulse rounded-md align-middle"
        aria-label="나의 장소 개수 불러오는 중"
      />
    ) : myPlacesQuery.data != null ? (
      `${formatCount(totalPlaceCount)}개`
    ) : (
      `${formatCount(totalPlaceCount)}개`
    );

  return (
    <div
      className={cn(
        "relative flex min-h-0 w-full flex-1 flex-col overflow-hidden",
        detailOpen ? "bg-muted" : "bg-background",
      )}
    >
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
        title="나의 장소"
        trailing={displayedCountLabel}
        variant={detailOpen ? "overlay" : "sticky"}
        backLabel={detailOpen ? "장소 상세 닫기" : "마이페이지로 돌아가기"}
        onBack={handleHeaderBack}
      >
        {!detailOpen ? (
          <div ref={filterChromeRef} className={LIST_TOP_BAR_AFTER_TITLE_CLASS}>
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
        ) : null}
      </ListTopBar>

      {!detailOpen ? (
        <div
          ref={listScrollRef}
          className="scrollbar-hide relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-3 pb-[max(1rem,calc(env(safe-area-inset-bottom)+5.75rem))]"
        >
          {isInitialPlacesLoading ? (
            <SavedPlaceListSkeleton />
          ) : !myPlacesQuery.isError && listPlaces.length > 0 ? (
            <div className="space-y-3 pb-2">
              {listPlaces.map((place) => (
                <SavedPlaceItem
                  key={place.roomPlaceId ?? place.id}
                  place={place}
                  categoryNameByCode={categoryNameByCode}
                  isMenuOpen={openMenuId === place.id}
                  isEditing={editingPlaceId === place.id}
                  memoDraft={memoDraft}
                  onToggleMenu={(id) => setOpenMenuId((current) => (current === id ? null : id))}
                  onStartMemo={handleStartMemo}
                  onChangeMemo={(value) => setMemoDraft(value.slice(0, MAX_MEMO_LENGTH))}
                  onSaveMemo={handleSaveMemo}
                  onClearMemo={() => setMemoDraft("")}
                  onDelete={handleRequestDeletePlace}
                  onSelect={onSelectPlace}
                />
              ))}
              <div ref={loadMorePlacesRef} className="h-1" aria-hidden />
              {myPlacesQuery.isFetchingNextPage ? (
                <div className="flex justify-center px-5 py-6">
                  <span className="bg-muted/70 h-8 w-8 animate-pulse rounded-full" />
                </div>
              ) : null}
            </div>
          ) : myPlacesQuery.isError ? (
            <SavedListState
              title="장소를 불러오지 못했어요"
              description="잠시 뒤에 다시 확인해주세요"
            />
          ) : (
            <SavedListState title={emptyTitle} description={emptyDescription} />
          )}
        </div>
      ) : null}

      <RoomConfirmModal
        open={pendingDeletePlaceId != null}
        message="이 장소를 삭제할까요?"
        description="삭제하면 목록에서 더 이상 보이지 않아요"
        cancelLabel="취소"
        confirmLabel="삭제"
        historyStateKey="mySavedPlacesDeleteConfirm"
        confirmButtonClassName="text-primary"
        onCancel={() => setPendingDeletePlaceId(null)}
        onConfirm={handleConfirmDeletePlace}
      />

      <PlaceUsedInDateCourseAlertModal
        open={isUsedInDateCourseAlertOpen}
        className="z-95"
        historyStateKey="mySavedPlacesUsedInDateCourseAlert"
        onClose={closeUsedInDateCourseAlert}
      />
    </div>
  );
}

function SavedPlaceListSkeleton() {
  return (
    <div className="space-y-3 pb-2" aria-label="저장한 장소를 불러오는 중">
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={`saved-place-skeleton-${index}`}
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

function SavedListState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center px-5 py-10 text-center">
      <p className="text-foreground text-sm font-semibold">{title}</p>
      <p className="text-muted-foreground mt-1.5 max-w-64 text-xs leading-relaxed font-medium">
        {description}
      </p>
    </div>
  );
}

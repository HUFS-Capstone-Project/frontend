import "@/components/map/filter-bar.css";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { lazy, Suspense, useMemo, useRef, useState } from "react";

import { EmptyState } from "@/components/common/EmptyState";
import { LIST_TOP_BAR_AFTER_TITLE_CLASS, ListTopBar } from "@/components/common/ListTopBar";
import { MapBackdropLayer } from "@/components/common/MapBackdropLayer";
import { FilterBar } from "@/components/map/FilterBar";
import {
  mapPlacesMatchingMySaved,
  weightedMapCenter,
} from "@/components/mypage/map-places-from-my-saved";
import { MAX_MEMO_LENGTH } from "@/components/mypage/SavedPlaceMemoEditor";
import { RoomConfirmModal } from "@/components/room/RoomConfirmModal";
import { useMapSearchFilters } from "@/features/map/hooks/use-map-search-filters";
import { usePlaceFilterViewModel } from "@/features/map/hooks/use-place-filter-view-model";
import { roomPlaceApi, roomPlaceQueryKeys } from "@/features/room-places";
import { useMyPlacesQuery, userPlaceToSavedPlace } from "@/features/users";
import { useInfiniteScrollTrigger } from "@/hooks/use-infinite-scroll-trigger";
import { usePointerDownOutside } from "@/hooks/use-pointer-down-outside";
import { cn } from "@/lib/utils";
import type { ServiceCategoryCode } from "@/shared/types/map-home";
import type { SavedPlace } from "@/shared/types/my-page";
import { usePlaceDetailStore } from "@/store/place-detail-store";

import { SavedPlaceItem } from "./SavedPlaceItem";

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
  const queryClient = useQueryClient();
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

  const listPlaces = useMemo(() => {
    return apiPlaces;
  }, [apiPlaces]);

  const mapPins = useMemo(() => mapPlacesMatchingMySaved(listPlaces), [listPlaces]);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingPlaceId, setEditingPlaceId] = useState<string | null>(null);
  const [memoDraft, setMemoDraft] = useState("");
  const [pendingDeletePlaceId, setPendingDeletePlaceId] = useState<string | null>(null);

  const invalidatePlaces = async (roomId?: string | null) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["user", "me", "places"] }),
      roomId
        ? queryClient.invalidateQueries({ queryKey: roomPlaceQueryKeys.room(roomId) })
        : Promise.resolve(),
    ]);
  };

  const updateMemoMutation = useMutation({
    mutationFn: ({
      roomId,
      roomPlaceId,
      memo,
    }: {
      roomId: string;
      roomPlaceId: number;
      memo: string;
    }) => roomPlaceApi.updateMemo(roomId, roomPlaceId, { memo }),
    onSuccess: async (_, variables) => {
      await invalidatePlaces(variables.roomId);
    },
  });

  const deletePlaceMutation = useMutation({
    mutationFn: ({ roomId, roomPlaceId }: { roomId: string; roomPlaceId: number }) =>
      roomPlaceApi.deleteRoomPlace(roomId, roomPlaceId),
    onSuccess: async (_, variables) => {
      await invalidatePlaces(variables.roomId);
    },
  });

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

  const emptyMessage =
    activeCategories.length === 0 ? "방에서 장소를 저장해보세요!" : "해당하는 장소가 없습니다.";
  const statusMessage = myPlacesQuery.isError
    ? "나의 장소를 불러오지 못했습니다."
    : myPlacesQuery.isLoading
      ? "나의 장소를 불러오는 중입니다."
      : emptyMessage;

  const handleStartMemo = (place: SavedPlace) => {
    setOpenMenuId(null);
    setEditingPlaceId(place.id);
    setMemoDraft((place.memo ?? "").slice(0, MAX_MEMO_LENGTH));
  };

  const handleSaveMemo = () => {
    if (!editingPlaceId) {
      return;
    }

    const target = listPlaces.find((place) => place.id === editingPlaceId);
    if (!target?.roomId || target.roomPlaceId == null) {
      return;
    }

    const nextMemo = memoDraft.trim().slice(0, MAX_MEMO_LENGTH);
    updateMemoMutation.mutate(
      { roomId: target.roomId, roomPlaceId: target.roomPlaceId, memo: nextMemo },
      {
        onSuccess: () => {
          setEditingPlaceId(null);
          setMemoDraft("");
        },
      },
    );
  };

  const handleDeletePlace = (id: string) => {
    const target = listPlaces.find((place) => place.id === id);
    setOpenMenuId(null);

    if (!target?.roomId || target.roomPlaceId == null) {
      return;
    }

    deletePlaceMutation.mutate(
      { roomId: target.roomId, roomPlaceId: target.roomPlaceId },
      {
        onSuccess: () => {
          if (editingPlaceId === id) {
            setEditingPlaceId(null);
            setMemoDraft("");
          }
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

    handleDeletePlace(pendingDeletePlaceId);
    setPendingDeletePlaceId(null);
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
          {!myPlacesQuery.isLoading && !myPlacesQuery.isError && listPlaces.length > 0 ? (
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
          ) : (
            <EmptyState
              icon={<AlertCircle className="size-5" aria-hidden />}
              message={statusMessage}
            />
          )}
        </div>
      ) : null}

      <RoomConfirmModal
        open={pendingDeletePlaceId != null}
        message="이 장소를 삭제할까요?"
        description="삭제하면 목록에서 더 이상 보이지 않아요"
        cancelLabel="취소"
        confirmLabel="삭제"
        confirmButtonClassName="text-primary"
        onCancel={() => setPendingDeletePlaceId(null)}
        onConfirm={handleConfirmDeletePlace}
      />
    </div>
  );
}

import { AlertCircle } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { EmptyState } from "@/components/common/EmptyState";
import { SearchField } from "@/components/common/SearchField";
import { TwoButtonFooter } from "@/components/common/TwoButtonFooter";
import { EditPlaceResultCard } from "@/components/link-place/EditPlaceResultCard";
import { PlaceFlowCancelPillButton } from "@/components/place-flow/PlaceFlowCancelPillButton";
import { BrandMarkerLoader } from "@/components/ui/BrandMarkerLoader";
import { PillButton } from "@/components/ui/PillButton";
import {
  PROMPT_FLOW_BELOW_HEADLINES_CLASS,
  PROMPT_FLOW_HEADER_CLASS,
  PROMPT_FLOW_LIST_TOP_BORDER_CLASS,
} from "@/features/place-flow/prompt-flow-layout";
import { roomPlaceToSavedPlace, useRoomPlaces } from "@/features/room-places";
import { useInfiniteScrollTrigger } from "@/hooks/use-infinite-scroll-trigger";
import { cn } from "@/lib/utils";
import type { SavedPlace } from "@/shared/types/map-home";
import {
  FULLSCREEN_FLOW_PANEL_CLASSES,
  FULLSCREEN_FLOW_ROUTE_OUTER_CLASSES,
} from "@/shared/ui/fullscreen-flow-layout";

type CoursePlaceAddSheetProps = {
  open: boolean;
  roomId?: string | null;
  excludedPlaceIds: string[];
  onClose: () => void;
  onConfirm: (place: SavedPlace) => void;
};

export function CoursePlaceAddSheet({
  open,
  roomId = null,
  excludedPlaceIds,
  onClose,
  onConfirm,
}: CoursePlaceAddSheetProps) {
  const {
    keyword,
    submittedTrimmedKeyword,
    selectedPlaceId,
    selectedPlace,
    availablePlaces,
    roomPlacesQuery,
    changeKeyword,
    submitSearch,
    selectPlace,
    resetSelection,
  } = useRoomPlacePicker({
    open,
    roomId,
    excludedPlaceIds,
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadMorePlacesRef = useInfiniteScrollTrigger({
    enabled:
      open &&
      roomPlacesQuery.hasNextPage &&
      !roomPlacesQuery.isFetching &&
      !roomPlacesQuery.isFetchingNextPage,
    rootRef: scrollRef,
    onLoadMore: () => {
      void roomPlacesQuery.fetchNextPage();
    },
  });

  const handleClose = () => {
    resetSelection();
    onClose();
  };

  const handleConfirm = () => {
    if (!selectedPlace) {
      return;
    }

    onConfirm(selectedPlace);
    resetSelection();
  };

  if (!open) {
    return null;
  }

  return createPortal(
    <div className={cn(FULLSCREEN_FLOW_ROUTE_OUTER_CLASSES, "z-[80]")}>
      <section className={cn(FULLSCREEN_FLOW_PANEL_CLASSES, "bg-background")}>
        <header className={PROMPT_FLOW_HEADER_CLASS}>
          <div className="space-y-1">
            <h2 className="text-foreground text-xl leading-tight font-bold">장소 추가하기</h2>
            <p className="text-muted-foreground text-sm">
              방에 저장된 장소 중에서 코스에 넣을 장소를 선택해 주세요.
            </p>
          </div>

          <SearchField
            value={keyword}
            onChange={(event) => {
              changeKeyword(event.target.value);
            }}
            onSubmitSearch={submitSearch}
            placeholder="방 안 장소 검색"
            searchButtonLabel="장소 검색"
            className={PROMPT_FLOW_BELOW_HEADLINES_CLASS}
          />
        </header>

        <div ref={scrollRef} className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-6 pb-3">
          {!roomId ? (
            <EmptyState
              icon={<AlertCircle className="size-5" aria-hidden />}
              message="방을 선택한 뒤 장소를 추가해 주세요."
            />
          ) : roomPlacesQuery.isLoading || roomPlacesQuery.isFetching ? (
            <div className="flex justify-center px-5 py-10">
              <BrandMarkerLoader />
            </div>
          ) : roomPlacesQuery.isError ? (
            <EmptyState
              icon={<AlertCircle className="size-5" aria-hidden />}
              message="방 장소 목록을 불러오지 못했어요."
            />
          ) : availablePlaces.length > 0 ? (
            <ul className={cn(PROMPT_FLOW_LIST_TOP_BORDER_CLASS, "mt-1")}>
              {availablePlaces.map((place) => (
                <EditPlaceResultCard
                  key={place.id}
                  place={place}
                  selected={selectedPlaceId === place.id}
                  onSelect={() => selectPlace(place.id)}
                />
              ))}
              <div ref={loadMorePlacesRef} className="h-1" aria-hidden />
              {roomPlacesQuery.isFetchingNextPage ? (
                <div className="flex justify-center px-5 py-8">
                  <BrandMarkerLoader />
                </div>
              ) : null}
            </ul>
          ) : (
            <EmptyState
              icon={<AlertCircle className="size-5" aria-hidden />}
              message={
                submittedTrimmedKeyword
                  ? "검색 결과 중 추가할 수 있는 장소가 없어요."
                  : "추가할 수 있는 방 장소가 없어요."
              }
            />
          )}
        </div>

        <TwoButtonFooter
          left={<PlaceFlowCancelPillButton onClick={handleClose}>취소</PlaceFlowCancelPillButton>}
          right={
            <PillButton
              type="button"
              variant={selectedPlace ? "onboarding" : "onboardingMuted"}
              disabled={!selectedPlace}
              onClick={handleConfirm}
            >
              추가하기
            </PillButton>
          }
        />
      </section>
    </div>,
    document.body,
  );
}

function useRoomPlacePicker({
  open,
  roomId,
  excludedPlaceIds,
}: {
  open: boolean;
  roomId: string | null;
  excludedPlaceIds: string[];
}) {
  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const excludedPlaceIdSet = useMemo(() => new Set(excludedPlaceIds), [excludedPlaceIds]);
  const trimmedKeyword = keyword.trim();
  const submittedTrimmedKeyword = submittedKeyword.trim();

  const roomPlacesQuery = useRoomPlaces({
    roomId,
    params: {
      keyword: submittedTrimmedKeyword,
      limit: 20,
    },
    enabled: open && Boolean(roomId),
  });

  const availablePlaces = useMemo(() => {
    return (roomPlacesQuery.data?.pages ?? [])
      .flatMap((page) => page.items.map(roomPlaceToSavedPlace))
      .filter((place) => {
        const roomPlaceId = place.roomPlaceId ?? Number(place.id);
        return (
          Number.isInteger(roomPlaceId) &&
          !excludedPlaceIdSet.has(String(roomPlaceId)) &&
          !excludedPlaceIdSet.has(place.id)
        );
      });
  }, [excludedPlaceIdSet, roomPlacesQuery.data?.pages]);

  const selectedPlace = availablePlaces.find((place) => place.id === selectedPlaceId) ?? null;

  const changeKeyword = useCallback((nextKeyword: string) => {
    setKeyword(nextKeyword);
    setSelectedPlaceId(null);
  }, []);

  const submitSearch = useCallback(() => {
    setSubmittedKeyword(trimmedKeyword);
    setSelectedPlaceId(null);
  }, [trimmedKeyword]);

  const selectPlace = useCallback((placeId: string) => {
    setSelectedPlaceId((current) => (current === placeId ? null : placeId));
  }, []);

  const resetSelection = useCallback(() => {
    setKeyword("");
    setSubmittedKeyword("");
    setSelectedPlaceId(null);
  }, []);

  return {
    keyword,
    submittedTrimmedKeyword,
    selectedPlaceId,
    selectedPlace,
    availablePlaces,
    roomPlacesQuery,
    changeKeyword,
    submitSearch,
    selectPlace,
    resetSelection,
  };
}

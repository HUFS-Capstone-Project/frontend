import { MapPin, MoreVertical, Share2, SquarePen } from "lucide-react";
import { type JSX, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { renderMapPrimaryCategoryIcon } from "@/components/map/filters/map-category-icons";
import { SavedPlaceMemoEditor } from "@/components/mypage/SavedPlaceMemoEditor";
import {
  BusinessHoursAccordion,
  BusinessHoursStatusSummary,
} from "@/components/place/BusinessHoursAccordion";
import {
  PLACE_FLOW_LINK_CHIP_CLASS,
  PlaceFlowOriginalLinkChipRow,
} from "@/components/place-flow/PlaceFlowOriginalLinkChipRow";
import { RoomConfirmModal } from "@/components/room/RoomConfirmModal";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { roomPlaceToSavedPlace, useRoomPlace } from "@/features/room-places";
import { usePointerDownOutside } from "@/hooks/use-pointer-down-outside";
import { cn } from "@/lib/utils";
import { sharePlace } from "@/shared/lib/share-place";
import { SAVED_PLACE_MOCKS } from "@/shared/mocks/place-mocks";
import type { SavedPlace as MapSavedPlace } from "@/shared/types/map-home";
import type { SavedPlace as MySavedPlace } from "@/shared/types/my-page";
import type { RoomPlaceMemo } from "@/shared/types/place-memo";
import { usePlaceDetailStore } from "@/store/place-detail-store";

import { PlaceMemoList } from "./PlaceMemoList";

const BUSINESS_HOURS_POLLING_INTERVAL_MS = 5_000;
const BUSINESS_HOURS_MAX_POLLING_MS = 20_000;

type DetailSavedPlace = MySavedPlace &
  Partial<
    Pick<
      MapSavedPlace,
      | "latitude"
      | "longitude"
      | "businessHours"
      | "categoryName"
      | "tagNames"
      | "addedVia"
      | "linkSourceType"
    >
  >;

type PlaceDetailSheetProps = {
  roomId?: string | null;
  savedPlaces?: DetailSavedPlace[];
  /** false면 메모 목록만 표시하고 메모 작성 UI는 숨김 (데이트 코스 후보 확인 등) */
  allowMemoEdit?: boolean;
  onSaveMemo?: (placeId: string, memo: string) => void | Promise<void>;
  onDeletePlace?: (placeId: string) => void | Promise<void>;
};

export function PlaceDetailSheet({
  roomId = null,
  savedPlaces,
  allowMemoEdit = true,
  onSaveMemo,
  onDeletePlace,
}: PlaceDetailSheetProps = {}): JSX.Element | null {
  const { isOpen, selectedPlaceId, closeDetail } = usePlaceDetailStore((state) => state);
  const [isMemoEditing, setIsMemoEditing] = useState(false);
  const [memoDraft, setMemoDraft] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const [localMemos, setLocalMemos] = useState<Record<string, string>>({});
  const [localRemovedPlaceIds, setLocalRemovedPlaceIds] = useState<string[]>([]);
  const [businessHoursPollingStartedAt, setBusinessHoursPollingStartedAt] = useState<number | null>(
    null,
  );
  const selectedRoomPlaceId = useMemo(() => {
    if (!selectedPlaceId) {
      return null;
    }

    const parsed = Number(selectedPlaceId);
    return Number.isInteger(parsed) ? parsed : null;
  }, [selectedPlaceId]);
  const selectedSavedPlace = useMemo(
    () => savedPlaces?.find((item) => item.id === selectedPlaceId) ?? null,
    [savedPlaces, selectedPlaceId],
  );
  const effectiveRoomId = roomId ?? selectedSavedPlace?.roomId ?? null;
  const shouldFetchRoomPlaceDetail = effectiveRoomId != null && selectedRoomPlaceId != null;
  const roomPlaceDetailQuery = useRoomPlace({
    roomId: effectiveRoomId,
    roomPlaceId: selectedRoomPlaceId,
    enabled: isOpen && shouldFetchRoomPlaceDetail,
    queryOptions: {
      refetchInterval: (query) => {
        if (
          !isOpen ||
          !shouldFetchRoomPlaceDetail ||
          businessHoursPollingStartedAt == null ||
          !isBusinessHoursPendingOrFetching(query.state.data?.businessHoursStatus)
        ) {
          return false;
        }

        const elapsedMs = Date.now() - businessHoursPollingStartedAt;
        return elapsedMs < BUSINESS_HOURS_MAX_POLLING_MS
          ? BUSINESS_HOURS_POLLING_INTERVAL_MS
          : false;
      },
      refetchIntervalInBackground: false,
    },
  });

  const places = useMemo(() => {
    const localRemoved = new Set(localRemovedPlaceIds);
    let sourcePlaces: MapSavedPlace[];

    if (roomPlaceDetailQuery.data) {
      const detailPlace = roomPlaceToSavedPlace(roomPlaceDetailQuery.data);
      const localMemo = localMemos[String(roomPlaceDetailQuery.data.roomPlaceId)];
      sourcePlaces = [
        {
          ...detailPlace,
          memo: localMemo ?? detailPlace.memo,
          memos: localMemo ? createLocalMemoList(localMemo) : detailPlace.memos,
        },
      ].filter((place) => !localRemoved.has(place.id));
    } else if (savedPlaces) {
      sourcePlaces = savedPlaces
        .filter((place) => !localRemoved.has(place.id))
        .map((place) => {
          return {
            id: place.id,
            name: place.name,
            category: place.category,
            categoryName: place.categoryName,
            tagKeys: place.tagKeys,
            tagNames: place.tagNames,
            latitude: place.latitude ?? 0,
            longitude: place.longitude ?? 0,
            address: place.address,
            shareLinkUrl: place.shareLinkUrl ?? null,
            addedVia: place.addedVia ?? null,
            linkSourceType: place.linkSourceType ?? null,
            memo: localMemos[place.id] ?? place.memo,
            memos: localMemos[place.id] ? createLocalMemoList(localMemos[place.id]) : place.memos,
            businessHours: "businessHours" in place ? (place.businessHours ?? null) : null,
          };
        });
    } else if (shouldFetchRoomPlaceDetail) {
      sourcePlaces = [];
    } else {
      sourcePlaces = SAVED_PLACE_MOCKS.filter((place) => !localRemoved.has(place.id)).map(
        (place) => ({
          ...place,
          memo: localMemos[place.id],
          memos: localMemos[place.id] ? createLocalMemoList(localMemos[place.id]) : undefined,
        }),
      );
    }

    return sourcePlaces;
  }, [
    localMemos,
    localRemovedPlaceIds,
    roomPlaceDetailQuery.data,
    savedPlaces,
    shouldFetchRoomPlaceDetail,
  ]);

  const place = places.find((item) => item.id === selectedPlaceId) ?? null;
  const isRoomPlaceDetailLoading = shouldFetchRoomPlaceDetail && roomPlaceDetailQuery.isLoading;

  useEffect(() => {
    let cancelled = false;

    if (!isOpen || !shouldFetchRoomPlaceDetail || selectedRoomPlaceId == null) {
      queueMicrotask(() => {
        if (!cancelled) {
          setBusinessHoursPollingStartedAt(null);
        }
      });
      return () => {
        cancelled = true;
      };
    }

    queueMicrotask(() => {
      if (!cancelled) {
        setBusinessHoursPollingStartedAt(Date.now());
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen, selectedRoomPlaceId, shouldFetchRoomPlaceDetail]);

  useEffect(() => {
    if (isOpen && selectedPlaceId && !place && !isRoomPlaceDetailLoading) {
      closeDetail();
    }
  }, [closeDetail, isOpen, isRoomPlaceDetailLoading, place, selectedPlaceId]);

  const handleStartMemo = useCallback(() => {
    if (!place) {
      return;
    }
    setIsMemoEditing(true);
    setMemoDraft(place.memo ?? "");
  }, [place]);

  const handleSaveMemo = useCallback(() => {
    if (!place) {
      return;
    }

    const nextMemo = memoDraft.trim();
    if (onSaveMemo) {
      onSaveMemo(place.id, nextMemo);
    } else {
      setLocalMemos((previous) => {
        const next = { ...previous };
        if (nextMemo) {
          next[place.id] = nextMemo;
        } else {
          delete next[place.id];
        }
        return next;
      });
    }
    setIsMemoEditing(false);
    setMemoDraft("");
  }, [memoDraft, onSaveMemo, place]);

  const handleSharePlace = useCallback(() => {
    if (!place) {
      return;
    }

    sharePlace(place);
  }, [place]);

  const handleRequestDelete = useCallback(() => {
    if (!place) {
      return;
    }
    setDeleteTargetId(place.id);
  }, [place]);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTargetId) {
      return;
    }

    if (onDeletePlace) {
      onDeletePlace(deleteTargetId);
    } else {
      setLocalRemovedPlaceIds((previous) =>
        previous.includes(deleteTargetId) ? previous : [...previous, deleteTargetId],
      );
      setLocalMemos((previous) => {
        if (!(deleteTargetId in previous)) {
          return previous;
        }
        const next = { ...previous };
        delete next[deleteTargetId];
        return next;
      });
    }

    setDeleteTargetId(null);
    setIsMemoEditing(false);
    setMemoDraft("");
    closeDetail();
  }, [closeDetail, deleteTargetId, onDeletePlace]);

  const closeOptionsMenu = useCallback(() => {
    setIsOptionsMenuOpen(false);
  }, []);

  usePointerDownOutside(optionsMenuRef, isOptionsMenuOpen, closeOptionsMenu);

  useEffect(() => {
    if (!isOpen) {
      queueMicrotask(() => setIsOptionsMenuOpen(false));
    }
  }, [isOpen]);

  useEffect(() => {
    queueMicrotask(() => setIsOptionsMenuOpen(false));
  }, [selectedPlaceId]);

  if (!place) {
    return null;
  }

  const trimmedShareUrl = place.shareLinkUrl?.trim() ?? "";
  const categoryLabel = place.categoryName?.trim() || place.category.trim();
  const tagLabel = getPrimaryTagLabel(place);

  const detailBusinessHoursStatus = roomPlaceDetailQuery.data?.businessHoursStatus;
  const showBusinessHoursSkeleton =
    shouldFetchRoomPlaceDetail &&
    roomPlaceDetailQuery.data != null &&
    isBusinessHoursPendingOrFetching(detailBusinessHoursStatus) &&
    !place.businessHours;

  return (
    <>
      <BottomSheet
        open={isOpen}
        onClose={closeDetail}
        hideHandle
        className="z-85"
        overlayClassName="bg-black/10"
        panelClassName="rounded-t-3xl shadow-xl"
      >
        <div className="px-6 pt-2 pb-2">
          <div className="bg-muted-foreground/25 mx-auto h-1 w-12 rounded-full" aria-hidden />
        </div>
        <div className="px-6 pt-6 pb-7">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                <h2 className="text-foreground min-w-0 shrink truncate text-[1.25rem] leading-tight font-semibold tracking-[-0.01em]">
                  {place.name}
                </h2>
                {categoryLabel ? (
                  <span className="inline-flex shrink-0 items-center gap-2">
                    <span
                      className={cn(
                        "text-muted-foreground border-border/55 bg-muted/45 inline-flex size-6 shrink-0 items-center justify-center rounded-full",
                      )}
                      title={categoryLabel}
                      aria-label={`카테고리 ${categoryLabel}`}
                    >
                      {renderMapPrimaryCategoryIcon(categoryLabel, "size-3 shrink-0 opacity-100")}
                    </span>
                    {tagLabel ? (
                      <span className="text-muted-foreground text-xs leading-none font-medium">
                        {tagLabel}
                      </span>
                    ) : null}
                  </span>
                ) : null}
              </div>
              <div ref={optionsMenuRef} className="relative -mr-1 shrink-0 pt-px">
                <button
                  type="button"
                  onClick={() => setIsOptionsMenuOpen((current) => !current)}
                  className="text-foreground/85 hover:bg-muted/55 active:bg-muted/70 inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors"
                  aria-expanded={isOptionsMenuOpen}
                  aria-haspopup="menu"
                >
                  <MoreVertical className="size-4.5" aria-hidden />
                  <span className="sr-only">장소 메뉴 열기</span>
                </button>

                {isOptionsMenuOpen ? (
                  <div
                    role="menu"
                    className="border-border bg-popover absolute top-full right-0 z-10 mt-1 w-24 overflow-hidden rounded-md border py-0.5 shadow-sm"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsOptionsMenuOpen(false);
                        handleRequestDelete();
                      }}
                      className="hover:bg-muted/20 active:bg-muted/30 block w-full px-4 py-2.5 text-left text-xs font-semibold text-(--brand-coral-solid) transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="text-muted-foreground mt-0.5 flex items-start gap-2 text-[0.75rem] leading-snug">
              <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <p>{place.address}</p>
            </div>

            <div className="scrollbar-hide mt-4 flex flex-nowrap items-center gap-1.5 overflow-x-auto">
              {trimmedShareUrl ? (
                <PlaceFlowOriginalLinkChipRow
                  linkUrl={trimmedShareUrl}
                  linkSourceType={place.linkSourceType}
                  className="contents"
                />
              ) : null}
              <button
                type="button"
                className={cn(PLACE_FLOW_LINK_CHIP_CLASS, "justify-center")}
                onClick={handleSharePlace}
                aria-label="공유"
                title="공유"
              >
                <Share2 className="size-3 shrink-0" aria-hidden />
              </button>
              {allowMemoEdit ? (
                <button
                  type="button"
                  className={PLACE_FLOW_LINK_CHIP_CLASS}
                  onClick={handleStartMemo}
                >
                  <SquarePen className="size-3 shrink-0" aria-hidden />
                  <span>메모</span>
                </button>
              ) : null}
            </div>
          </div>

          {!isMemoEditing ? <PlaceMemoList memos={place.memos} className="mt-4" /> : null}

          {isMemoEditing ? (
            <div className="mt-4">
              <SavedPlaceMemoEditor
                value={memoDraft}
                onChange={setMemoDraft}
                onSave={handleSaveMemo}
                onClear={() => setMemoDraft("")}
              />
            </div>
          ) : null}

          {place.businessHours ? (
            <div className="mt-6 space-y-4">
              <BusinessHoursStatusSummary businessHours={place.businessHours} />
              <BusinessHoursAccordion businessHours={place.businessHours} />
            </div>
          ) : showBusinessHoursSkeleton ? (
            <div className="mt-6">
              <BusinessHoursSkeleton />
            </div>
          ) : null}
        </div>
      </BottomSheet>

      <RoomConfirmModal
        open={deleteTargetId != null}
        message="이 장소를 삭제할까요?"
        description="삭제하면 방 목록에서 더 이상 보이지 않아요"
        cancelLabel="취소"
        confirmLabel="삭제"
        className="z-95"
        confirmButtonClassName="text-primary"
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

function isBusinessHoursPendingOrFetching(status: string | null | undefined): boolean {
  return status === "PENDING" || status === "FETCHING";
}

function createLocalMemoList(memo: string): RoomPlaceMemo[] {
  return [
    {
      userId: 0,
      nickname: "나",
      profileImageUrl: null,
      memo,
      updatedAt: "local",
    },
  ];
}

function getPrimaryTagLabel(place: Pick<MapSavedPlace, "tagKeys" | "tagNames">): string {
  const tagName = place.tagNames?.find((name) => name.trim().length > 0)?.trim();
  if (tagName) {
    return tagName;
  }

  const tagKey = place.tagKeys?.find((key) => key.trim().length > 0)?.trim();
  if (!tagKey) {
    return "";
  }

  const segments = tagKey.split(/[-_/]/).map((segment) => segment.trim());
  return segments.at(-1) || tagKey;
}

function BusinessHoursSkeleton(): JSX.Element {
  return (
    <section className="space-y-3 pt-1" aria-busy="true" aria-label="영업시간 불러오는 중">
      <span className="sr-only">영업시간을 불러오는 중입니다.</span>
      <div className="space-y-3">
        <div className="bg-muted/60 h-4 w-36 animate-pulse rounded-md" />
        <div className="bg-muted/45 h-4 max-w-56 animate-pulse rounded-md" />
      </div>
    </section>
  );
}

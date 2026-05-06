import { ExternalLink, MapPin, MoreVertical } from "lucide-react";
import { type JSX, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SavedPlaceMemoEditor } from "@/components/mypage/SavedPlaceMemoEditor";
import { BusinessHoursAccordion } from "@/components/place/BusinessHoursAccordion";
import { RoomConfirmModal } from "@/components/room/RoomConfirmModal";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { roomPlaceToSavedPlace, useRoomPlace } from "@/features/room-places";
import { usePointerDownOutside } from "@/hooks/use-pointer-down-outside";
import { resolveSavedPlacesBusinessHours, useKoreanNow } from "@/shared/lib/place-business-hours";
import { sharePlace } from "@/shared/lib/share-place";
import { SAVED_PLACE_BY_ID, SAVED_PLACE_MOCKS } from "@/shared/mocks/place-mocks";
import type { SavedPlace as MapSavedPlace } from "@/shared/types/map-home";
import type { SavedPlace as MySavedPlace } from "@/shared/types/my-page";
import { usePlaceDetailStore } from "@/store/place-detail-store";

type DetailSavedPlace = MySavedPlace &
  Partial<Pick<MapSavedPlace, "latitude" | "longitude" | "businessHours">>;

type PlaceDetailSheetProps = {
  roomId?: string | null;
  savedPlaces?: DetailSavedPlace[];
  onSaveMemo?: (placeId: string, memo: string) => void;
  onDeletePlace?: (placeId: string) => void;
};

export function PlaceDetailSheet({
  roomId = null,
  savedPlaces,
  onSaveMemo,
  onDeletePlace,
}: PlaceDetailSheetProps = {}): JSX.Element | null {
  const { isOpen, selectedPlaceId, closeDetail } = usePlaceDetailStore((state) => state);
  const now = useKoreanNow();
  const menuChromeRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMemoEditing, setIsMemoEditing] = useState(false);
  const [memoDraft, setMemoDraft] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [localMemos, setLocalMemos] = useState<Record<string, string>>({});
  const [localRemovedPlaceIds, setLocalRemovedPlaceIds] = useState<string[]>([]);
  const selectedRoomPlaceId = useMemo(() => {
    if (!selectedPlaceId) {
      return null;
    }

    const parsed = Number(selectedPlaceId);
    return Number.isInteger(parsed) ? parsed : null;
  }, [selectedPlaceId]);
  const shouldFetchRoomPlaceDetail = savedPlaces == null && roomId != null;
  const roomPlaceDetailQuery = useRoomPlace({
    roomId,
    roomPlaceId: selectedRoomPlaceId,
    enabled: isOpen && shouldFetchRoomPlaceDetail,
  });

  const places = useMemo(() => {
    const localRemoved = new Set(localRemovedPlaceIds);
    let sourcePlaces: MapSavedPlace[];

    if (savedPlaces) {
      sourcePlaces = savedPlaces
        .filter((place) => !localRemoved.has(place.id))
        .map((place) => {
          const mock = SAVED_PLACE_BY_ID.get(place.id);
          return {
            id: place.id,
            name: place.name,
            category: place.category,
            tagKeys: place.tagKeys ?? mock?.tagKeys,
            latitude: place.latitude ?? mock?.latitude ?? 0,
            longitude: place.longitude ?? mock?.longitude ?? 0,
            address: place.address,
            shareLinkUrl: place.shareLinkUrl ?? mock?.shareLinkUrl ?? null,
            memo: place.memo ?? localMemos[place.id],
            businessHours:
              "businessHours" in place
                ? (place.businessHours ?? null)
                : (mock?.businessHours ?? null),
          };
        });
    } else if (shouldFetchRoomPlaceDetail) {
      sourcePlaces = roomPlaceDetailQuery.data
        ? [
            {
              ...roomPlaceToSavedPlace(roomPlaceDetailQuery.data),
              memo:
                localMemos[String(roomPlaceDetailQuery.data.roomPlaceId)] ??
                roomPlaceDetailQuery.data.memo ??
                undefined,
            },
          ].filter((place) => !localRemoved.has(place.id))
        : [];
    } else {
      sourcePlaces = SAVED_PLACE_MOCKS.filter((place) => !localRemoved.has(place.id)).map(
        (place) => ({
          ...place,
          memo: localMemos[place.id],
        }),
      );
    }

    return resolveSavedPlacesBusinessHours(sourcePlaces, now);
  }, [
    localMemos,
    localRemovedPlaceIds,
    now,
    roomPlaceDetailQuery.data,
    savedPlaces,
    shouldFetchRoomPlaceDetail,
  ]);

  const place = places.find((item) => item.id === selectedPlaceId) ?? null;
  const isRoomPlaceDetailLoading = shouldFetchRoomPlaceDetail && roomPlaceDetailQuery.isLoading;

  usePointerDownOutside(menuChromeRef, isOpen && isMenuOpen, () => setIsMenuOpen(false));

  useEffect(() => {
    if (isOpen && selectedPlaceId && !place && !isRoomPlaceDetailLoading) {
      closeDetail();
    }
  }, [closeDetail, isOpen, isRoomPlaceDetailLoading, place, selectedPlaceId]);

  const handleStartMemo = useCallback(() => {
    if (!place) {
      return;
    }
    setIsMenuOpen(false);
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

    setIsMenuOpen(false);
    sharePlace(place);
  }, [place]);

  const handleRequestDelete = useCallback(() => {
    if (!place) {
      return;
    }
    setIsMenuOpen(false);
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

  if (!place) {
    return null;
  }

  return (
    <>
      <BottomSheet
        open={isOpen}
        onClose={closeDetail}
        hideHandle
        className="z-[85]"
        overlayClassName="bg-black/10"
        panelClassName="rounded-t-3xl shadow-xl"
      >
        <div className="px-6 pt-2 pb-2">
          <div className="bg-muted-foreground/25 mx-auto h-1 w-12 rounded-full" aria-hidden />
        </div>
        <div className="space-y-4 px-6 pt-8 pb-0">
          <div className="space-y-1.5">
            <div className="flex items-start gap-3">
              <h2 className="text-foreground min-w-0 flex-1 text-[1.25rem] leading-tight font-semibold tracking-[-0.01em]">
                {place.name}
              </h2>
              <div ref={menuChromeRef} className="relative -mt-2 -mr-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((current) => !current)}
                  className="touch-target-min flex shrink-0 items-center justify-center rounded-full text-[#222222]"
                >
                  <MoreVertical className="size-5" aria-hidden />
                  <span className="sr-only">장소 메뉴 열기</span>
                </button>

                {isMenuOpen ? (
                  <div className="absolute top-[calc(100%-6px)] right-2 z-20 w-24 overflow-hidden rounded-md border border-[#eaeaea] bg-white py-0.5 shadow-[0_2px_8px_rgb(0_0_0/_0.07)]">
                    <button
                      type="button"
                      onClick={handleSharePlace}
                      className="block w-full px-4 py-2.5 text-left text-xs font-medium text-[#595959] active:bg-[#f7f7f7]"
                    >
                      공유
                    </button>
                    <button
                      type="button"
                      onClick={handleStartMemo}
                      className="block w-full px-4 py-2.5 text-left text-xs font-medium text-[#595959] active:bg-[#f7f7f7]"
                    >
                      메모
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestDelete}
                      className="block w-full px-4 py-2.5 text-left text-xs font-semibold text-[var(--brand-coral-solid)] active:bg-[#f7f7f7]"
                    >
                      삭제
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
            <div className="text-muted-foreground flex items-start gap-2 text-[0.75rem] leading-snug">
              <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <p>{place.address}</p>
            </div>
          </div>

          {place.memo && !isMemoEditing ? (
            <p className="text-foreground border-border/50 bg-muted/20 rounded-lg border px-3 py-2 text-xs leading-relaxed font-medium">
              {place.memo}
            </p>
          ) : null}

          {isMemoEditing ? (
            <SavedPlaceMemoEditor
              value={memoDraft}
              onChange={setMemoDraft}
              onSave={handleSaveMemo}
              onClear={() => setMemoDraft("")}
            />
          ) : null}

          {place.shareLinkUrl ? (
            <button
              type="button"
              className="border-border bg-background text-muted-foreground hover:bg-muted/35 focus-visible:ring-ring/50 flex w-full items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:outline-none"
              onClick={() => {
                window.open(place.shareLinkUrl ?? "", "_blank", "noopener,noreferrer");
              }}
            >
              <span>원본 콘텐츠 보기</span>
              <ExternalLink className="text-muted-foreground size-4 shrink-0" aria-hidden />
            </button>
          ) : null}

          {place.businessHours ? (
            <BusinessHoursAccordion businessHours={place.businessHours} />
          ) : null}
        </div>
      </BottomSheet>

      <RoomConfirmModal
        open={deleteTargetId != null}
        message="이 장소를 삭제할까요?"
        description="삭제하면 목록에서 더 이상 보이지 않아요."
        cancelLabel="취소"
        confirmLabel="삭제"
        className="z-[95]"
        confirmButtonClassName="text-[var(--brand-coral-solid)]"
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

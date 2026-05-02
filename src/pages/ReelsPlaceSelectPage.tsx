import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { PlaceSelectCard } from "@/components/reels/PlaceSelectCard";
import { cn } from "@/lib/utils";
import { SAVED_PLACE_MOCKS } from "@/pages/map/map-home-mock";
import { useEditPlaceStore } from "@/store/editPlaceStore";
import { useReelsPlaceSelectStore } from "@/store/reelsPlaceSelectStore";
import { useRegisterRoomStore } from "@/store/registerRoomStore";

const REELS_LINK_MOCK =
  "https://www.instagram.com/reel/DNp9tqSz6rT/?igsh=MW4yOGd6aGNzMmRsYw==";
const PLACE_RENDER_ORDER = ["place-1", "place-2", "place-3", "place-4", "place-5", "place-9"];
const SAVED_PLACE_ID = "place-3";

export default function ReelsPlaceSelectPage() {
  const navigate = useNavigate();
  const selectedPlaceIds = useReelsPlaceSelectStore((state) => state.selectedPlaceIds);
  const togglePlace = useReelsPlaceSelectStore((state) => state.togglePlace);
  const clearSelection = useReelsPlaceSelectStore((state) => state.clearSelection);
  const editingPlaceId = useEditPlaceStore((state) => state.editingPlaceId);
  const selectedResultId = useEditPlaceStore((state) => state.selectedResultId);
  const setSelectedPlacesForRegister = useRegisterRoomStore((state) => state.setSelectedPlaces);
  const [copyLabel, setCopyLabel] = useState("복사");

  const placeRows = useMemo(
    () =>
      PLACE_RENDER_ORDER.map((placeId) => {
        const originalPlace = SAVED_PLACE_MOCKS.find((place) => place.id === placeId);
        const editedPlace =
          editingPlaceId === placeId && selectedResultId
            ? SAVED_PLACE_MOCKS.find((place) => place.id === selectedResultId)
            : null;

        const place = editedPlace ?? originalPlace;

        return place ? { slotId: placeId, place } : null;
      }).filter((row) => row != null),
    [editingPlaceId, selectedResultId],
  );
  const canConfirm = selectedPlaceIds.length > 0;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(REELS_LINK_MOCK);
      setCopyLabel("복사됨");
      window.setTimeout(() => setCopyLabel("복사"), 1500);
    } catch {
      setCopyLabel("실패");
      window.setTimeout(() => setCopyLabel("복사"), 1500);
    }
  }, []);

  return (
    <main className="mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-white">
      <header className="shrink-0 px-5 pt-40">
        <section className="space-y-5 pb-[76px]" aria-labelledby="reels-place-select-title">
          <div className="space-y-1">
            <h1
              id="reels-place-select-title"
              className="text-foreground text-xl leading-tight font-bold"
            >
              장소가 인식되었습니다.
            </h1>
            <p className="text-foreground text-xl leading-tight font-bold">
              어느 장소를 등록하시겠습니까?
            </p>
          </div>

          <div className="border-border flex h-11 items-center gap-3 rounded-full border bg-white py-1.5 pr-1.5 pl-3">
            <p className="text-foreground min-w-0 flex-1 truncate text-sm">{REELS_LINK_MOCK}</p>
            <button
              type="button"
              className="bg-muted text-foreground h-8 shrink-0 rounded-full px-4 text-sm font-medium transition-colors active:bg-muted/80"
              onClick={() => {
                void handleCopy();
              }}
            >
              {copyLabel}
            </button>
          </div>
        </section>
      </header>

      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        <ul className="space-y-3">
          {placeRows.map(({ slotId, place }) => {
            const disabled = slotId === SAVED_PLACE_ID;
            return (
              <PlaceSelectCard
                key={slotId}
                place={place}
                selected={selectedPlaceIds.includes(slotId)}
                disabled={disabled}
                onSelect={() => togglePlace(slotId)}
                onEdit={() =>
                  navigate("/edit_place", {
                    state: {
                      placeId: slotId,
                      placeName: place.name,
                    },
                  })
                }
              />
            );
          })}
        </ul>
      </div>

      <div className="shrink-0 bg-white px-5 pt-4 pb-[calc(env(safe-area-inset-bottom)+28px)]">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="bg-muted text-foreground h-14 rounded-2xl text-base font-semibold transition-colors active:bg-muted/80"
            onClick={clearSelection}
          >
            취소
          </button>
          <button
            type="button"
            className={cn(
              "h-14 rounded-2xl text-base font-semibold transition-colors disabled:cursor-not-allowed",
              canConfirm
                ? "bg-[#ffd2d0] text-[#241918] active:bg-[#ffc4c1]"
                : "bg-muted text-foreground",
            )}
            disabled={!canConfirm}
            onClick={() => {
              setSelectedPlacesForRegister(selectedPlaceIds);
              navigate("/register-select-room", {
                state: {
                  selectedPlaceIds,
                  selectedPlaceCount: selectedPlaceIds.length,
                },
              });
            }}
          >
            확인
          </button>
        </div>
      </div>
    </main>
  );
}

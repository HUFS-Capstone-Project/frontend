import { ChevronLeft, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { EditPlaceResultCard } from "@/components/reels/EditPlaceResultCard";
import { cn } from "@/lib/utils";
import { SAVED_PLACE_MOCKS } from "@/shared/mocks/place-mocks";
import { useEditPlaceStore } from "@/store/editPlaceStore";

const REELS_LINK_MOCK = "https://www.instagram.com/reel/DNp9tqSz6rT/?igsh=MW4yOGd6aGNzMmRsYw==";

type EditPlaceLocationState = {
  placeId?: string;
  placeName?: string;
};

export default function EditPlacePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state ?? {}) as EditPlaceLocationState;
  const editingPlaceId = useEditPlaceStore((state) => state.editingPlaceId);
  const searchKeyword = useEditPlaceStore((state) => state.searchKeyword);
  const selectedResultId = useEditPlaceStore((state) => state.selectedResultId);
  const setEditingPlace = useEditPlaceStore((state) => state.setEditingPlace);
  const setKeyword = useEditPlaceStore((state) => state.setKeyword);
  const setSelectedResult = useEditPlaceStore((state) => state.setSelectedResult);
  const reset = useEditPlaceStore((state) => state.reset);
  const [copyLabel, setCopyLabel] = useState("복사");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const nextPlaceId = routeState.placeId ?? editingPlaceId;
    const nextKeyword = routeState.placeName ?? searchKeyword;

    setEditingPlace(nextPlaceId ?? null);
    setKeyword(nextKeyword);
    setSelectedResult(null);
    setHasSearched(false);
    // This page is entered with router state, so initialization should only run on entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trimmedKeyword = searchKeyword.trim();
  const canSearch = trimmedKeyword.length > 0;
  const canConfirm = hasSearched ? selectedResultId != null : canSearch;

  const searchResults = useMemo(() => {
    if (!hasSearched || !trimmedKeyword) {
      return [];
    }

    return SAVED_PLACE_MOCKS.filter(
      (place) => place.name.includes(trimmedKeyword) || place.address.includes(trimmedKeyword),
    );
  }, [hasSearched, trimmedKeyword]);

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

  const returnToInitialScreen = () => {
    setSelectedResult(null);
    setHasSearched(false);
  };

  const handleBack = () => {
    if (hasSearched) {
      returnToInitialScreen();
      return;
    }

    reset();
    navigate(-1);
  };

  const handleSearch = () => {
    if (!canSearch) {
      return;
    }

    setSelectedResult(null);
    setHasSearched(true);
  };

  const handleConfirm = () => {
    if (!hasSearched) {
      handleSearch();
      return;
    }

    if (!selectedResultId) {
      return;
    }

    navigate("/dev/register_place");
  };

  return (
    <main className="mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-white">
      <header className={cn("shrink-0 px-5", hasSearched ? "pt-19" : "pt-40")}>
        <section className="space-y-5" aria-labelledby="edit-place-title">
          <div className="space-y-1">
            <h1 id="edit-place-title" className="text-foreground text-xl leading-tight font-bold">
              장소 위치 정보를 변경하시겠습니까?
            </h1>
            <p className="text-foreground text-xl leading-tight font-bold">
              해당 장소를 직접 입력해주세요
            </p>
          </div>

          {!hasSearched ? (
            <div className="border-border flex h-11 items-center gap-3 rounded-full border bg-white py-1.5 pr-1.5 pl-3">
              <p className="text-foreground min-w-0 flex-1 truncate text-sm">{REELS_LINK_MOCK}</p>
              <button
                type="button"
                className="bg-muted text-foreground active:bg-muted/80 h-8 shrink-0 rounded-full px-4 text-sm font-medium transition-colors"
                onClick={() => {
                  void handleCopy();
                }}
              >
                {copyLabel}
              </button>
            </div>
          ) : null}

          <label className="bg-muted flex h-14 items-center gap-2 rounded-2xl px-4">
            {hasSearched ? (
              <button
                type="button"
                className="-ml-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors active:bg-black/5"
                aria-label="수정 첫 화면으로 이동"
                onClick={returnToInitialScreen}
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
              </button>
            ) : null}
            <input
              value={searchKeyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setSelectedResult(null);
              }}
              placeholder="장소 이름을 검색해주세요"
              className="placeholder:text-muted-foreground text-foreground min-w-0 flex-1 bg-transparent text-base outline-none"
            />
            <button
              type="button"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors active:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="장소 검색"
              disabled={!canSearch}
              onClick={handleSearch}
            >
              <Search className="h-5 w-5 text-black/80" strokeWidth={2.2} />
            </button>
          </label>
        </section>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pt-6">
        {hasSearched ? (
          <ul>
            {searchResults.map((place) => (
              <EditPlaceResultCard
                key={place.id}
                place={place}
                selected={selectedResultId === place.id}
                onSelect={() => setSelectedResult(place.id)}
              />
            ))}
          </ul>
        ) : null}
      </div>

      <div className="shrink-0 bg-white px-5 pt-4 pb-[calc(env(safe-area-inset-bottom)+28px)]">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="bg-muted text-foreground active:bg-muted/80 h-14 rounded-2xl text-base font-semibold transition-colors"
            onClick={handleBack}
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
            onClick={handleConfirm}
          >
            확인
          </button>
        </div>
      </div>
    </main>
  );
}

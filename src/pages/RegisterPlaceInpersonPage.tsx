import { ChevronLeft, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { InpersonSearchResultCard } from "@/components/reels/InpersonSearchResultCard";
import { cn } from "@/lib/utils";
import { SAVED_PLACE_MOCKS } from "@/pages/map/map-home-mock";
import { useInpersonPlaceStore } from "@/store/inpersonPlaceStore";
import { useRegisterRoomStore } from "@/store/registerRoomStore";

const REELS_LINK_MOCK =
  "https://www.instagram.com/reel/DNp9tqSz6rT/?igsh=MW4yOGd6aGNzMmRsYw==";

export default function RegisterPlaceInpersonPage() {
  const navigate = useNavigate();
  const keyword = useInpersonPlaceStore((state) => state.keyword);
  const selectedPlaceId = useInpersonPlaceStore((state) => state.selectedPlaceId);
  const setKeyword = useInpersonPlaceStore((state) => state.setKeyword);
  const setSelectedPlace = useInpersonPlaceStore((state) => state.setSelectedPlace);
  const reset = useInpersonPlaceStore((state) => state.reset);
  const setSelectedPlacesForRegister = useRegisterRoomStore((state) => state.setSelectedPlaces);
  const [copyLabel, setCopyLabel] = useState("복사");
  const [isSearchMode, setIsSearchMode] = useState(false);

  useEffect(() => {
    reset();
  }, [reset]);

  const trimmedKeyword = keyword.trim();
  const canConfirm = selectedPlaceId !== null;

  const searchResults = useMemo(() => {
    if (!trimmedKeyword) {
      return [];
    }

    return SAVED_PLACE_MOCKS.filter((place) => place.name.includes(trimmedKeyword));
  }, [trimmedKeyword]);

  const selectedPlace = useMemo(
    () => SAVED_PLACE_MOCKS.find((place) => place.id === selectedPlaceId) ?? null,
    [selectedPlaceId],
  );

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
    setKeyword("");
    setSelectedPlace(null);
    setIsSearchMode(false);
  };

  const handleCancel = () => {
    reset();
    setIsSearchMode(false);
    navigate(-1);
  };

  const handleConfirm = () => {
    if (!selectedPlaceId) {
      return;
    }

    setSelectedPlacesForRegister([selectedPlaceId]);
    navigate("/register-select-room", {
      state: {
        selectedPlaceIds: [selectedPlaceId],
        selectedPlaceCount: 1,
        selectedPlace,
      },
    });
  };

  return (
    <main className="mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-white">
      <header className={cn("shrink-0 px-5", isSearchMode ? "pt-19" : "pt-40")}>
        <section className="space-y-5" aria-labelledby="inperson-place-title">
          <div className="space-y-1">
            <h1
              id="inperson-place-title"
              className="text-foreground text-xl leading-tight font-bold"
            >
              장소 인식에 실패했습니다.
            </h1>
            <p className="text-foreground text-xl leading-tight font-bold">
              해당 장소를 직접 입력해주세요.
            </p>
          </div>

          {!isSearchMode ? (
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
          ) : null}

          <label className="bg-muted flex h-14 items-center gap-2 rounded-2xl px-4">
            {isSearchMode ? (
              <button
                type="button"
                className="-ml-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors active:bg-black/5"
                aria-label="검색 초기 화면으로 이동"
                onClick={returnToInitialScreen}
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
              </button>
            ) : null}
            <input
              value={keyword}
              onFocus={() => setIsSearchMode(true)}
              onChange={(event) => {
                setIsSearchMode(true);
                setKeyword(event.target.value);
                setSelectedPlace(null);
              }}
              placeholder="장소 이름을 검색해주세요"
              className="placeholder:text-muted-foreground text-foreground min-w-0 flex-1 bg-transparent text-base outline-none"
            />
            <Search className="h-5 w-5 shrink-0 text-black/80" strokeWidth={2.2} aria-hidden />
          </label>
        </section>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto pt-6">
        {isSearchMode ? (
          <ul className="space-y-3">
            {searchResults.map((place) => (
              <InpersonSearchResultCard
                key={place.id}
                place={place}
                selected={selectedPlaceId === place.id}
                onSelect={() => setSelectedPlace(place.id)}
              />
            ))}
          </ul>
        ) : null}
      </div>

      <div className="shrink-0 bg-white px-5 pt-4 pb-[calc(env(safe-area-inset-bottom)+28px)]">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="bg-muted text-foreground h-14 rounded-2xl text-base font-semibold transition-colors active:bg-muted/80"
            onClick={handleCancel}
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

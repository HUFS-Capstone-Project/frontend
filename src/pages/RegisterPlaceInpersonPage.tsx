import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { SearchField } from "@/components/common/SearchField";
import { EditPlaceResultCard } from "@/components/reels/EditPlaceResultCard";
import { PillButton } from "@/components/ui/PillButton";
import { SAVED_PLACE_MOCKS } from "@/shared/mocks/place-mocks";
import { useInpersonPlaceStore } from "@/store/inpersonPlaceStore";
import { useRegisterRoomStore } from "@/store/registerRoomStore";

const REELS_LINK_MOCK = "https://www.instagram.com/reel/DNp9tqSz6rT/?igsh=MW4yOGd6aGNzMmRsYw==";

export default function RegisterPlaceInpersonPage() {
  const navigate = useNavigate();
  const keyword = useInpersonPlaceStore((state) => state.keyword);
  const selectedPlaceId = useInpersonPlaceStore((state) => state.selectedPlaceId);
  const setKeyword = useInpersonPlaceStore((state) => state.setKeyword);
  const setSelectedPlace = useInpersonPlaceStore((state) => state.setSelectedPlace);
  const reset = useInpersonPlaceStore((state) => state.reset);
  const setSelectedPlacesForRegister = useRegisterRoomStore((state) => state.setSelectedPlaces);
  const [copyLabel, setCopyLabel] = useState("복사");

  useEffect(() => {
    reset();
  }, [reset]);

  const trimmedKeyword = keyword.trim();
  const canSearch = trimmedKeyword.length > 0;
  const canConfirm = selectedPlaceId !== null;

  const searchResults = useMemo(() => {
    if (!trimmedKeyword) {
      return [];
    }

    return SAVED_PLACE_MOCKS.filter(
      (place) => place.name.includes(trimmedKeyword) || place.address.includes(trimmedKeyword),
    );
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

  const handleCancel = () => {
    reset();
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
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-5 pt-40 pb-4">
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

          <label className="flex min-h-14 items-center gap-2">
            <SearchField
              className="min-w-0 flex-1"
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setSelectedPlace(null);
              }}
              placeholder="장소 이름을 검색해주세요"
              searchButtonLabel="장소 검색"
              onSubmitSearch={() => {
                if (!canSearch) return;
                if (searchResults.length === 1) {
                  setSelectedPlace(searchResults[0].id);
                }
              }}
              searchButtonDisabled={!canSearch}
            />
          </label>

          {trimmedKeyword ? (
            <ul className="-mx-5 border-t border-black/5">
              {searchResults.length === 0 ? (
                <li className="text-muted-foreground px-5 py-8 text-center text-sm">
                  검색 결과가 없습니다
                </li>
              ) : (
                searchResults.map((place) => (
                  <EditPlaceResultCard
                    key={place.id}
                    place={place}
                    selected={selectedPlaceId === place.id}
                    onSelect={() => setSelectedPlace(place.id)}
                  />
                ))
              )}
            </ul>
          ) : null}
        </section>
      </div>

      <div className="shrink-0 bg-white px-5 pt-4 pb-[calc(env(safe-area-inset-bottom)+28px)]">
        <div className="grid grid-cols-2 gap-2.5">
          <PillButton
            type="button"
            variant="outline"
            className="text-muted-foreground hover:text-muted-foreground"
            onClick={handleCancel}
          >
            취소
          </PillButton>
          <PillButton
            type="button"
            variant={canConfirm ? "onboarding" : "onboardingMuted"}
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            확인
          </PillButton>
        </div>
      </div>
    </main>
  );
}

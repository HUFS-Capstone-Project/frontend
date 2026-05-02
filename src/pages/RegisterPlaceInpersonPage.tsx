import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CopyableLinkBar } from "@/components/common/CopyableLinkBar";
import { MobileFixedPageShell } from "@/components/common/MobileFixedPageShell";
import { SearchField } from "@/components/common/SearchField";
import { TwoButtonFooter } from "@/components/common/TwoButtonFooter";
import { EditPlaceResultCard } from "@/components/reels/EditPlaceResultCard";
import { PillButton } from "@/components/ui/PillButton";
import { REELS_LINK_MOCK } from "@/features/reels-registration/constants";
import { SAVED_PLACE_MOCKS } from "@/shared/mocks/place-mocks";
import { useInpersonPlaceStore } from "@/store/inperson-place-store";
import { useRegisterRoomStore } from "@/store/register-room-store";

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
    <MobileFixedPageShell>
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

          <CopyableLinkBar
            url={REELS_LINK_MOCK}
            copyLabel={copyLabel}
            onCopy={() => {
              void handleCopy();
            }}
          />

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

      <TwoButtonFooter
        left={
          <PillButton
            type="button"
            variant="outline"
            className="text-muted-foreground hover:text-muted-foreground"
            onClick={handleCancel}
          >
            취소
          </PillButton>
        }
        right={
          <PillButton
            type="button"
            variant={canConfirm ? "onboarding" : "onboardingMuted"}
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            확인
          </PillButton>
        }
      />
    </MobileFixedPageShell>
  );
}

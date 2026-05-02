import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { CopyableLinkBar } from "@/components/common/CopyableLinkBar";
import { MobileFixedPageShell } from "@/components/common/MobileFixedPageShell";
import { SearchField } from "@/components/common/SearchField";
import { TwoButtonFooter } from "@/components/common/TwoButtonFooter";
import { EditPlaceResultCard } from "@/components/reels/EditPlaceResultCard";
import { PillButton } from "@/components/ui/PillButton";
import { REELS_LINK_MOCK } from "@/features/reels-registration/constants";
import { SAVED_PLACE_MOCKS } from "@/shared/mocks/place-mocks";
import { useEditPlaceStore } from "@/store/edit-place-store";

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

  useEffect(() => {
    const nextPlaceId = routeState.placeId ?? editingPlaceId;
    const nextKeyword = routeState.placeName ?? searchKeyword;

    setEditingPlace(nextPlaceId ?? null);
    setKeyword(nextKeyword);
    setSelectedResult(null);
    // This page is entered with router state, so initialization should only run on entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trimmedKeyword = searchKeyword.trim();
  const canSearch = trimmedKeyword.length > 0;
  const canConfirm = selectedResultId != null;

  const searchResults = useMemo(() => {
    if (!trimmedKeyword) {
      return [];
    }

    return SAVED_PLACE_MOCKS.filter(
      (place) => place.name.includes(trimmedKeyword) || place.address.includes(trimmedKeyword),
    );
  }, [trimmedKeyword]);

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

  const handleBack = () => {
    reset();
    navigate(-1);
  };

  const handleConfirm = () => {
    if (!selectedResultId) {
      return;
    }

    navigate("/dev/register_place");
  };

  return (
    <MobileFixedPageShell>
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-5 pt-40 pb-4">
        <section className="space-y-5" aria-labelledby="edit-place-title">
          <div className="space-y-1">
            <h1 id="edit-place-title" className="text-foreground text-xl leading-tight font-bold">
              장소 위치 정보를 변경하시겠습니까?
            </h1>
            <p className="text-foreground text-xl leading-tight font-bold">
              해당 장소를 직접 입력해주세요
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
              value={searchKeyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setSelectedResult(null);
              }}
              placeholder="장소 이름을 검색해주세요"
              searchButtonLabel="장소 검색"
              onSubmitSearch={() => {
                if (!canSearch) return;
                if (searchResults.length === 1) {
                  setSelectedResult(searchResults[0].id);
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
                    selected={selectedResultId === place.id}
                    onSelect={() => setSelectedResult(place.id)}
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
            onClick={handleBack}
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

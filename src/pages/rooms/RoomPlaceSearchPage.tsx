import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { CopyableLinkBar } from "@/components/common/CopyableLinkBar";
import { MobileFixedPageShell } from "@/components/common/MobileFixedPageShell";
import { SearchField } from "@/components/common/SearchField";
import { TwoButtonFooter } from "@/components/common/TwoButtonFooter";
import { PlaceFlowHeadlines } from "@/components/place-flow/PlaceFlowHeadlines";
import { EditPlaceResultCard } from "@/components/reels/EditPlaceResultCard";
import { PillButton } from "@/components/ui/PillButton";
import { PLACE_FLOW_COPY } from "@/features/place-flow/place-flow-copy";
import { REELS_LINK_MOCK } from "@/features/reels-registration/constants";
import { APP_ROUTES } from "@/shared/config/routes";
import { SAVED_PLACE_MOCKS } from "@/shared/mocks/place-mocks";
import { useInpersonPlaceStore } from "@/store/inperson-place-store";
import { useRegisterRoomStore } from "@/store/register-room-store";

export default function RoomPlaceSearchPage() {
  const navigate = useNavigate();
  const { roomId: roomIdParam = "" } = useParams();
  const registerContextRoomId = roomIdParam.trim();
  const keyword = useInpersonPlaceStore((state) => state.keyword);
  const selectedPlaceId = useInpersonPlaceStore((state) => state.selectedPlaceId);
  const setKeyword = useInpersonPlaceStore((state) => state.setKeyword);
  const setSelectedPlace = useInpersonPlaceStore((state) => state.setSelectedPlace);
  const reset = useInpersonPlaceStore((state) => state.reset);
  const setSelectedPlacesForRegister = useRegisterRoomStore((state) => state.setSelectedPlaces);
  const completeRegisterToRoom = useRegisterRoomStore((state) => state.completeRegisterToRoom);
  const [copyLabel, setCopyLabel] = useState("복사");

  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    if (registerContextRoomId.length === 0) {
      navigate(APP_ROUTES.room, { replace: true });
    }
  }, [navigate, registerContextRoomId]);

  const trimmedKeyword = keyword.trim();
  const canSearch = trimmedKeyword.length > 0;
  const canConfirm = selectedPlaceId !== null && registerContextRoomId.length > 0;

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

  const handleCancel = () => {
    reset();
    navigate(-1);
  };

  const handleConfirm = () => {
    if (!selectedPlaceId || !registerContextRoomId) {
      return;
    }

    setSelectedPlacesForRegister([selectedPlaceId]);
    if (completeRegisterToRoom(registerContextRoomId)) {
      reset();
      navigate(APP_ROUTES.room, {
        replace: true,
        state: { showPlacesRegisteredToast: true },
      });
    }
  };

  if (registerContextRoomId.length === 0) {
    return null;
  }

  return (
    <MobileFixedPageShell alignWithOverlay>
      <header className="shrink-0 px-6 pt-16">
        <PlaceFlowHeadlines
          titleId="inperson-place-title"
          title={PLACE_FLOW_COPY.notFoundTitle}
          subtitle={PLACE_FLOW_COPY.notFoundHint}
        />

        <div className="mt-6 space-y-3 pb-5">
          <CopyableLinkBar
            url={REELS_LINK_MOCK}
            copyLabel={copyLabel}
            onCopy={() => {
              void handleCopy();
            }}
          />

          <label className="flex min-h-14 items-center gap-2" htmlFor="inperson-place-search">
            <SearchField
              id="inperson-place-search"
              className="min-w-0 flex-1"
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                setSelectedPlace(null);
              }}
              placeholder={PLACE_FLOW_COPY.searchPlaceholder}
              searchButtonLabel={PLACE_FLOW_COPY.searchButton}
              onSubmitSearch={() => {
                if (!canSearch) return;
                if (searchResults.length === 1) {
                  setSelectedPlace(searchResults[0].id);
                }
              }}
              searchButtonDisabled={!canSearch}
            />
          </label>
        </div>
      </header>

      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-6 pb-3">
        {trimmedKeyword ? (
          <ul className="border-t border-black/5">
            {searchResults.length === 0 ? (
              <li className="px-1 py-8 text-center">
                <p className="text-foreground text-base font-semibold">
                  {PLACE_FLOW_COPY.emptySearchTitle}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {PLACE_FLOW_COPY.emptySearchHint}
                </p>
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
      </div>

      <TwoButtonFooter
        left={
          <PillButton
            type="button"
            variant="outline"
            className="text-muted-foreground hover:text-muted-foreground"
            onClick={handleCancel}
          >
            {PLACE_FLOW_COPY.cancel}
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

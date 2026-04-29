import { ExternalLink, MapPin } from "lucide-react";
import { type JSX, useEffect, useMemo } from "react";

import { BusinessHoursAccordion } from "@/components/place/BusinessHoursAccordion";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { SAVED_PLACE_MOCKS } from "@/pages/map/map-home-mock";
import { resolveSavedPlacesBusinessHours, useKoreanNow } from "@/shared/lib/place-business-hours";
import { usePlaceDetailStore } from "@/store/placeDetailStore";

export function PlaceDetailSheet(): JSX.Element | null {
  const { isOpen, selectedPlaceId, closeDetail } = usePlaceDetailStore((state) => state);
  const now = useKoreanNow();
  const places = useMemo(() => resolveSavedPlacesBusinessHours(SAVED_PLACE_MOCKS, now), [now]);

  const place = places.find((item) => item.id === selectedPlaceId) ?? null;

  useEffect(() => {
    if (isOpen && selectedPlaceId && !place) {
      closeDetail();
    }
  }, [closeDetail, isOpen, place, selectedPlaceId]);

  if (!place) {
    return null;
  }

  return (
    <BottomSheet
      open={isOpen}
      onClose={closeDetail}
      hideHandle
      className="z-40"
      overlayClassName="bg-black/10"
      panelClassName="rounded-t-3xl shadow-xl"
    >
      <div className="space-y-4 px-5 py-4">
        <div className="mx-auto h-1.5 w-12 rounded-full bg-gray-300" aria-hidden />

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">{place.name}</h2>
          <div className="flex items-start gap-2 text-sm text-slate-500">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            <p>{place.address}</p>
          </div>
        </div>

        {place.reelsUrl ? (
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800"
            onClick={() => {
              window.open(place.reelsUrl ?? "", "_blank", "noopener,noreferrer");
            }}
          >
            <span>내가 봤던 릴스 다시보기</span>
            <ExternalLink className="size-4" />
          </button>
        ) : null}

        <BusinessHoursAccordion businessHours={place.businessHours} />
      </div>
    </BottomSheet>
  );
}

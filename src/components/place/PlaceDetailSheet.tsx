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
      className="z-[85]"
      overlayClassName="bg-black/10"
      panelClassName="rounded-t-3xl shadow-xl"
    >
      <div className="px-6 pt-2 pb-2">
        <div className="bg-muted-foreground/25 mx-auto h-1 w-12 rounded-full" aria-hidden />
      </div>
      <div className="space-y-4 px-6 pt-8 pb-0">
        <div className="space-y-1.5">
          <h2 className="text-foreground text-[1.25rem] leading-tight font-semibold tracking-[-0.01em]">
            {place.name}
          </h2>
          <div className="text-muted-foreground flex items-start gap-2 text-[0.75rem] leading-snug">
            <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <p>{place.address}</p>
          </div>
        </div>

        {place.reelsUrl ? (
          <button
            type="button"
            className="border-border bg-background text-muted-foreground hover:bg-muted/35 focus-visible:ring-ring/50 flex w-full items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:outline-none"
            onClick={() => {
              window.open(place.reelsUrl ?? "", "_blank", "noopener,noreferrer");
            }}
          >
            <span>내가 봤던 릴스 다시보기</span>
            <ExternalLink className="text-muted-foreground size-4 shrink-0" aria-hidden />
          </button>
        ) : null}

        <BusinessHoursAccordion businessHours={place.businessHours} />
      </div>
    </BottomSheet>
  );
}

import { type JSX, useCallback, useEffect } from "react";

import { PlaceDetailSheet } from "@/components/place/PlaceDetailSheet";
import type { PlaceFilterData } from "@/features/map/api/place-taxonomy-types";
import { useUpdateRoomPlaceMemo } from "@/features/room-places";
import { MapHomePageContent } from "@/pages/map/MapHomePage";
import { PLACE_DETAIL_OPEN_EVENT, usePlaceDetailStore } from "@/store/place-detail-store";
import { useRoomSelectionStore } from "@/store/room-selection-store";

type MapHomeWithDetailProps = {
  defaultFilterPanelOpen?: boolean;
  filterDataOverride?: PlaceFilterData | null;
};

type PlaceDetailOpenEvent = CustomEvent<{
  placeId: string;
}>;

export default function MapHomeWithDetail({
  defaultFilterPanelOpen = false,
  filterDataOverride = null,
}: MapHomeWithDetailProps): JSX.Element {
  const openDetail = usePlaceDetailStore((state) => state.openDetail);
  const selectedRoomId = useRoomSelectionStore((state) => state.selectedRoom?.id ?? null);
  const updateRoomPlaceMemoMutation = useUpdateRoomPlaceMemo({ roomId: selectedRoomId });

  const handleSavePlaceMemo = useCallback(
    (placeId: string, memo: string) => {
      const roomPlaceId = Number(placeId);
      if (!Number.isFinite(roomPlaceId)) {
        return;
      }

      updateRoomPlaceMemoMutation.mutate({
        roomPlaceId,
        payload: { memo: memo.trim() },
      });
    },
    [updateRoomPlaceMemoMutation],
  );

  useEffect(() => {
    const handleOpenDetail = (event: Event) => {
      const { detail } = event as PlaceDetailOpenEvent;
      if (!detail?.placeId) {
        return;
      }

      openDetail(detail.placeId);
    };

    window.addEventListener(PLACE_DETAIL_OPEN_EVENT, handleOpenDetail);

    return () => {
      window.removeEventListener(PLACE_DETAIL_OPEN_EVENT, handleOpenDetail);
    };
  }, [openDetail]);

  return (
    <>
      <MapHomePageContent
        defaultFilterPanelOpen={defaultFilterPanelOpen}
        filterDataOverride={filterDataOverride}
      />
      <PlaceDetailSheet roomId={selectedRoomId} onSaveMemo={handleSavePlaceMemo} />
    </>
  );
}

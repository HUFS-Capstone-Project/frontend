import { useEffect } from "react";

import { PLACE_DETAIL_OPEN_EVENT, usePlaceDetailStore } from "@/store/placeDetailStore";

type PlaceDetailOpenEvent = CustomEvent<{
  placeId: string;
}>;

/** Kakao 마커 클릭 등 전역 커스텀 이벤트 → 상세 바텀 시트 오픈 */
export function usePlaceDetailOpenEvent(subscribed: boolean) {
  const openDetail = usePlaceDetailStore((s) => s.openDetail);

  useEffect(() => {
    if (!subscribed) return;

    const handleOpenDetail = (event: Event) => {
      const { detail } = event as PlaceDetailOpenEvent;
      if (!detail?.placeId) return;
      openDetail(detail.placeId);
    };

    window.addEventListener(PLACE_DETAIL_OPEN_EVENT, handleOpenDetail);
    return () => window.removeEventListener(PLACE_DETAIL_OPEN_EVENT, handleOpenDetail);
  }, [openDetail, subscribed]);
}

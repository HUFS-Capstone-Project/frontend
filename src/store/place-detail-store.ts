import { create } from "zustand";

export const PLACE_DETAIL_OPEN_EVENT = "place-detail:open";

type PlaceDetailState = {
  selectedPlaceId: string | null;
  isOpen: boolean;
  openDetail: (placeId: string) => void;
  closeDetail: () => void;
};

export const usePlaceDetailStore = create<PlaceDetailState>((set) => ({
  selectedPlaceId: null,
  isOpen: false,
  openDetail: (placeId) =>
    set({
      selectedPlaceId: placeId,
      isOpen: true,
    }),
  closeDetail: () =>
    set({
      isOpen: false,
    }),
}));

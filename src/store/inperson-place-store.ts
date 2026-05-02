import { create } from "zustand";

type InpersonPlaceState = {
  keyword: string;
  selectedPlaceId: string | null;
  setKeyword: (keyword: string) => void;
  setSelectedPlace: (placeId: string | null) => void;
  reset: () => void;
};

export const useInpersonPlaceStore = create<InpersonPlaceState>((set) => ({
  keyword: "",
  selectedPlaceId: null,
  setKeyword: (keyword) => set({ keyword }),
  setSelectedPlace: (placeId) => set({ selectedPlaceId: placeId }),
  reset: () =>
    set({
      keyword: "",
      selectedPlaceId: null,
    }),
}));

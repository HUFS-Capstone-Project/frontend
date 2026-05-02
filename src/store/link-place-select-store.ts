import { create } from "zustand";

type LinkPlaceSelectState = {
  selectedPlaceIds: string[];
  togglePlace: (id: string) => void;
  clearSelection: () => void;
};

export const useLinkPlaceSelectStore = create<LinkPlaceSelectState>((set) => ({
  selectedPlaceIds: [],
  togglePlace: (id) =>
    set((state) => ({
      selectedPlaceIds: state.selectedPlaceIds.includes(id)
        ? state.selectedPlaceIds.filter((placeId) => placeId !== id)
        : [...state.selectedPlaceIds, id],
    })),
  clearSelection: () => set({ selectedPlaceIds: [] }),
}));

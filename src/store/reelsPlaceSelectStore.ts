import { create } from "zustand";

type ReelsPlaceSelectState = {
  selectedPlaceIds: string[];
  togglePlace: (id: string) => void;
  clearSelection: () => void;
};

export const useReelsPlaceSelectStore = create<ReelsPlaceSelectState>((set) => ({
  selectedPlaceIds: [],
  togglePlace: (id) =>
    set((state) => ({
      selectedPlaceIds: state.selectedPlaceIds.includes(id)
        ? state.selectedPlaceIds.filter((placeId) => placeId !== id)
        : [...state.selectedPlaceIds, id],
    })),
  clearSelection: () => set({ selectedPlaceIds: [] }),
}));

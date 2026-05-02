import { create } from "zustand";

type EditPlaceState = {
  editingPlaceId: string | null;
  searchKeyword: string;
  selectedResultId: string | null;
  setEditingPlace: (placeId: string | null) => void;
  setKeyword: (keyword: string) => void;
  setSelectedResult: (resultId: string | null) => void;
  reset: () => void;
};

export const useEditPlaceStore = create<EditPlaceState>((set) => ({
  editingPlaceId: null,
  searchKeyword: "",
  selectedResultId: null,
  setEditingPlace: (placeId) => set({ editingPlaceId: placeId }),
  setKeyword: (keyword) => set({ searchKeyword: keyword }),
  setSelectedResult: (resultId) => set({ selectedResultId: resultId }),
  reset: () =>
    set({
      editingPlaceId: null,
      searchKeyword: "",
      selectedResultId: null,
    }),
}));

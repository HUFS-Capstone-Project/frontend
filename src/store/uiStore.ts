import { create } from "zustand";

type UiStoreState = {
  isFilterOpen: boolean;
  setFilterOpen: (open: boolean) => void;
};

export const useUiStore = create<UiStoreState>((set) => ({
  isFilterOpen: false,
  setFilterOpen: (open) => set({ isFilterOpen: open }),
}));

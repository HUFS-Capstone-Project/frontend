import { create } from "zustand";

type UiState = {
  importSheetOpen: boolean;
  filterOpen: boolean;
  setImportSheetOpen: (open: boolean) => void;
  setFilterOpen: (open: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  importSheetOpen: false,
  filterOpen: false,
  setImportSheetOpen: (open) => set({ importSheetOpen: open }),
  setFilterOpen: (open) => set({ filterOpen: open }),
}));

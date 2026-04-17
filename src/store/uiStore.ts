import { create } from "zustand";

type UiState = {
  importSheetOpen: boolean;
  setImportSheetOpen: (open: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  importSheetOpen: false,
  setImportSheetOpen: (open) => set({ importSheetOpen: open }),
}));

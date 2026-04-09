import { create } from "zustand";

type UiState = {
  importSheetOpen: boolean;
  setImportSheetOpen: (open: boolean) => void;
};

/**
 * 전역 UI 플래그만. 서버 데이터는 TanStack Query 캐시에 둡니다.
 */
export const useUiStore = create<UiState>((set) => ({
  importSheetOpen: false,
  setImportSheetOpen: (open) => set({ importSheetOpen: open }),
}));

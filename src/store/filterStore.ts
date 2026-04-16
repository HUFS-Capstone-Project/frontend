import { create } from "zustand";

export type FilterTagKey =
  | "맛집-한식"
  | "맛집-중식"
  | "맛집-일식"
  | "맛집-양식"
  | "맛집-분식"
  | "맛집-아시아식"
  | "맛집-술집"
  | "맛집-기타"
  | "카페-제과, 베이커리"
  | "놀거리-테마파크"
  | "놀거리-보드카페"
  | "놀거리-만화카페"
  | "놀거리-문화,예술"
  | "놀거리-방탈출카페"
  | "놀거리-스포츠"
  | "놀거리-찜질방"
  | "놀거리-공원"
  | "놀거리-생활용품점"
  | "놀거리-아쿠아리움"
  | "놀거리-기타";

type FilterStoreState = {
  selectedTags: FilterTagKey[];
  setSelectedTags: (tags: FilterTagKey[]) => void;
  toggleSelectedTag: (tag: FilterTagKey) => void;
};

export const useFilterStore = create<FilterStoreState>((set) => ({
  selectedTags: [],
  setSelectedTags: (tags) => set({ selectedTags: tags }),
  toggleSelectedTag: (tag) =>
    set((state) => ({
      selectedTags: state.selectedTags.includes(tag)
        ? state.selectedTags.filter((selectedTag) => selectedTag !== tag)
        : [...state.selectedTags, tag],
    })),
}));

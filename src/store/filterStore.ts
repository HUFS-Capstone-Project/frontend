import { create } from "zustand";

import type { MapPlaceCategory } from "@/shared/types/map-home";

export type FilterTagOption = {
  key: string;
  label: string;
};

export type FilterSection = {
  category: Exclude<MapPlaceCategory, "기타">;
  tags: FilterTagOption[];
};

export const FILTER_SECTIONS: FilterSection[] = [
  {
    category: "맛집",
    tags: [
      { key: "맛집-한식", label: "한식" },
      { key: "맛집-중식", label: "중식" },
      { key: "맛집-일식", label: "일식" },
      { key: "맛집-양식", label: "양식" },
      { key: "맛집-분식", label: "분식" },
      { key: "맛집-아시아식", label: "아시아식" },
      { key: "맛집-술집", label: "술집" },
      { key: "맛집-기타", label: "기타" },
    ],
  },
  {
    category: "카페",
    tags: [{ key: "카페-제과, 베이커리", label: "제과, 베이커리" }],
  },
  {
    category: "놀거리",
    tags: [
      { key: "놀거리-테마파크", label: "테마파크" },
      { key: "놀거리-보드카페", label: "보드카페" },
      { key: "놀거리-만화카페", label: "만화카페" },
      { key: "놀거리-문화,예술", label: "문화,예술" },
      { key: "놀거리-방탈출카페", label: "방탈출카페" },
      { key: "놀거리-스포츠", label: "스포츠" },
      { key: "놀거리-찜질방", label: "찜질방" },
      { key: "놀거리-공원", label: "공원" },
      { key: "놀거리-생활용품점", label: "생활용품점" },
      { key: "놀거리-아쿠아리움", label: "아쿠아리움" },
      { key: "놀거리-기타", label: "기타" },
    ],
  },
];

type FilterState = {
  selectedTags: string[];
  setSelectedTags: (tags: string[]) => void;
  toggleTag: (tagKey: string) => void;
};

export const useFilterStore = create<FilterState>((set) => ({
  selectedTags: [],
  setSelectedTags: (tags) => set({ selectedTags: tags }),
  toggleTag: (tagKey) =>
    set((state) => ({
      selectedTags: state.selectedTags.includes(tagKey)
        ? state.selectedTags.filter((current) => current !== tagKey)
        : [...state.selectedTags, tagKey],
    })),
}));

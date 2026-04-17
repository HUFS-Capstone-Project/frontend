import type { MapPrimaryCategory } from "@/shared/types/map-home";

export type FilterTag = {
  key: string;
  label: string;
};

export type FilterTagGroup = {
  title: string;
  tags: FilterTag[];
};

export type FilterSection = {
  category: MapPrimaryCategory;
  /** 맛집·카페처럼 한 줄 칩 */
  tags?: FilterTag[];
  /** 놀거리: 「전체」 등 그룹 상단 칩 */
  leadingTags?: FilterTag[];
  tagGroups?: FilterTagGroup[];
};

export const MAP_ALL_TAG_KEY_BY_CATEGORY: Record<MapPrimaryCategory, string> = {
  맛집: "맛집-전체",
  카페: "카페-전체",
  놀거리: "놀거리-전체",
};

export const MAP_FILTER_SECTIONS: FilterSection[] = [
  {
    category: "맛집",
    tags: [
      { key: MAP_ALL_TAG_KEY_BY_CATEGORY.맛집, label: "전체" },
      { key: "맛집-한식", label: "한식" },
      { key: "맛집-중식", label: "중식" },
      { key: "맛집-일식", label: "일식" },
      { key: "맛집-양식", label: "양식" },
      { key: "맛집-아시아식", label: "아시아식" },
      { key: "맛집-분식", label: "분식" },
      { key: "맛집-술집", label: "술집" },
    ],
  },
  {
    category: "카페",
    tags: [
      { key: MAP_ALL_TAG_KEY_BY_CATEGORY.카페, label: "전체" },
      { key: "카페-제과-베이커리", label: "제과·베이커리" },
    ],
  },
  {
    category: "놀거리",
    leadingTags: [{ key: MAP_ALL_TAG_KEY_BY_CATEGORY.놀거리, label: "전체" }],
    tagGroups: [
      {
        title: "1) 체험",
        tags: [
          { key: "놀거리-테마파크", label: "테마파크" },
          { key: "놀거리-보드카페", label: "보드카페" },
          { key: "놀거리-방탈출카페", label: "방탈출카페" },
          { key: "놀거리-스포츠", label: "스포츠" },
        ],
      },
      {
        title: "2) 문화",
        tags: [
          { key: "놀거리-문화-예술", label: "문화·예술" },
          { key: "놀거리-만화카페", label: "만화카페" },
        ],
      },
      {
        title: "3) 휴식",
        tags: [
          { key: "놀거리-공원", label: "공원" },
          { key: "놀거리-찜질방", label: "찜질방" },
          { key: "놀거리-아쿠아리움", label: "아쿠아리움" },
        ],
      },
      {
        title: "4) 기타",
        tags: [
          { key: "놀거리-생활용품점", label: "생활용품점" },
          { key: "놀거리-기타", label: "기타" },
        ],
      },
    ],
  },
];

export const MAP_FILTER_SECTION_BY_CATEGORY: Record<MapPrimaryCategory, FilterSection> =
  MAP_FILTER_SECTIONS.reduce(
    (accumulator, section) => {
      accumulator[section.category] = section;
      return accumulator;
    },
    {} as Record<MapPrimaryCategory, FilterSection>,
  );

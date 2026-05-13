import type { PlaceFilterData } from "@/features/map/api/place-taxonomy-types";

/**
 * 로그인 미만·API 미응답 시 사용하는 폴백.
 * API 미응답 시에도 서비스 표준 카테고리 코드와 동일한 필터 형태를 유지한다.
 */
export const FALLBACK_PLACE_FILTER_DATA: PlaceFilterData = {
  categories: [
    {
      code: "FOOD",
      name: "음식점",
      sortOrder: 1,
      tagGroups: [
        {
          code: "음식점-default",
          name: null,
          sortOrder: 1,
          tags: [
            { code: "ALL", name: "전체", sortOrder: 0 },
            { code: "음식점-한식", name: "한식", sortOrder: 1 },
            { code: "음식점-중식", name: "중식", sortOrder: 2 },
            { code: "음식점-일식", name: "일식", sortOrder: 3 },
          ],
        },
      ],
    },
    {
      code: "CAFE",
      name: "카페",
      sortOrder: 2,
      tagGroups: [
        {
          code: "카페-default",
          name: null,
          sortOrder: 1,
          tags: [
            { code: "ALL", name: "전체", sortOrder: 0 },
            { code: "카페-커피", name: "커피", sortOrder: 1 },
            { code: "카페-베이커리", name: "베이커리", sortOrder: 2 },
            { code: "카페-디저트", name: "디저트", sortOrder: 3 },
          ],
        },
      ],
    },
    {
      code: "ACTIVITY",
      name: "놀거리",
      sortOrder: 3,
      tagGroups: [
        {
          code: "놀거리-default",
          name: null,
          sortOrder: 1,
          tags: [{ code: "ALL", name: "전체", sortOrder: 0 }],
        },
        {
          code: "놀거리-type",
          name: "놀거리 종류",
          sortOrder: 2,
          tags: [
            { code: "놀거리-산책", name: "산책", sortOrder: 1 },
            { code: "놀거리-먹거리", name: "먹거리", sortOrder: 2 },
          ],
        },
      ],
    },
  ],
};

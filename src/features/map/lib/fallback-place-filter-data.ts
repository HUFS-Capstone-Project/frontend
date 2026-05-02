import type { PlaceFilterData } from "@/features/map/api/place-taxonomy-types";

/**
 * 로그인 미만·API 미응답 시 사용하는 폴백.
 * `SAVED_PLACE_MOCKS`의 카테고리/태그 코드와 맞춰 둔다.
 */
export const FALLBACK_PLACE_FILTER_DATA: PlaceFilterData = {
  categories: [
    {
      code: "맛집",
      name: "맛집",
      sortOrder: 1,
      tagGroups: [
        {
          code: "맛집-default",
          name: null,
          sortOrder: 1,
          tags: [
            { code: "ALL", name: "전체", sortOrder: 0 },
            { code: "맛집-한식", name: "한식", sortOrder: 1 },
            { code: "맛집-중식", name: "중식", sortOrder: 2 },
            { code: "맛집-일식", name: "일식", sortOrder: 3 },
          ],
        },
      ],
    },
    {
      code: "카페",
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
      code: "놀거리",
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

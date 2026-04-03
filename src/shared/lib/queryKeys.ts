/**
 * Query Key는 배열 + 도메인 접두로 통일합니다.
 * - as const로 좁혀 TanStack Query 타입 추론에 유리
 * - 상세 조회는 id를 두 번째 요소로
 */
export const queryKeys = {
  courses: {
    all: ["courses"] as const,
    list: (filters?: { savedOnly?: boolean }) => ["courses", "list", filters] as const,
    detail: (courseId: string) => ["courses", "detail", courseId] as const,
  },
  recommend: {
    preview: (inputHash: string) => ["recommend", "preview", inputHash] as const,
  },
} as const;

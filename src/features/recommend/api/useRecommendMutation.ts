import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/shared/api/axios";
import { queryKeys } from "@/shared/lib/queryKeys";

export type RecommendFromContentBody = {
  /** 사용자가 붙여넣은 원문 — 반드시 백엔드에서 검증·정규화 */
  rawText: string;
};

export type RecommendPreviewResponse = {
  places: { id: string; name: string }[];
};

/**
 * 장소 추천 미리보기(뮤테이션): 입력 기반 분석은 보통 POST이므로 mutation으로 둡니다.
 */
export function useRecommendPreviewMutation(inputHashForCache: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (body: RecommendFromContentBody) => {
      const { data } = await api.post<RecommendPreviewResponse>("/recommend/preview", body);
      return data;
    },
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.recommend.preview(inputHashForCache), data);
    },
  });
}

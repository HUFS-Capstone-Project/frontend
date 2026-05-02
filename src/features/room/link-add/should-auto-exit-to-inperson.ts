import { canRetryLinkAnalysis } from "@/features/link-analysis";

import type { LinkAnalysisResult } from "./types";

/** 후보 없음·실패(재시도 불가)면 직접 검색 화면으로 보낼지 */
export function shouldAutoExitToInperson(result: LinkAnalysisResult): boolean {
  const isSucceeded = result.status === "SUCCEEDED";
  const canRetry = canRetryLinkAnalysis(result.status);
  const hasNoCandidates = result.candidatePlaces.length === 0;
  return (!isSucceeded || hasNoCandidates) && !canRetry;
}

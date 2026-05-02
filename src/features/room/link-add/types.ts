import type { LinkAnalysis, LinkAnalysisStatus } from "@/features/link-analysis";

export type Step = "input" | "processing" | "captionResult" | "selectPlaceMock" | "mockSuccess";

export type CaptionResult = {
  linkId: number;
  originalUrl: string;
  caption: string | null;
  status: LinkAnalysisStatus;
  completed: boolean;
  errorMessage?: string | null;
};

export type MockPlaceCandidate = {
  id: string;
  name: string;
};

export function mapLinkAnalysisToCaptionResult(
  linkAnalysis: LinkAnalysis,
  originalUrl: string,
): CaptionResult {
  return {
    linkId: linkAnalysis.linkId,
    originalUrl,
    caption: linkAnalysis.caption ?? null,
    status: linkAnalysis.status,
    completed: true,
    errorMessage:
      linkAnalysis.status === "FAILED"
        ? "캡션 추출에 실패했습니다."
        : linkAnalysis.status === "DISPATCH_FAILED"
          ? (linkAnalysis.errorMessage ?? "분석 작업을 시작하지 못했습니다. 다시 시도해 주세요.")
          : null,
  };
}

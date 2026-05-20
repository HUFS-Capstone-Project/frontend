import type {
  CandidatePlace,
  LinkAnalysis,
  LinkAnalysisStatus,
  LinkStats,
} from "@/features/link-analysis";

export type Step = "input" | "processing" | "analysisResult";

export type LinkAnalysisResult = {
  analysisRequestId: number | null;
  linkId: number | null;
  jobId: string | null;
  sourceUrl: string;
  status: LinkAnalysisStatus;
  candidatePlaces: CandidatePlace[];
  contentText?: string | null;
  linkStats: LinkStats | null;
  completed: boolean;
  errorCode?: string;
  errorMessage?: string;
};

export function mapLinkAnalysisToResult(params: {
  linkAnalysis: LinkAnalysis;
  fallbackSourceUrl?: string;
  jobId?: string | null;
}): LinkAnalysisResult {
  const { linkAnalysis, fallbackSourceUrl = "", jobId = null } = params;

  return {
    analysisRequestId: linkAnalysis.analysisRequestId,
    linkId: linkAnalysis.linkId,
    jobId,
    sourceUrl: resolveLinkAnalysisSourceUrl(linkAnalysis.sourceUrl, fallbackSourceUrl),
    status: linkAnalysis.status,
    candidatePlaces: linkAnalysis.candidatePlaces,
    contentText: linkAnalysis.contentText ?? null,
    linkStats: linkAnalysis.linkStats,
    completed: true,
    errorCode: linkAnalysis.errorCode,
    errorMessage: resolveAnalysisErrorMessage(linkAnalysis),
  };
}

export function resolveLinkAnalysisSourceUrl(
  apiSourceUrl: string | null | undefined,
  fallbackSourceUrl: string,
): string {
  const fromApi = apiSourceUrl?.trim() ?? "";
  if (fromApi.length > 0) {
    return fromApi;
  }

  return fallbackSourceUrl.trim();
}

function resolveAnalysisErrorMessage(linkAnalysis: LinkAnalysis): string | undefined {
  if (linkAnalysis.errorMessage) {
    return linkAnalysis.errorMessage;
  }

  if (linkAnalysis.status === "FAILED") {
    return "링크 분석에 실패했습니다.";
  }

  if (linkAnalysis.status === "DISPATCH_FAILED") {
    return "분석 작업을 시작하지 못했습니다. 다시 시도해 주세요.";
  }

  return undefined;
}

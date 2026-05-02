import type { CandidatePlace, LinkAnalysis, LinkAnalysisStatus } from "@/features/link-analysis";

export type Step = "input" | "processing" | "analysisResult";

export type LinkAnalysisResult = {
  linkId: number | null;
  jobId: string | null;
  originalUrl: string;
  status: LinkAnalysisStatus;
  candidatePlaces: CandidatePlace[];
  completed: boolean;
  errorCode?: string;
  errorMessage?: string;
};

export function mapLinkAnalysisToResult(params: {
  linkAnalysis: LinkAnalysis;
  originalUrl: string;
  jobId?: string | null;
}): LinkAnalysisResult {
  const { linkAnalysis, originalUrl, jobId = null } = params;

  return {
    linkId: linkAnalysis.linkId,
    jobId,
    originalUrl,
    status: linkAnalysis.status,
    candidatePlaces: linkAnalysis.candidatePlaces,
    completed: true,
    errorCode: linkAnalysis.errorCode,
    errorMessage: resolveAnalysisErrorMessage(linkAnalysis),
  };
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

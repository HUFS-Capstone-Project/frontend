import type {
  CandidatePlace,
  LinkAnalysis,
  LinkAnalysisRequestResult,
  LinkAnalysisStatus,
  LinkStats,
} from "@/features/link-analysis";
import type { LinkSourceType } from "@/shared/lib/link-source-type";

export type Step = "input" | "processing" | "analysisResult";

export type LinkAnalysisResult = {
  analysisRequestId: number | null;
  linkId: number | null;
  jobId: string | null;
  originalUrl: string;
  status: LinkAnalysisStatus;
  candidatePlaces: CandidatePlace[];
  contentText?: string | null;
  linkStats: LinkStats | null;
  completed: boolean;
  errorCode?: string;
  errorMessage?: string;
  retryable?: boolean;
  cooldownSeconds?: number;
  linkSourceType?: LinkSourceType;
};

export function mapLinkAnalysisToResult(params: {
  linkAnalysis: LinkAnalysis;
  fallbackOriginalUrl?: string;
  jobId?: string | null;
}): LinkAnalysisResult {
  const { linkAnalysis, fallbackOriginalUrl = "", jobId = null } = params;

  return {
    analysisRequestId: linkAnalysis.analysisRequestId,
    linkId: linkAnalysis.linkId,
    jobId,
    originalUrl: resolveLinkAnalysisOriginalUrl(linkAnalysis.originalUrl, fallbackOriginalUrl),
    status: linkAnalysis.status,
    candidatePlaces: linkAnalysis.candidatePlaces,
    contentText: linkAnalysis.contentText ?? null,
    linkStats: linkAnalysis.linkStats,
    completed: true,
    errorCode: linkAnalysis.errorCode,
    errorMessage: resolveAnalysisErrorMessage(linkAnalysis),
    retryable: linkAnalysis.retryable,
    cooldownSeconds: linkAnalysis.cooldownSeconds,
    linkSourceType: linkAnalysis.linkSourceType,
  };
}

export function mapLinkAnalysisRequestToResult(params: {
  requested: LinkAnalysisRequestResult;
  originalUrl: string;
}): LinkAnalysisResult {
  const { requested, originalUrl } = params;

  return {
    analysisRequestId: requested.analysisRequestId,
    linkId: requested.linkId,
    jobId: requested.jobId ?? null,
    originalUrl: originalUrl.trim(),
    status: requested.status,
    candidatePlaces: [],
    contentText: null,
    linkStats: null,
    completed: true,
    errorCode: requested.errorCode,
    errorMessage: requested.errorMessage ?? resolveAnalysisErrorMessageFromStatus(requested.status),
    retryable: requested.retryable,
    cooldownSeconds: requested.cooldownSeconds,
  };
}

export function resolveLinkAnalysisOriginalUrl(
  apiOriginalUrl: string | null | undefined,
  fallbackOriginalUrl: string,
): string {
  const fromApi = apiOriginalUrl?.trim() ?? "";
  if (fromApi.length > 0) {
    return fromApi;
  }

  return fallbackOriginalUrl.trim();
}

function resolveAnalysisErrorMessage(linkAnalysis: LinkAnalysis): string | undefined {
  if (linkAnalysis.errorMessage) {
    return linkAnalysis.errorMessage;
  }

  return resolveAnalysisErrorMessageFromStatus(linkAnalysis.status);
}

export function resolveAnalysisErrorMessageFromStatus(
  status: LinkAnalysisStatus,
): string | undefined {
  if (status === "FAILED") {
    return "링크 분석에 실패했습니다";
  }

  if (status === "DISPATCH_FAILED") {
    return "분석 작업을 시작하지 못했습니다. 다시 시도해 주세요";
  }

  return undefined;
}

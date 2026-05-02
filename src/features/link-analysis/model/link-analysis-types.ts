import type {
  LinkAnalysis,
  LinkAnalysisDto,
  LinkAnalysisRequestResult,
  LinkAnalysisRequestResultDto,
  LinkAnalysisStatus,
} from "../types";

export const LINK_ANALYSIS_STATUS = {
  REQUESTED: "REQUESTED",
  PROCESSING: "PROCESSING",
  SUCCEEDED: "SUCCEEDED",
  FAILED: "FAILED",
  DISPATCH_FAILED: "DISPATCH_FAILED",
} as const satisfies Record<LinkAnalysisStatus, LinkAnalysisStatus>;

const POLLING_STATUSES = new Set<LinkAnalysisStatus>([
  LINK_ANALYSIS_STATUS.REQUESTED,
  LINK_ANALYSIS_STATUS.PROCESSING,
]);

const TERMINAL_STATUSES = new Set<LinkAnalysisStatus>([
  LINK_ANALYSIS_STATUS.SUCCEEDED,
  LINK_ANALYSIS_STATUS.FAILED,
  LINK_ANALYSIS_STATUS.DISPATCH_FAILED,
]);

export function shouldPollLinkAnalysis(status: LinkAnalysisStatus | undefined): boolean {
  return status != null && POLLING_STATUSES.has(status);
}

export function isLinkAnalysisTerminal(status: LinkAnalysisStatus | undefined): boolean {
  return status != null && TERMINAL_STATUSES.has(status);
}

export function canRetryLinkAnalysis(status: LinkAnalysisStatus | undefined): boolean {
  return status === LINK_ANALYSIS_STATUS.DISPATCH_FAILED;
}

export function toLinkAnalysisRequestResult(
  dto: LinkAnalysisRequestResultDto,
): LinkAnalysisRequestResult {
  return {
    linkId: dto.linkId,
    jobId: dto.jobId ?? undefined,
    status: dto.status,
  };
}

export function toLinkAnalysis(dto: LinkAnalysisDto): LinkAnalysis {
  return {
    linkId: dto.linkId,
    status: dto.status,
    caption: dto.caption ?? undefined,
    errorCode: dto.errorCode ?? undefined,
    errorMessage: dto.errorMessage ?? undefined,
  };
}

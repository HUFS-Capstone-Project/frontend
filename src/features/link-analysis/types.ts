import type { CommonResponse } from "@/shared/types/api-types";

export type LinkAnalysisStatus =
  | "REQUESTED"
  | "PROCESSING"
  | "SUCCEEDED"
  | "FAILED"
  | "DISPATCH_FAILED";

export type LinkAnalysisSource = "WEB";

export type RequestLinkAnalysisRequest = {
  url: string;
  source?: LinkAnalysisSource;
};

export type LinkAnalysisRequestResultDto = {
  linkId: number;
  jobId: string | null;
  status: LinkAnalysisStatus;
};

export type LinkAnalysisDto = {
  linkId: number;
  status: LinkAnalysisStatus;
  caption: string | null;
  errorCode: string | null;
  errorMessage: string | null;
};

export type LinkAnalysisRequestResult = {
  linkId: number;
  jobId?: string;
  status: LinkAnalysisStatus;
};

export type LinkAnalysis = {
  linkId: number;
  status: LinkAnalysisStatus;
  caption?: string;
  errorCode?: string;
  errorMessage?: string;
};

export type LinkAnalysisCommonResponse<T> = CommonResponse<T>;

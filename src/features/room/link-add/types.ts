import type { LinkAnalysisStatus, LinkStatusResponse } from "@/features/room/api";

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

export function mapLinkStatusToCaptionResult(linkStatus: LinkStatusResponse): CaptionResult {
  return {
    linkId: linkStatus.linkId,
    originalUrl: linkStatus.originalUrl,
    caption: linkStatus.caption,
    status: linkStatus.status,
    completed: linkStatus.completed,
    errorMessage:
      linkStatus.status === "FAILED"
        ? "캡션 추출에 실패했습니다. 잠시 후 다시 시도해 주세요."
        : null,
  };
}

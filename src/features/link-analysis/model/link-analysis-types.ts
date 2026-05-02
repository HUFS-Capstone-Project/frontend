import type {
  CandidatePlace,
  CandidatePlaceDto,
  LinkAnalysis,
  LinkAnalysisDto,
  LinkAnalysisRequestResult,
  LinkAnalysisRequestResultDto,
  LinkAnalysisStatus,
  SaveCandidatePlacesResponseDto,
  SaveCandidatePlacesResult,
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
    candidatePlaces: (dto.candidatePlaces ?? []).map(toCandidatePlace),
    errorCode: dto.errorCode ?? undefined,
    errorMessage: dto.errorMessage ?? undefined,
  };
}

export function toCandidatePlace(dto: CandidatePlaceDto): CandidatePlace {
  return {
    kakaoPlaceId: dto.kakaoPlaceId ?? undefined,
    placeName: dto.placeName,
    categoryName: dto.categoryName ?? undefined,
    categoryGroupCode: dto.categoryGroupCode ?? undefined,
    categoryGroupName: dto.categoryGroupName ?? undefined,
    addressName: dto.addressName ?? undefined,
    roadAddressName: dto.roadAddressName ?? undefined,
    longitude: dto.longitude ?? undefined,
    latitude: dto.latitude ?? undefined,
    phone: dto.phone ?? undefined,
    placeUrl: dto.placeUrl ?? undefined,
    sourceKeyword: dto.sourceKeyword ?? undefined,
    alreadySaved: dto.alreadySaved,
    selectable: dto.selectable,
    roomPlaceId: dto.roomPlaceId ?? undefined,
    disabledReason: dto.disabledReason ?? undefined,
  };
}

export function toSaveCandidatePlacesResult(
  dto: SaveCandidatePlacesResponseDto,
): SaveCandidatePlacesResult {
  return {
    linkId: dto.linkId,
    places: dto.places.map((place) => ({
      roomPlaceId: place.roomPlaceId,
      kakaoPlaceId: place.kakaoPlaceId,
      placeName: place.placeName,
      created: place.created,
      alreadySaved: place.alreadySaved,
    })),
  };
}

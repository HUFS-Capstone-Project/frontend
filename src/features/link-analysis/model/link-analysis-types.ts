import type {
  CandidatePlace,
  CandidatePlaceDto,
  LinkAnalysis,
  LinkAnalysisDto,
  LinkAnalysisRequestResult,
  LinkAnalysisRequestResultDto,
  LinkAnalysisStatus,
  LinkStats,
  LinkStatsDto,
  OverrideCandidatePlaceResponseDto,
  OverrideCandidatePlaceResult,
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
  return status === LINK_ANALYSIS_STATUS.FAILED || status === LINK_ANALYSIS_STATUS.DISPATCH_FAILED;
}

export function toLinkAnalysisRequestResult(
  dto: LinkAnalysisRequestResultDto,
): LinkAnalysisRequestResult {
  return {
    analysisRequestId: dto.analysisRequestId,
    linkId: dto.linkId,
    jobId: dto.jobId ?? undefined,
    status: dto.status,
  };
}

export function toLinkAnalysis(dto: LinkAnalysisDto, analysisRequestId: number): LinkAnalysis {
  return {
    analysisRequestId,
    linkId: dto.linkId,
    status: dto.status,
    originalUrl: normalizeOptionalString(dto.originalUrl),
    candidatePlaces: dto.candidatePlaces.map(toCandidatePlace),
    contentText: dto.contentText ?? null,
    linkStats: toLinkStats(dto.linkStats),
    errorCode: dto.errorCode ?? undefined,
    errorMessage: dto.errorMessage ?? undefined,
  };
}

export function toLinkStats(dto: LinkStatsDto | null | undefined): LinkStats | null {
  if (dto == null) {
    return null;
  }

  return {
    likeCount: dto.likeCount,
    commentCount: dto.commentCount,
    postedAt: dto.postedAt,
  };
}

export function toCandidatePlace(dto: CandidatePlaceDto): CandidatePlace {
  const kakaoPlaceId = normalizeOptionalString(dto.kakaoPlaceId);

  return {
    candidateId: dto.candidateId,
    overrideId: dto.overrideId,
    kakaoPlaceId,
    placeName: dto.placeName,
    categoryName: dto.categoryName,
    categoryGroupCode: dto.categoryGroupCode,
    serviceCategoryCode: dto.serviceCategoryCode,
    serviceCategoryName: dto.serviceCategoryName,
    addressName: dto.addressName,
    roadAddressName: dto.roadAddressName,
    longitude: dto.longitude,
    latitude: dto.latitude,
    phone: dto.phone,
    placeUrl: dto.placeUrl,
    alreadyInRoom: dto.alreadyInRoom,
    selectable: dto.selectable,
    originalCandidate: dto.originalCandidate,
    corrected: dto.corrected,
    editable: dto.editable,
    roomPlaceId: dto.roomPlaceId,
    disabledReason: dto.disabledReason,
  };
}

export function canSelectCandidatePlace(place: CandidatePlace): place is CandidatePlace & {
  kakaoPlaceId: string;
} {
  return place.selectable && !place.alreadyInRoom && hasKakaoPlaceId(place);
}

export function hasKakaoPlaceId(place: CandidatePlace): place is CandidatePlace & {
  kakaoPlaceId: string;
} {
  return typeof place.kakaoPlaceId === "string" && place.kakaoPlaceId.trim().length > 0;
}

export function canEditCandidatePlace(place: CandidatePlace): place is CandidatePlace & {
  candidateId: number;
} {
  return place.editable && typeof place.candidateId === "number";
}

export function toOverrideCandidatePlaceResult(
  dto: OverrideCandidatePlaceResponseDto,
): OverrideCandidatePlaceResult {
  return {
    candidateId: dto.candidateId,
    overrideId: dto.overrideId,
    kakaoPlaceId: dto.kakaoPlaceId,
    name: dto.name,
  };
}

export function toSaveCandidatePlacesResult(
  dto: SaveCandidatePlacesResponseDto,
): SaveCandidatePlacesResult {
  return {
    analysisRequestId: dto.analysisRequestId,
    linkId: dto.linkId,
    places: dto.places.map((place) => ({
      roomPlaceId: place.roomPlaceId,
      placeId: place.placeId,
      kakaoPlaceId: place.kakaoPlaceId,
      placeName: place.placeName,
      created: place.created,
      alreadyInRoom: place.alreadyInRoom,
    })),
  };
}

function normalizeOptionalString(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

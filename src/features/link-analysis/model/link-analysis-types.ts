import type {
  CandidatePlace,
  CandidatePlaceDisabledReason,
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
  return status === LINK_ANALYSIS_STATUS.FAILED || status === LINK_ANALYSIS_STATUS.DISPATCH_FAILED;
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
    candidatePlaces: (dto.candidatePlaces ?? []).map(toCandidatePlace),
    errorCode: dto.errorCode ?? undefined,
    errorMessage: dto.errorMessage ?? undefined,
  };
}

export function toCandidatePlace(dto: CandidatePlaceDto): CandidatePlace {
  const kakaoPlaceId = normalizeOptionalString(dto.kakaoPlaceId);
  const alreadySaved = dto.alreadySaved === true;
  const disabledReason = resolveCandidatePlaceDisabledReason({
    alreadySaved,
    disabledReason: dto.disabledReason ?? null,
    kakaoPlaceId,
  });

  return {
    kakaoPlaceId,
    placeName: dto.placeName,
    categoryName: dto.categoryName ?? null,
    categoryGroupCode: dto.categoryGroupCode ?? null,
    categoryGroupName: dto.categoryGroupName ?? null,
    addressName: dto.addressName ?? null,
    roadAddressName: dto.roadAddressName ?? null,
    longitude: dto.longitude ?? null,
    latitude: dto.latitude ?? null,
    phone: dto.phone ?? null,
    placeUrl: dto.placeUrl ?? null,
    sourceKeyword: dto.sourceKeyword ?? null,
    alreadySaved,
    selectable: dto.selectable === true && disabledReason == null,
    roomPlaceId: dto.roomPlaceId ?? null,
    disabledReason,
  };
}

export function canSelectCandidatePlace(place: CandidatePlace): place is CandidatePlace & {
  kakaoPlaceId: string;
} {
  return place.selectable && !place.alreadySaved && hasKakaoPlaceId(place);
}

export function hasKakaoPlaceId(place: CandidatePlace): place is CandidatePlace & {
  kakaoPlaceId: string;
} {
  return typeof place.kakaoPlaceId === "string" && place.kakaoPlaceId.trim().length > 0;
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

function normalizeOptionalString(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function resolveCandidatePlaceDisabledReason(params: {
  alreadySaved: boolean;
  disabledReason: CandidatePlaceDisabledReason | null;
  kakaoPlaceId: string | null;
}): CandidatePlaceDisabledReason | null {
  if (params.disabledReason) {
    return params.disabledReason;
  }

  if (params.alreadySaved) {
    return "ALREADY_SAVED";
  }

  if (!params.kakaoPlaceId) {
    return "MISSING_KAKAO_PLACE_ID";
  }

  return null;
}

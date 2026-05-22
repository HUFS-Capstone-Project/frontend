import type { LinkSourceType } from "@/shared/lib/link-source-type";
import type { CommonResponse } from "@/shared/types/api-types";
import type { ServiceCategoryCode } from "@/shared/types/map-home";

export type LinkAnalysisStatus =
  | "REQUESTED"
  | "PROCESSING"
  | "SUCCEEDED"
  | "FAILED"
  | "DISPATCH_FAILED";

export type LinkAnalysisSource = "WEB" | "APP";

export type RequestLinkAnalysisRequest = {
  originalUrl: string;
  source?: LinkAnalysisSource;
};

export type LinkAnalysisRequestResultDto = {
  analysisRequestId: number;
  linkId: number;
  jobId: string | null;
  status: LinkAnalysisStatus;
  errorCode?: string | null;
  errorMessage?: string | null;
  retryable?: boolean | null;
  cooldownSeconds?: number | null;
  linkSourceType?: LinkSourceType | null;
};

export type LinkAnalysisDto = {
  linkId: number;
  status: LinkAnalysisStatus;
  originalUrl?: string | null;
  contentText?: string | null;
  linkStats: LinkStatsDto | null;
  candidatePlaces: CandidatePlaceDto[];
  errorCode: string | null;
  errorMessage: string | null;
  retryable?: boolean | null;
  cooldownSeconds?: number | null;
  linkSourceType?: LinkSourceType | null;
};

export type LinkStatsDto = {
  likeCount: number | null;
  commentCount: number | null;
  postedAt: string | null;
};

export type CandidatePlaceDisabledReason =
  | "ALREADY_IN_ROOM"
  | "MISSING_KAKAO_PLACE_ID"
  | (string & {});

export type CandidatePlaceDto = {
  candidateId: number | null;
  overrideId: number | null;
  kakaoPlaceId: string | null;
  placeName: string | null;
  categoryName: string | null;
  categoryGroupCode: string | null;
  serviceCategoryCode: ServiceCategoryCode;
  serviceCategoryName: string;
  addressName: string | null;
  roadAddressName: string | null;
  longitude: number | null;
  latitude: number | null;
  phone: string | null;
  placeUrl: string | null;
  alreadyInRoom: boolean;
  selectable: boolean;
  originalCandidate: boolean;
  corrected: boolean;
  editable: boolean;
  roomPlaceId: number | null;
  disabledReason: CandidatePlaceDisabledReason | null;
};

export type LinkAnalysisRequestResult = {
  analysisRequestId: number;
  linkId: number;
  jobId?: string;
  status: LinkAnalysisStatus;
  errorCode?: string;
  errorMessage?: string;
  retryable?: boolean;
  cooldownSeconds?: number;
  linkSourceType?: LinkSourceType;
};

export type LinkAnalysis = {
  analysisRequestId: number;
  linkId: number;
  status: LinkAnalysisStatus;
  originalUrl: string | null;
  candidatePlaces: CandidatePlace[];
  contentText?: string | null;
  linkStats: LinkStats | null;
  errorCode?: string;
  errorMessage?: string;
  retryable?: boolean;
  cooldownSeconds?: number;
  linkSourceType?: LinkSourceType;
};

export type LinkStats = {
  likeCount: number | null;
  commentCount: number | null;
  postedAt: string | null;
};

export type CandidatePlace = {
  candidateId: number | null;
  overrideId: number | null;
  kakaoPlaceId: string | null;
  placeName: string | null;
  categoryName: string | null;
  categoryGroupCode: string | null;
  serviceCategoryCode: ServiceCategoryCode;
  serviceCategoryName: string;
  addressName: string | null;
  roadAddressName: string | null;
  longitude: number | null;
  latitude: number | null;
  phone: string | null;
  placeUrl: string | null;
  alreadyInRoom: boolean;
  selectable: boolean;
  originalCandidate: boolean;
  corrected: boolean;
  editable: boolean;
  roomPlaceId: number | null;
  disabledReason: CandidatePlaceDisabledReason | null;
};

export type OverrideCandidatePlaceRequest = {
  kakaoPlaceId: string;
  name: string;
  address?: string | null;
  roadAddress?: string | null;
  latitude: number;
  longitude: number;
  categoryName?: string | null;
  categoryGroupCode?: string | null;
  phone?: string | null;
  placeUrl?: string | null;
};

export type OverrideCandidatePlaceResponseDto = {
  candidateId: number;
  overrideId: number;
  kakaoPlaceId: string;
  name: string;
};

export type OverrideCandidatePlaceResult = OverrideCandidatePlaceResponseDto;

export type SaveCandidatePlacesRequest = {
  kakaoPlaceIds: string[];
};

export type SavedCandidatePlaceDto = {
  roomPlaceId: number;
  placeId: number | null;
  kakaoPlaceId: string;
  placeName: string;
  created: boolean;
  alreadyInRoom: boolean;
};

export type SaveCandidatePlacesResponseDto = {
  analysisRequestId: number;
  linkId: number;
  places: SavedCandidatePlaceDto[];
};

export type SavedCandidatePlace = {
  roomPlaceId: number;
  placeId: number | null;
  kakaoPlaceId: string;
  placeName: string;
  created: boolean;
  alreadyInRoom: boolean;
};

export type SaveCandidatePlacesResult = {
  analysisRequestId: number;
  linkId: number;
  places: SavedCandidatePlace[];
};

export type SaveManualPlaceRequest = {
  kakaoPlaceId: string;
  name: string;
  address?: string | null;
  roadAddress?: string | null;
  latitude: number;
  longitude: number;
  categoryName?: string | null;
  categoryGroupCode?: string | null;
  phone?: string | null;
  placeUrl?: string | null;
};

export type LinkAnalysisCommonResponse<T> = CommonResponse<T>;

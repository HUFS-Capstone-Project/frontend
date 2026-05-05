import type { CommonResponse } from "@/shared/types/api-types";

export type LinkAnalysisStatus =
  | "REQUESTED"
  | "PROCESSING"
  | "SUCCEEDED"
  | "FAILED"
  | "DISPATCH_FAILED";

export type LinkAnalysisSource = "WEB" | "APP";

export type RequestLinkAnalysisRequest = {
  url: string;
  source?: LinkAnalysisSource;
};

export type LinkAnalysisRequestResultDto = {
  analysisRequestId: number;
  linkId: number;
  jobId: string | null;
  status: LinkAnalysisStatus;
};

export type LinkAnalysisDto = {
  linkId: number;
  status: LinkAnalysisStatus;
  candidatePlaces?: CandidatePlaceDto[] | null;
  errorCode: string | null;
  errorMessage: string | null;
};

export type CandidatePlaceDisabledReason =
  | "ALREADY_IN_ROOM"
  | "MISSING_KAKAO_PLACE_ID"
  | (string & {});

export type CandidatePlaceDto = {
  kakaoPlaceId?: string | null;
  placeName: string;
  categoryName?: string | null;
  categoryGroupCode?: string | null;
  categoryGroupName?: string | null;
  addressName?: string | null;
  roadAddressName?: string | null;
  longitude?: number | null;
  latitude?: number | null;
  phone?: string | null;
  placeUrl?: string | null;
  sourceKeyword?: string | null;
  alreadyInRoom?: boolean | null;
  selectable?: boolean | null;
  roomPlaceId?: number | null;
  disabledReason?: CandidatePlaceDisabledReason | null;
};

export type LinkAnalysisRequestResult = {
  analysisRequestId: number;
  linkId: number;
  jobId?: string;
  status: LinkAnalysisStatus;
};

export type LinkAnalysis = {
  analysisRequestId: number;
  linkId: number;
  status: LinkAnalysisStatus;
  candidatePlaces: CandidatePlace[];
  errorCode?: string;
  errorMessage?: string;
};

export type CandidatePlace = {
  kakaoPlaceId: string | null;
  placeName: string;
  categoryName: string | null;
  categoryGroupCode: string | null;
  categoryGroupName: string | null;
  addressName: string | null;
  roadAddressName: string | null;
  longitude: number | null;
  latitude: number | null;
  phone: string | null;
  placeUrl: string | null;
  sourceKeyword: string | null;
  alreadyInRoom: boolean;
  selectable: boolean;
  roomPlaceId: number | null;
  disabledReason: CandidatePlaceDisabledReason | null;
};

export type SaveCandidatePlacesRequest = {
  kakaoPlaceIds: string[];
};

export type SavedCandidatePlaceDto = {
  roomPlaceId: number;
  placeId?: number;
  kakaoPlaceId: string;
  name?: string;
  placeName?: string;
  created: boolean;
  alreadyInRoom?: boolean;
  alreadySaved?: boolean;
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
  categoryGroupName?: string | null;
  phone?: string | null;
  placeUrl?: string | null;
  sourceKeyword?: string | null;
};

export type LinkAnalysisCommonResponse<T> = CommonResponse<T>;

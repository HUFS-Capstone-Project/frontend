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
  candidatePlaces?: CandidatePlaceDto[] | null;
  errorCode: string | null;
  errorMessage: string | null;
};

export type CandidatePlaceDisabledReason = "ALREADY_SAVED" | "MISSING_KAKAO_PLACE_ID";

export type CandidatePlaceDto = {
  kakaoPlaceId: string | null;
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
  alreadySaved: boolean;
  selectable: boolean;
  roomPlaceId: number | null;
  disabledReason: CandidatePlaceDisabledReason | null;
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
  candidatePlaces: CandidatePlace[];
  errorCode?: string;
  errorMessage?: string;
};

export type CandidatePlace = {
  kakaoPlaceId?: string;
  placeName: string;
  categoryName?: string;
  categoryGroupCode?: string;
  categoryGroupName?: string;
  addressName?: string;
  roadAddressName?: string;
  longitude?: number;
  latitude?: number;
  phone?: string;
  placeUrl?: string;
  sourceKeyword?: string;
  alreadySaved: boolean;
  selectable: boolean;
  roomPlaceId?: number;
  disabledReason?: CandidatePlaceDisabledReason;
};

export type SaveCandidatePlacesRequest = {
  kakaoPlaceIds: string[];
};

export type SavedCandidatePlaceDto = {
  roomPlaceId: number;
  kakaoPlaceId: string;
  placeName: string;
  created: boolean;
  alreadySaved: boolean;
};

export type SaveCandidatePlacesResponseDto = {
  linkId: number;
  places: SavedCandidatePlaceDto[];
};

export type SavedCandidatePlace = {
  roomPlaceId: number;
  kakaoPlaceId: string;
  placeName: string;
  created: boolean;
  alreadySaved: boolean;
};

export type SaveCandidatePlacesResult = {
  linkId: number;
  places: SavedCandidatePlace[];
};

export type LinkAnalysisCommonResponse<T> = CommonResponse<T>;

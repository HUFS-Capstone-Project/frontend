export type ExternalPlaceCandidateDto = {
  kakaoPlaceId: string;
  name: string;
  address: string | null;
  roadAddress: string | null;
  latitude: number;
  longitude: number;
  categoryName: string | null;
  categoryGroupCode: string | null;
  categoryGroupName: string | null;
  phone: string | null;
  placeUrl: string | null;
  source: string;
  alreadyInRoom: boolean;
  roomPlaceId: number | null;
  selectable: boolean;
  disabledReason: string | null;
};

export type ExternalPlaceCandidate = ExternalPlaceCandidateDto;

export type ExternalPlaceCandidateParams = {
  keyword: string;
  limit?: number;
};

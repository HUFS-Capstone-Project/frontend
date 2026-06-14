export const userQueryKeys = {
  all: ["user"] as const,
  me: () => [...userQueryKeys.all, "me"] as const,
  myPlacesRoot: () => [...userQueryKeys.me(), "places"] as const,
  myPlaces: (params: UserPlaceListQueryKeyParams) =>
    [...userQueryKeys.myPlacesRoot(), params] as const,
};

export type UserPlaceListQueryKeyParams = {
  keyword: string;
  category: string;
  categoryCode: string;
  tagCode: string;
  sidoCode: string;
  sigunguCode: string;
  limit: number;
};

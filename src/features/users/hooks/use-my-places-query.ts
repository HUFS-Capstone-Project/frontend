import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { useAuthStore } from "@/store/auth-store";

import { usersApi } from "../api/users-api";
import { userQueryKeys } from "../query-keys";
import type {
  NormalizedUserPlaceListParams,
  UserPlaceListParams,
  UserPlaceListResponse,
} from "../types/user-place";

const DEFAULT_MY_PLACE_LIMIT = 20;

type MyPlacesQueryKey = ReturnType<typeof userQueryKeys.myPlaces>;

type UseMyPlacesQueryOptions = {
  params?: UserPlaceListParams;
  enabled?: boolean;
  queryOptions?: Omit<
    UseQueryOptions<UserPlaceListResponse, unknown, UserPlaceListResponse, MyPlacesQueryKey>,
    "queryKey" | "queryFn" | "enabled"
  >;
};

export function normalizeUserPlaceListParams(
  params: UserPlaceListParams = {},
): NormalizedUserPlaceListParams {
  return {
    keyword: params.keyword?.trim() ?? "",
    category: params.category?.trim() ?? "",
    categoryCode: params.categoryCode?.trim() ?? "",
    tagCode: params.tagCode?.trim() ?? "",
    sidoCode: params.sidoCode?.trim() ?? "",
    sigunguCode: params.sigunguCode?.trim() ?? "",
    page: params.page ?? 0,
    size: params.size ?? params.limit ?? DEFAULT_MY_PLACE_LIMIT,
  };
}

export function useMyPlacesQuery(options?: UseMyPlacesQueryOptions) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const accessToken = useAuthStore((s) => s.accessToken);
  const normalizedParams = normalizeUserPlaceListParams(options?.params);

  return useQuery({
    queryKey: userQueryKeys.myPlaces(normalizedParams),
    queryFn: () => usersApi.getMyPlaces(normalizedParams),
    enabled: (options?.enabled ?? true) && isLoggedIn && Boolean(accessToken),
    ...(options?.queryOptions ?? {}),
  });
}

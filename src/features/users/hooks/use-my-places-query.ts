import {
  type InfiniteData,
  useInfiniteQuery,
  type UseInfiniteQueryOptions,
} from "@tanstack/react-query";

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
    UseInfiniteQueryOptions<
      UserPlaceListResponse,
      Error,
      InfiniteData<UserPlaceListResponse, string | null>,
      MyPlacesQueryKey,
      string | null
    >,
    "queryKey" | "queryFn" | "enabled" | "initialPageParam" | "getNextPageParam"
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
    limit: params.limit ?? DEFAULT_MY_PLACE_LIMIT,
    cursor: params.cursor?.trim() || null,
  };
}

function toQueryKeyParams(params: NormalizedUserPlaceListParams) {
  return {
    keyword: params.keyword,
    category: params.category,
    categoryCode: params.categoryCode,
    tagCode: params.tagCode,
    sidoCode: params.sidoCode,
    sigunguCode: params.sigunguCode,
    limit: params.limit,
  };
}

export function useMyPlacesQuery(options?: UseMyPlacesQueryOptions) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const accessToken = useAuthStore((s) => s.accessToken);
  const normalizedParams = normalizeUserPlaceListParams(options?.params);

  return useInfiniteQuery<
    UserPlaceListResponse,
    Error,
    InfiniteData<UserPlaceListResponse, string | null>,
    MyPlacesQueryKey,
    string | null
  >({
    queryKey: userQueryKeys.myPlaces(toQueryKeyParams(normalizedParams)),
    queryFn: ({ pageParam }) =>
      usersApi.getMyPlaces({
        ...normalizedParams,
        cursor: pageParam,
      }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor : undefined),
    enabled: (options?.enabled ?? true) && isLoggedIn && Boolean(accessToken),
    ...(options?.queryOptions ?? {}),
  });
}

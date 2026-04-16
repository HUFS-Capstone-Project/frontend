import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { useAuthStore } from "@/store/auth-store";

import { usersApi } from "../api/users-api";
import { userQueryKeys } from "../query-keys";
import type { UserMe } from "../types/user-me";

type UseUserMeQueryOptions = {
  enabled?: boolean;
  queryOptions?: Omit<
    UseQueryOptions<UserMe, unknown, UserMe, ReturnType<typeof userQueryKeys.me>>,
    "queryKey" | "queryFn" | "enabled"
  >;
};

export function useUserMeQuery(options?: UseUserMeQueryOptions) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: userQueryKeys.me(),
    queryFn: usersApi.getMe,
    enabled: (options?.enabled ?? true) && isLoggedIn && Boolean(accessToken),
    ...(options?.queryOptions ?? {}),
  });
}

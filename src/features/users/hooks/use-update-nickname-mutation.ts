import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/store/auth-store";

import { usersApi } from "../api/users-api";
import { userQueryKeys } from "../query-keys";

export function useUpdateNicknameMutation() {
  const queryClient = useQueryClient();
  const setNickname = useAuthStore((s) => s.setNickname);

  return useMutation({
    mutationKey: [...userQueryKeys.all, "nickname", "update"],
    mutationFn: usersApi.updateNickname,
    onSuccess: (me) => {
      setNickname(me.nickname);
      queryClient.setQueryData(userQueryKeys.me(), me);
    },
  });
}

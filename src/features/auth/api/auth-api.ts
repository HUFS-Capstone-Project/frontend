import { API_PATHS } from "@/shared/api/api-paths";
import { api } from "@/shared/api/axios";
import { getXsrfHeader, withCsrfRetry } from "@/shared/api/csrf";

export const authApi = {
  logoutAll: async (): Promise<void> => {
    await withCsrfRetry(async () => {
      await api.post(API_PATHS.auth.logoutAll, undefined, {
        headers: getXsrfHeader(),
      });
    });
  },
};

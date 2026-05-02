import { API_PATHS } from "@/shared/api/api-paths";
import { api } from "@/shared/api/axios";

export const authApi = {
  logoutAll: async (): Promise<void> => {
    await api.post(API_PATHS.auth.logoutAll);
  },
};

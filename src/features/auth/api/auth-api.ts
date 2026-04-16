import { api } from "@/shared/api/axios";

export const authApi = {
  logoutAll: async (): Promise<void> => {
    await api.post("/v1/auth/logout-all");
  },
};

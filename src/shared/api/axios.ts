import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { mobileAuthApi } from "@/features/auth/api/mobile-auth-api";
import { getRuntimeAuthChannel } from "@/features/auth/lib/auth-channel";
import { clearMobileAuthArtifacts } from "@/features/auth/lib/mobile-auth-cleanup";
import { resolveMobileRefreshToken } from "@/features/auth/lib/mobile-refresh-token";
import { mobileRefreshTokenStorage } from "@/features/auth/lib/mobile-refresh-token-storage";
import { applyMobileTokenResponse } from "@/features/auth/lib/mobile-token-response";
import { clearAuthenticatedSessionData } from "@/features/auth/lib/session-cleanup";
import type { TokenResponse } from "@/features/auth/types";
import { API_PATHS } from "@/shared/api/api-paths";
import { normalizeAxiosError } from "@/shared/api/error";
import { appQueryClient } from "@/shared/lib/query-client";
import type { ApiErrorResponse, CommonResponse } from "@/shared/types/api-types";
import { useAuthStore } from "@/store/auth-store";

import { getApiBaseURL } from "./base-url";
import { ensureCsrfCookie, webAuthClient } from "./web-auth-client";

export { type ApiError, isApiError } from "@/shared/api/error";

const hasProdApiEnv = Boolean(import.meta.env.VITE_MOBILE_API_BASE_URL?.trim());

const webUsesRelativeApi = getRuntimeAuthChannel() !== "mobile" && getApiBaseURL() === "/api";

if (import.meta.env.PROD && !hasProdApiEnv && !webUsesRelativeApi) {
  console.warn("[udidura] 프로덕션 빌드에 API base 환경 변수가 없습니다. (모바일 빌드 등)");
}

/** Bearer 주입, 401 발생 시 채널별 refresh 후 1회 재시도 */
export const api = axios.create({
  baseURL: getApiBaseURL(),
  timeout: 25_000,
  withCredentials: getRuntimeAuthChannel() !== "mobile",
  headers: {
    "Content-Type": "application/json",
  },
});

type RefreshQueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let refreshQueue: RefreshQueueItem[] = [];

function resolveRefreshQueue(token: string) {
  refreshQueue.forEach(({ resolve }) => resolve(token));
  refreshQueue = [];
}

function rejectRefreshQueue(error: unknown) {
  refreshQueue.forEach(({ reject }) => reject(error));
  refreshQueue = [];
}

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (getRuntimeAuthChannel() === "mobile") {
      config.withCredentials = false;
      config.headers["X-Client-Platform"] = "android";
    }

    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

type RetryableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const status = error.response?.status;
    const originalConfig = error.config as RetryableConfig | undefined;

    if (status !== 401 || !originalConfig || originalConfig._retried) {
      return Promise.reject(normalizeAxiosError(error));
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token) => {
            originalConfig.headers = originalConfig.headers ?? {};
            (originalConfig.headers as Record<string, string>).Authorization = `Bearer ${token}`;
            resolve(api(originalConfig));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    originalConfig._retried = true;

    try {
      const channel = useAuthStore.getState().authChannel ?? "web";
      const newToken =
        channel === "mobile" ? await refreshMobileAccessToken() : await refreshWebAccessToken();

      useAuthStore.getState().setAccessToken(newToken);
      resolveRefreshQueue(newToken);

      originalConfig.headers = originalConfig.headers ?? {};
      (originalConfig.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
      return api(originalConfig);
    } catch {
      if ((useAuthStore.getState().authChannel ?? "web") === "mobile") {
        await clearMobileAuthArtifacts();
      }
      useAuthStore.getState().logout();
      await clearAuthenticatedSessionData(appQueryClient);
      rejectRefreshQueue(new Error("refresh failed"));
      return Promise.reject(normalizeAxiosError(error));
    } finally {
      isRefreshing = false;
    }
  },
);

async function refreshWebAccessToken(): Promise<string> {
  await ensureCsrfCookie();
  const res = await webAuthClient.post<CommonResponse<TokenResponse>>(API_PATHS.auth.refresh);
  return res.data.data.accessToken;
}

async function refreshMobileAccessToken(): Promise<string> {
  const rt = await resolveMobileRefreshToken();
  if (!rt) {
    throw new Error("no mobile refresh token");
  }
  const wrapper = await mobileAuthApi.refresh({ refreshToken: rt });
  const tr = wrapper.data;
  const fallbackRefreshTokenExpiresAt = await mobileRefreshTokenStorage.getRefreshTokenExpiresAt();
  await applyMobileTokenResponse(tr, {
    fallbackRefreshToken: rt,
    fallbackRefreshTokenExpiresAt,
  });
  return tr.accessToken;
}

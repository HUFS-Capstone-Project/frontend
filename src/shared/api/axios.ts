import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { mobileAuthApi } from "@/features/auth/api/mobileAuthApi";
import { resolveMobileRefreshToken } from "@/features/auth/lib/mobileRefreshToken";
import type { TokenResponse } from "@/features/auth/types";
import type { CommonResponse } from "@/shared/types/api.types";
import { useAuthStore } from "@/store/authStore";

import { getApiBaseURL } from "./baseURL";
import { ensureCsrfCookie, webAuthClient } from "./webAuthClient";

const hasProdApiEnv =
  Boolean(import.meta.env.VITE_WEB_API_BASE_URL?.trim()) ||
  Boolean(import.meta.env.VITE_MOBILE_API_BASE_URL?.trim());

if (import.meta.env.PROD && !hasProdApiEnv) {
  console.warn(
    "[udidura] 프로덕션 빌드에 API base가 없습니다. VITE_WEB_API_BASE_URL 또는 VITE_MOBILE_API_BASE_URL을 설정하세요.",
  );
}

/** Bearer 주입, 401 시 웹·모바일 채널별 refresh 후 재시도. */
export const api = axios.create({
  baseURL: getApiBaseURL(),
  timeout: 25_000,
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
  async (error: AxiosError<{ message?: string; code?: string }>) => {
    const status = error.response?.status;
    const originalConfig = error.config as RetryableConfig | undefined;

    if (status !== 401 || !originalConfig || originalConfig._retried) {
      return Promise.reject(normalizeAxiosError(error));
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token) => {
            originalConfig.headers.Authorization = `Bearer ${token}`;
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
        channel === "mobile"
          ? await refreshMobileAccessToken()
          : await refreshWebAccessToken();

      useAuthStore.getState().setAccessToken(newToken);
      resolveRefreshQueue(newToken);

      originalConfig.headers.Authorization = `Bearer ${newToken}`;
      return api(originalConfig);
    } catch {
      useAuthStore.getState().logout();
      rejectRefreshQueue(new Error("refresh failed"));
      return Promise.reject(normalizeAxiosError(error));
    } finally {
      isRefreshing = false;
    }
  },
);

async function refreshWebAccessToken(): Promise<string> {
  await ensureCsrfCookie();
  const res = await webAuthClient.post<CommonResponse<TokenResponse>>("/v1/auth/refresh");
  return res.data.data.accessToken;
}

async function refreshMobileAccessToken(): Promise<string> {
  const rt = await resolveMobileRefreshToken();
  if (!rt) {
    throw new Error("no mobile refresh token");
  }
  const wrapper = await mobileAuthApi.refresh({ refreshToken: rt });
  const tr = wrapper.data;
  if (tr.refreshToken) {
    useAuthStore.getState().setRefreshToken(tr.refreshToken);
  }
  return tr.accessToken;
}

export type ApiError = {
  status?: number;
  code?: string;
  message: string;
  original: unknown;
};

function normalizeAxiosError(
  error: AxiosError<{ message?: string; code?: string }>,
): ApiError {
  const data = error.response?.data;
  const message =
    (typeof data?.message === "string" && data.message) ||
    error.message ||
    "요청 처리 중 오류가 발생했습니다.";

  return {
    status: error.response?.status,
    code: typeof data?.code === "string" ? data.code : undefined,
    message,
    original: error,
  };
}

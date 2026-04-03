import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL && import.meta.env.PROD) {
  console.warn("[udidura] VITE_API_BASE_URL is not set in production build.");
}

export const api = axios.create({
  baseURL: baseURL || "/api",
  timeout: 25_000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // TODO: 액세스 토큰이 생기면 여기서 Authorization 헤더 주입
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; code?: string }>) => {
    const status = error.response?.status;

    if (status === 401) {
      // TODO: 로그인/리프레시 플로우 연동 시 리다이렉트 또는 토큰 갱신
    }

    return Promise.reject(normalizeAxiosError(error));
  },
);

export type ApiError = {
  status?: number;
  code?: string;
  message: string;
  original: unknown;
};

function normalizeAxiosError(error: AxiosError<{ message?: string; code?: string }>): ApiError {
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

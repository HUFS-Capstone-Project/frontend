import axios, { type InternalAxiosRequestConfig } from "axios";

import { getCookie, XSRF_COOKIE_NAME, XSRF_HEADER_NAME } from "@/shared/lib/cookie";

import { getWebAuthBaseURL } from "./base-url";

/** 웹 인증: `withCredentials`, CSRF는 쿠키 `XSRF-TOKEN` ↔ 헤더 `X-XSRF-TOKEN` 동일 문자열. 값은 항상 `document.cookie`만 사용. */

function setXsrfHeader(config: InternalAxiosRequestConfig, token: string): void {
  const h = config.headers;
  if (h && typeof h.set === "function") {
    h.set(XSRF_HEADER_NAME, token);
  } else {
    (h as Record<string, string>)[XSRF_HEADER_NAME] = token;
  }
}

function hasXsrfHeader(config: InternalAxiosRequestConfig): boolean {
  const h = config.headers;
  if (h && typeof h.get === "function") {
    return Boolean(h.get(XSRF_HEADER_NAME) ?? h.get("x-xsrf-token"));
  }
  const raw = h as Record<string, string | undefined>;
  return Boolean(raw[XSRF_HEADER_NAME] ?? raw["x-xsrf-token"]);
}

/** 인터셉터에서 CSRF 자동 주입을 건너뛸 경로 (마지막 세그먼트까지 일치). `/csrf`에 대한 mutating 요청만 방어적으로 스킵. */
const SKIP_CSRF_TAIL = {
  csrf: ["v1", "auth", "csrf"] as const,
};

/**
 * Axios `config.url`은 상대·절대가 섞일 수 있음. `baseURL`과 합쳐 pathname만 뽑는다.
 */
function getRequestPathname(config: InternalAxiosRequestConfig): string {
  const raw = config.url ?? "";
  if (!raw) return "";

  const withoutQuery = raw.split("?")[0] ?? "";

  if (withoutQuery.startsWith("http://") || withoutQuery.startsWith("https://")) {
    try {
      return new URL(withoutQuery).pathname;
    } catch {
      return "";
    }
  }

  const base = String(config.baseURL ?? "").replace(/\/$/, "");
  const path = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  const merged = `${base}${path}`.replace(/([^:]\/)\/+/g, "$1");

  if (merged.startsWith("http://") || merged.startsWith("https://")) {
    try {
      return new URL(merged).pathname;
    } catch {
      return "";
    }
  }

  try {
    return new URL(merged, "http://localhost").pathname;
  } catch {
    return merged;
  }
}

function pathnameEndsWithSegments(pathname: string, tail: readonly string[]): boolean {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length < tail.length) return false;
  for (let i = 0; i < tail.length; i++) {
    if (parts[parts.length - tail.length + i] !== tail[i]) return false;
  }
  return true;
}

function shouldSkipInterceptorCsrfInjection(config: InternalAxiosRequestConfig): boolean {
  const pathname = getRequestPathname(config);
  return pathnameEndsWithSegments(pathname, SKIP_CSRF_TAIL.csrf);
}

export const webAuthClient = axios.create({
  baseURL: getWebAuthBaseURL(),
  timeout: 15_000,
  withCredentials: true,
});

/** 동시에 쿠키가 비어 있거나 forceRefresh로 GET /csrf가 필요할 때 한 번만 나가도록 공유. */
let inflightCsrfPromise: Promise<unknown> | null = null;

export type EnsureCsrfCookieOptions = {
  /** 쿠키가 있어도 GET /v1/auth/csrf로 최신화(로그아웃 직전 등). */
  forceRefresh?: boolean;
};

/**
 * GET /v1/auth/csrf로 브라우저에 `XSRF-TOKEN` 쿠키를 심은 뒤, 항상 `document.cookie`에서만 값을 반환.
 * 응답 본문은 사용하지 않음.
 */
export async function ensureCsrfCookie(
  options?: EnsureCsrfCookieOptions,
): Promise<string | undefined> {
  if (!options?.forceRefresh) {
    const existing = getCookie(XSRF_COOKIE_NAME);
    if (existing) return existing;
  }

  if (!inflightCsrfPromise) {
    inflightCsrfPromise = webAuthClient.get("/v1/auth/csrf").finally(() => {
      inflightCsrfPromise = null;
    });
  }

  await inflightCsrfPromise;
  return getCookie(XSRF_COOKIE_NAME);
}

webAuthClient.interceptors.request.use(async (config) => {
  const method = config.method?.toUpperCase() ?? "GET";
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return config;
  }

  if (shouldSkipInterceptorCsrfInjection(config)) {
    return config;
  }

  if (hasXsrfHeader(config)) {
    return config;
  }

  const token = await ensureCsrfCookie();

  if (token) {
    setXsrfHeader(config, token);
  }

  return config;
});

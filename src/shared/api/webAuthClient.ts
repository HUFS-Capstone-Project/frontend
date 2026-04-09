import axios, { type InternalAxiosRequestConfig } from "axios";

import type { CommonResponse } from "@/shared/types/api.types";

import { getWebAuthBaseURL } from "./baseURL";

/** 웹 인증: `withCredentials`, CSRF는 쿠키 `XSRF-TOKEN` ↔ 헤더 `X-XSRF-TOKEN` 동일 문자열. Axios 기본 xsrf 옵션은 미사용(헤더 덮임 방지). */

const CSRF_HEADER = "X-XSRF-TOKEN";
const CSRF_COOKIE = "XSRF-TOKEN";

/**
 * GET /v1/auth/csrf — 백엔드 `CommonResponse<String>`: 토큰은 `data` 문자열만.
 * 다른 형태는 허용하지 않음(계약 불일치 시 조기에 드러나도록).
 */
function parseCsrfTokenFromCommonResponse(body: unknown): string | undefined {
  if (body == null || typeof body !== "object") return undefined;
  const o = body as Partial<CommonResponse<string>>;
  if (o.success === false) return undefined;
  if (typeof o.data !== "string" || o.data.length === 0) return undefined;
  return o.data;
}

function readXsrfFromCookie(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const escaped = CSRF_COOKIE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

let cachedXsrf: string | undefined;

/** 동시에 여러 mutating 요청이 토큰 없이 나갈 때 GET /csrf 한 번만 나가도록 공유. */
let inflightCsrfPromise: Promise<string | undefined> | null = null;

function setXsrfHeader(config: InternalAxiosRequestConfig, token: string): void {
  const h = config.headers;
  if (h && typeof h.set === "function") {
    h.set(CSRF_HEADER, token);
  } else {
    (h as Record<string, string>)[CSRF_HEADER] = token;
  }
}

function hasXsrfHeader(config: InternalAxiosRequestConfig): boolean {
  const h = config.headers;
  if (h && typeof h.get === "function") {
    return Boolean(h.get(CSRF_HEADER) ?? h.get("x-xsrf-token"));
  }
  const raw = h as Record<string, string | undefined>;
  return Boolean(raw[CSRF_HEADER] ?? raw["x-xsrf-token"]);
}

/** 인터셉터에서 CSRF 자동 주입을 건너뛸 경로 (마지막 세그먼트까지 일치). */
const SKIP_CSRF_TAIL = {
  csrf: ["v1", "auth", "csrf"] as const,
  logout: ["v1", "auth", "logout"] as const,
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
  return (
    pathnameEndsWithSegments(pathname, SKIP_CSRF_TAIL.csrf) ||
    pathnameEndsWithSegments(pathname, SKIP_CSRF_TAIL.logout)
  );
}

export const webAuthClient = axios.create({
  baseURL: getWebAuthBaseURL(),
  timeout: 15_000,
  withCredentials: true,
});

/** GET /csrf 후 쿠키 우선, 없으면 응답 본문. */
export type ResolveWebAuthCsrfOptions = {
  /** 로그아웃 등: 쿠키가 있어도 먼저 GET /csrf */
  forceRefresh?: boolean;
};

/**
 * 캐시·쿠키에 없을 때만 네트워크로 조회. 동시 호출은 하나의 Promise로 합침.
 * 401 refresh 등 다른 경로와도 동일 inflight를 공유하려면 이 함수를 사용.
 */
export function ensureCsrfToken(): Promise<string | undefined> {
  const existing = readXsrfFromCookie() ?? cachedXsrf;
  if (existing) return Promise.resolve(existing);

  if (!inflightCsrfPromise) {
    inflightCsrfPromise = (async () => {
      try {
        const res = await webAuthClient.get<CommonResponse<string>>("/v1/auth/csrf");
        let token = readXsrfFromCookie();
        if (!token) {
          token = parseCsrfTokenFromCommonResponse(res.data) ?? undefined;
        }
        if (token) cachedXsrf = token;
        return readXsrfFromCookie() ?? cachedXsrf;
      } finally {
        inflightCsrfPromise = null;
      }
    })();
  }
  return inflightCsrfPromise;
}

export async function resolveWebAuthCsrfToken(
  options?: ResolveWebAuthCsrfOptions,
): Promise<string | undefined> {
  if (!options?.forceRefresh) {
    const token = readXsrfFromCookie() ?? cachedXsrf;
    if (token) return token;
    return ensureCsrfToken();
  }

  cachedXsrf = undefined;
  if (inflightCsrfPromise) {
    await inflightCsrfPromise;
  }

  const res = await webAuthClient.get<CommonResponse<string>>("/v1/auth/csrf");
  let token = readXsrfFromCookie();
  if (token) {
    cachedXsrf = token;
    return token;
  }

  token = parseCsrfTokenFromCommonResponse(res.data) ?? undefined;
  if (token) cachedXsrf = token;
  return token;
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

  const token = await ensureCsrfToken();

  if (token) {
    setXsrfHeader(config, token);
  }

  return config;
});

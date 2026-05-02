import { isApiError } from "@/shared/api/axios";
import { ensureCsrfCookie } from "@/shared/api/web-auth-client";
import { getCookie, XSRF_COOKIE_NAME, XSRF_HEADER_NAME } from "@/shared/lib/cookie";

export async function withCsrfRetry<T>(request: () => Promise<T>): Promise<T> {
  await ensureCsrfCookie();

  try {
    return await request();
  } catch (error) {
    if (isCsrfForbidden(error)) {
      await ensureCsrfCookie({ forceRefresh: true });
      return request();
    }
    throw error;
  }
}

export function getXsrfHeader(): Record<string, string> | undefined {
  const token = getCookie(XSRF_COOKIE_NAME);
  if (!token) {
    return undefined;
  }

  return {
    [XSRF_HEADER_NAME]: token,
  };
}

export function isCsrfForbidden(error: unknown): boolean {
  if (!isApiError(error)) {
    return false;
  }

  return error.status === 403 || error.code === "E403_FORBIDDEN";
}

/** 브라우저 document.cookie에서 이름으로 값 조회 (첫 매칭). 없으면 undefined. */
export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

export const XSRF_COOKIE_NAME = "XSRF-TOKEN";
export const XSRF_HEADER_NAME = "X-XSRF-TOKEN";

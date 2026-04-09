/**
 * 백엔드 공통 응답 래퍼. 실제 payload는 항상 `data`.
 *
 * @example
 * const res = await api.get<CommonResponse<UserProfile>>("/v1/auth/me");
 * const user = res.data.data;
 *
 * GET /v1/auth/csrf 는 `CommonResponse<string>` — 토큰 문자열이 `data` 그 자체.
 */
export type CommonResponse<T = undefined> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
  timestamp: string;
};

/**
 * 백엔드 공통 성공 응답 래퍼
 * - 일부 엔드포인트는 `code`를 생략할 수 있음
 * - `message`는 null일 수 있음
 */
export type CommonResponse<T = undefined> = {
  success: boolean;
  code?: string | null;
  message?: string | null;
  data: T;
  timestamp: string;
};

export type ApiFieldError = {
  field: string;
  message: string;
  rejectedValue?: string | null;
};

export type ApiErrorResponse = {
  title?: string;
  status?: number;
  detail?: string;
  message?: string;
  code?: string;
  fieldErrors?: ApiFieldError[];
};

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

/** RFC 7807 ProblemDetail + 백엔드 확장 필드 */
export type FieldError = {
  field: string;
  message: string;
  rejectedValue?: unknown;
};

export type ProblemDetail = {
  title?: string;
  status: number;
  detail?: string;
  instance?: string;
  code?: string;
  timestamp?: string;
  fieldErrors?: FieldError[];
};

export type ApiErrorResponse = ProblemDetail;

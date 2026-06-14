import type { AxiosError } from "axios";

import { ERROR_TEXT, HTTP_ERROR_TEXT, type KnownErrorCode } from "@/shared/config/error-text";
import { COMMON_TEXT } from "@/shared/config/text";
import type { ApiErrorResponse, FieldError, ProblemDetail } from "@/shared/types/api-types";

export const DEFAULT_API_ERROR_MESSAGE: string = COMMON_TEXT.defaultApiError;
export const NETWORK_ERROR_MESSAGE: string = COMMON_TEXT.networkError;
export const VALIDATION_DETAIL_MESSAGE: string = COMMON_TEXT.validationDetail;

/** 백엔드 field → 프론트 form field (불일치 시에만 정의) */
export const API_FIELD_TO_FORM_FIELD: Record<string, string> = {
  linkUrl: "originalUrl",
  url: "originalUrl",
  roomName: "name",
};

export type ApiError = {
  status?: number;
  code?: string;
  /** 프론트 정규화 표시용 — `detail` 또는 fallback */
  message: string;
  detail?: string;
  fieldErrors?: FieldError[];
  original: unknown;
};

export type FormApiErrorResult = {
  fieldErrors: Record<string, string>;
  formError: string | null;
  detailMessage: string;
  hasFieldErrors: boolean;
};

export type { KnownErrorCode } from "@/shared/config/error-text";

export type ResolveGeneralApiErrorOptions = {
  fallback?: string;
  statusMessages?: Partial<Record<number, string>>;
  codeMessages?: Record<string, string>;
};

export function isApiError(error: unknown): error is ApiError {
  return Boolean(
    error &&
    typeof error === "object" &&
    "message" in error &&
    "original" in error &&
    "status" in error,
  );
}

export function isProblemDetail(value: unknown): value is ProblemDetail {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as ProblemDetail;
  return (
    typeof candidate.status === "number" ||
    typeof candidate.detail === "string" ||
    typeof candidate.code === "string" ||
    Array.isArray(candidate.fieldErrors)
  );
}

export function parseApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (isAxiosLikeError(error)) {
    return normalizeAxiosError(error);
  }

  return {
    message: DEFAULT_API_ERROR_MESSAGE,
    original: error,
  };
}

export function hasFieldErrors(error: unknown): boolean {
  const parsed = parseApiError(error);
  return Boolean(parsed.fieldErrors && parsed.fieldErrors.length > 0);
}

export function getFieldErrors(error: unknown): FieldError[] | undefined {
  return parseApiError(error).fieldErrors;
}

export function getErrorDetail(error: unknown, fallback = DEFAULT_API_ERROR_MESSAGE): string {
  const parsed = parseApiError(error);
  return normalizeDisplayMessage(parsed.detail) ?? fallback;
}

export function getApiErrorCode(error: unknown): string | undefined {
  return parseApiError(error).code;
}

export function isApiErrorCode(error: unknown, code: KnownErrorCode | string): boolean {
  return getApiErrorCode(error) === code;
}

export function isAnyApiErrorCode(error: unknown, codes: readonly string[]): boolean {
  const errorCode = getApiErrorCode(error);
  return errorCode != null && codes.includes(errorCode);
}

export function mapFieldErrorsToForm(
  fieldErrors: FieldError[] | undefined,
  fieldMap: Record<string, string> = API_FIELD_TO_FORM_FIELD,
): Record<string, string> {
  if (!fieldErrors || fieldErrors.length === 0) {
    return {};
  }

  return fieldErrors.reduce<Record<string, string>>((acc, item) => {
    const formField = fieldMap[item.field] ?? item.field;
    if (!acc[formField]) {
      acc[formField] = item.message;
    }
    return acc;
  }, {});
}

export function getFieldErrorMessage(
  error: unknown,
  formFieldName: string,
  fieldMap: Record<string, string> = API_FIELD_TO_FORM_FIELD,
): string | undefined {
  const mapped = mapFieldErrorsToForm(getFieldErrors(error), fieldMap);
  return mapped[formFieldName];
}

export function getFirstUnmappedFieldErrorMessage(
  error: unknown,
  knownFormFields: string[],
  fieldMap: Record<string, string> = API_FIELD_TO_FORM_FIELD,
): string | null {
  const mapped = mapFieldErrorsToForm(getFieldErrors(error), fieldMap);
  const known = new Set(knownFormFields);

  for (const [field, message] of Object.entries(mapped)) {
    if (!known.has(field)) {
      return message;
    }
  }

  return null;
}

export function resolveFormApiError(
  error: unknown,
  options?: {
    knownFields?: string[];
    fieldMap?: Record<string, string>;
    fallback?: string;
  },
): FormApiErrorResult {
  const parsed = parseApiError(error);
  const fieldMap = options?.fieldMap ?? API_FIELD_TO_FORM_FIELD;
  const fieldErrors = mapFieldErrorsToForm(parsed.fieldErrors, fieldMap);
  const hasMappedFieldErrors = Object.keys(fieldErrors).length > 0;

  if (hasMappedFieldErrors) {
    const knownFields = options?.knownFields ?? Object.keys(fieldErrors);
    const formError = getFirstUnmappedFieldErrorMessage(error, knownFields, fieldMap);

    return {
      fieldErrors,
      formError,
      detailMessage: normalizeDisplayMessage(parsed.detail) ?? VALIDATION_DETAIL_MESSAGE,
      hasFieldErrors: true,
    };
  }

  return {
    fieldErrors: {},
    formError: null,
    detailMessage: getErrorDetail(error, options?.fallback ?? DEFAULT_API_ERROR_MESSAGE),
    hasFieldErrors: false,
  };
}

export function resolveGeneralApiErrorMessage(
  error: unknown,
  options?: ResolveGeneralApiErrorOptions,
): string {
  if (isAxiosLikeError(error) && !error.response) {
    return NETWORK_ERROR_MESSAGE;
  }

  const parsed = parseApiError(error);
  const fallback = options?.fallback ?? DEFAULT_API_ERROR_MESSAGE;

  if (parsed.code && options?.codeMessages?.[parsed.code]) {
    return options.codeMessages[parsed.code]!;
  }

  if (parsed.code) {
    const globalMessage = ERROR_TEXT[parsed.code as keyof typeof ERROR_TEXT];
    if (globalMessage) {
      return globalMessage;
    }
  }

  if (parsed.status != null && options?.statusMessages?.[parsed.status]) {
    return options.statusMessages[parsed.status]!;
  }

  if (parsed.status != null) {
    const statusMessage = HTTP_ERROR_TEXT[parsed.status];
    if (statusMessage) {
      return statusMessage;
    }
  }

  return fallback;
}

export function normalizeAxiosError(error: AxiosError<ApiErrorResponse>): ApiError {
  if (!error.response) {
    return {
      message: NETWORK_ERROR_MESSAGE,
      original: error,
    };
  }

  const data = error.response.data;
  const dataRecord = data as ProblemDetail & { message?: unknown };
  const dataMessage = typeof dataRecord.message === "string" ? dataRecord.message : undefined;
  const detail =
    normalizeDisplayMessage(data?.detail) ?? normalizeDisplayMessage(dataMessage) ?? undefined;
  const fieldErrors = normalizeFieldErrors(data?.fieldErrors);
  const message = detail ?? DEFAULT_API_ERROR_MESSAGE;

  return {
    status: error.response.status ?? data?.status,
    code: typeof data?.code === "string" && data.code.length > 0 ? data.code : undefined,
    message,
    detail,
    fieldErrors,
    original: error,
  };
}

function normalizeFieldErrors(fieldErrors: unknown): FieldError[] | undefined {
  if (!Array.isArray(fieldErrors)) {
    return undefined;
  }

  const normalized: FieldError[] = [];

  for (const item of fieldErrors) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const field = (item as { field?: unknown }).field;
    const message = (item as { message?: unknown }).message;
    const rejectedValue = (item as { rejectedValue?: unknown }).rejectedValue;

    if (typeof field !== "string" || typeof message !== "string") {
      continue;
    }

    const normalizedItem: FieldError = {
      field,
      message: normalizeDisplayMessage(message) ?? VALIDATION_DETAIL_MESSAGE,
    };
    if (rejectedValue !== undefined) {
      normalizedItem.rejectedValue = rejectedValue;
    }

    normalized.push(normalizedItem);
  }

  return normalized.length > 0 ? normalized : undefined;
}

function isAxiosLikeError(error: unknown): error is AxiosError<ApiErrorResponse> {
  return Boolean(error && typeof error === "object" && "isAxiosError" in error);
}

function normalizeDisplayMessage(message: unknown): string | undefined {
  if (typeof message !== "string") {
    return undefined;
  }

  const normalized = message.trim();
  if (normalized.length === 0 || looksMojibakePlaceholder(normalized)) {
    return undefined;
  }

  return normalized;
}

function looksMojibakePlaceholder(message: string): boolean {
  if (message.includes("\uFFFD")) {
    return true;
  }

  const questionMarkCount = Array.from(message).filter((char) => char === "?").length;
  if (questionMarkCount < 2) {
    return false;
  }

  const visibleChars = Array.from(message).filter((char) => !/\s|[.,:;!()[\]{}'"-]/.test(char));
  if (visibleChars.length === 0) {
    return false;
  }

  return questionMarkCount / visibleChars.length >= 0.35;
}

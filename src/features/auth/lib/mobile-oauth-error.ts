const MOBILE_OAUTH_ERROR_KEY = "udidura-mobile-oauth-error";
const MOBILE_OAUTH_ERROR_MESSAGE = "로그인에 실패했습니다. 다시 시도해주세요";

export function setMobileOAuthUserError(): void {
  sessionStorage.setItem(MOBILE_OAUTH_ERROR_KEY, MOBILE_OAUTH_ERROR_MESSAGE);
}

export function consumeMobileOAuthUserError(): string | null {
  const message = sessionStorage.getItem(MOBILE_OAUTH_ERROR_KEY);
  sessionStorage.removeItem(MOBILE_OAUTH_ERROR_KEY);
  return message;
}

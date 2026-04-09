/** `VITE_GOOGLE_LOGIN_URL`로 OAuth 시작. 완료 후 `/auth/callback?ticket=...` */
function resolveGoogleLoginUrl(): string | undefined {
  const raw = import.meta.env.VITE_GOOGLE_LOGIN_URL
  if (typeof raw !== "string") return undefined
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export function handleGoogleLogin(): boolean {
  const url = resolveGoogleLoginUrl()
  if (!url) {
    if (import.meta.env.DEV) {
      console.warn(
        "[udidura] VITE_GOOGLE_LOGIN_URL이 설정되지 않았습니다.\n" +
        ".env.local에 다음을 추가하세요:\n" +
        "VITE_GOOGLE_LOGIN_URL=http://localhost:8080/oauth2/authorization/google?client=web"
      )
    }
    return false
  }
  window.location.href = url
  return true
}

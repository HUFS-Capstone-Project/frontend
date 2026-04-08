function resolveGoogleLoginUrl(): string | undefined {
  const raw = import.meta.env.VITE_GOOGLE_LOGIN_URL
  if (typeof raw !== "string") {
    return undefined
  }
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export function handleGoogleLogin(): boolean {
  const url = resolveGoogleLoginUrl()
  if (!url) {
    return false
  }
  window.location.href = url
  return true
}

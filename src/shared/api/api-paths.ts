export const API_PATHS = {
  auth: {
    csrf: "/v1/auth/csrf",
    refresh: "/v1/auth/refresh",
    logout: "/v1/auth/logout",
    logoutAll: "/v1/auth/logout-all",
    webExchangeTicket: "/v1/auth/web/exchange-ticket",
    mobileExchange: "/v1/auth/mobile/exchange",
    mobileRefresh: "/v1/auth/mobile/refresh",
    mobileLogout: "/v1/auth/mobile/logout",
  },
  users: {
    me: "/v1/users/me",
    onboarding: "/v1/users/me/onboarding",
  },
  rooms: {
    root: "/v1/rooms",
    join: "/v1/rooms/join",
    detail: (roomId: string) => `/v1/rooms/${roomId}`,
    pin: (roomId: string) => `/v1/rooms/${roomId}/pin`,
    leave: (roomId: string) => `/v1/rooms/${roomId}/leave`,
    analyzeLink: (roomId: string) => `/v1/rooms/${roomId}/links/analyze`,
    linkAnalysis: (roomId: string, linkId: number) =>
      `/v1/rooms/${roomId}/links/${linkId}/analysis`,
    linkPlaces: (roomId: string, linkId: number) => `/v1/rooms/${roomId}/links/${linkId}/places`,
  },
  links: {
    root: "/v1/links",
  },
  placeTaxonomy: "/v1/place-taxonomy",
} as const;

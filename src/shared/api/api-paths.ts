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
    linkAnalysisRequests: (roomId: string) => `/v1/rooms/${roomId}/link-analysis-requests`,
    linkAnalysisRequest: (roomId: string, analysisRequestId: number) =>
      `/v1/rooms/${roomId}/link-analysis-requests/${analysisRequestId}`,
    linkAnalysisRequestPlaces: (roomId: string, analysisRequestId: number) =>
      `/v1/rooms/${roomId}/link-analysis-requests/${analysisRequestId}/places`,
    linkAnalysisRequestManualPlace: (roomId: string, analysisRequestId: number) =>
      `/v1/rooms/${roomId}/link-analysis-requests/${analysisRequestId}/places/manual`,
    linkAnalysisCandidateOverride: (
      roomId: string,
      analysisRequestId: number,
      candidateId: number,
    ) =>
      `/v1/rooms/${roomId}/link-analysis-requests/${analysisRequestId}/candidates/${candidateId}/override`,
    placeCandidatesExternal: (roomId: string) => `/v1/rooms/${roomId}/place-candidates/external`,
    places: (roomId: string) => `/v1/rooms/${roomId}/places`,
    place: (roomId: string, roomPlaceId: number) => `/v1/rooms/${roomId}/places/${roomPlaceId}`,
  },
  regions: {
    sidos: "/v1/regions/sidos",
    sigungus: (sidoCode: string) => `/v1/regions/sidos/${sidoCode}/sigungus`,
  },
  links: {
    root: "/v1/links",
  },
  placeTaxonomy: "/v1/place-taxonomy",
} as const;

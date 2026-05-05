export const linkAnalysisQueryKeys = {
  all: ["link-analysis"] as const,
  room: (roomId: string) => [...linkAnalysisQueryKeys.all, "room", roomId] as const,
  request: (roomId: string, analysisRequestId: number) =>
    [...linkAnalysisQueryKeys.room(roomId), "request", analysisRequestId] as const,
  analysis: (roomId: string, analysisRequestId: number) =>
    linkAnalysisQueryKeys.request(roomId, analysisRequestId),
};

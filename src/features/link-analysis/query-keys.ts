export const linkAnalysisQueryKeys = {
  all: ["link-analysis"] as const,
  room: (roomId: string) => [...linkAnalysisQueryKeys.all, "room", roomId] as const,
  analysis: (roomId: string, linkId: number) =>
    [...linkAnalysisQueryKeys.room(roomId), "analysis", linkId] as const,
};

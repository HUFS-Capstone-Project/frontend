import type { PlaceCandidateParams } from "./types/place-candidate.types";

export const placeCandidateQueryKeys = {
  all: ["place-candidates"] as const,
  room: (roomId: string) => [...placeCandidateQueryKeys.all, "room", roomId] as const,
  search: (roomId: string, params: PlaceCandidateParams) =>
    [...placeCandidateQueryKeys.room(roomId), "search", params] as const,
};

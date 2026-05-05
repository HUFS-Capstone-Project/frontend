import type { ExternalPlaceCandidateParams } from "./types/place-candidate.types";

export const placeCandidateQueryKeys = {
  all: ["place-candidates"] as const,
  room: (roomId: string) => [...placeCandidateQueryKeys.all, "room", roomId] as const,
  external: (roomId: string, params: Required<ExternalPlaceCandidateParams>) =>
    [...placeCandidateQueryKeys.room(roomId), "external", params] as const,
};

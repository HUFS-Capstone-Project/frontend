export type EditPlaceReturnTo = "link-add" | "back";

export type EditPlaceLocationState = {
  placeId?: string;
  placeName?: string;
  returnTo?: EditPlaceReturnTo;
  linkAddRoomId?: string;
  linkAddAnalysisRequestId?: number | string;
  /** 링크 후보 화면 URL(`.../links/:linkId/candidates`) 복귀용 */
  linkAddLinkId?: number | string;
  linkAddOriginalUrl?: string;
  linkAddCandidateId?: number;
  linkAddDraftSession?: string;
};

export type RoomPlaceFromLinkLocationState = {
  linkAddDraftSession?: string;
};

export type LinkCandidatesResumeState = {
  linkAddDraftSession?: string;
};

export function roomPlaceFromLinkResumeState(
  draftSession?: string | null,
): RoomPlaceFromLinkLocationState {
  return typeof draftSession === "string" && draftSession.length > 0
    ? { linkAddDraftSession: draftSession }
    : {};
}

export function linkCandidatesResumeState(draftSession?: string | null): LinkCandidatesResumeState {
  return typeof draftSession === "string" && draftSession.length > 0
    ? { linkAddDraftSession: draftSession }
    : {};
}

export function resolveEditPlaceReturnTo(state: EditPlaceLocationState): EditPlaceReturnTo {
  return state.returnTo ?? "back";
}

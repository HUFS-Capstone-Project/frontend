export type EditPlaceReturnTo = "link-add" | "register-place" | "back";

export type EditPlaceLocationState = {
  placeId?: string;
  placeName?: string;
  returnTo?: EditPlaceReturnTo;
  linkAddRoomId?: string;
  linkAddAnalysisRequestId?: number | string;
  /** 링크 후보 화면 URL(`.../links/:linkId/candidates`) 복귀용 */
  linkAddLinkId?: number | string;
  linkAddCandidateId?: number;
  linkAddDraftSession?: string;
  /** @deprecated `returnTo` 사용 */
  onConfirmNavigate?: string;
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
  if (state.returnTo) {
    return state.returnTo;
  }
  if (state.onConfirmNavigate === "link-add-back") {
    return "link-add";
  }
  if (state.onConfirmNavigate === "register_place") {
    return "register-place";
  }
  if (state.onConfirmNavigate === "back") {
    return "back";
  }
  return "register-place";
}

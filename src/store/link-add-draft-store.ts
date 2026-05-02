import { create } from "zustand";

export type LinkAddDraft = {
  roomId: string;
  sessionId: string;
  url: string;
  linkId: number | null;
  requestJobId: string | null;
  selectedKakaoPlaceIds: string[];
};

type LinkAddDraftState = {
  draft: LinkAddDraft | null;
  lastTakenKey: string | null;
  lastTaken: LinkAddDraft | null;
  setDraft: (draft: LinkAddDraft) => void;
  takeDraft: (roomId: string, sessionId?: string | null) => LinkAddDraft | null;
  clearForRoom: (roomId: string) => void;
  clear: () => void;
};

function takeKey(roomId: string, sessionId: string | null | undefined): string {
  if (sessionId === undefined || sessionId === null) {
    return `${roomId}:__any__`;
  }
  return `${roomId}:${sessionId}`;
}

export const useLinkAddDraftStore = create<LinkAddDraftState>((set, get) => ({
  draft: null,
  lastTakenKey: null,
  lastTaken: null,
  setDraft: (draft) =>
    set({
      draft,
      lastTaken: null,
      lastTakenKey: null,
    }),
  takeDraft: (roomId, sessionId) => {
    const key = takeKey(roomId, sessionId);
    const { draft, lastTaken, lastTakenKey } = get();
    if (lastTakenKey === key && lastTaken != null) {
      return lastTaken;
    }

    if (draft == null || draft.roomId !== roomId) {
      return null;
    }

    if (sessionId != null && draft.sessionId !== sessionId) {
      return null;
    }

    set({
      draft: null,
      lastTaken: draft,
      lastTakenKey: key,
    });
    return draft;
  },
  clearForRoom: (roomId) => {
    set((state) => {
      const clearDraft = state.draft?.roomId === roomId;
      const clearTaken = state.lastTaken?.roomId === roomId;
      return {
        draft: clearDraft ? null : state.draft,
        lastTaken: clearTaken ? null : state.lastTaken,
        lastTakenKey: clearTaken ? null : state.lastTakenKey,
      };
    });
  },
  clear: () => set({ draft: null, lastTaken: null, lastTakenKey: null }),
}));

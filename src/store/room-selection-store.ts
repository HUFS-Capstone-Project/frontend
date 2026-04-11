import { create } from "zustand";

export type SelectedRoom = {
  id: string;
  name: string;
  /** 방 멤버 수 — 지도 FAB 프로필 스택 개수 등에 사용 */
  memberCount: number;
};

type RoomSelectionState = {
  selectedRoom: SelectedRoom | null;
  selectRoom: (room: SelectedRoom) => void;
  clearSelectedRoom: () => void;
};

/**
 * 현재 사용자가 컨텍스트로 보고 있는 방 선택 상태.
 * 지도/목록/코스 탭의 기준으로 사용한다.
 */
export const useRoomSelectionStore = create<RoomSelectionState>((set) => ({
  selectedRoom: null,
  selectRoom: (room) => set({ selectedRoom: room }),
  clearSelectedRoom: () => set({ selectedRoom: null }),
}));

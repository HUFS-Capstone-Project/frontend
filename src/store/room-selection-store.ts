import { create } from "zustand";

export type SelectedRoom = {
  id: string;
  name: string;
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

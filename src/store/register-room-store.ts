import { create } from "zustand";

type RegisterRoomState = {
  selectedPlaceIds: string[];
  selectedPlaceCount: number;
  roomPlaceCountDeltas: Record<string, number>;
  setSelectedPlaces: (placeIds: string[]) => void;
  /** 방 선택 화면 없이, 지정한 방에 선택된 장소 수만큼 반영 */
  completeRegisterToRoom: (roomId: string) => boolean;
};

export const useRegisterRoomStore = create<RegisterRoomState>((set, get) => ({
  selectedPlaceIds: [],
  selectedPlaceCount: 0,
  roomPlaceCountDeltas: {},
  setSelectedPlaces: (placeIds) =>
    set({
      selectedPlaceIds: placeIds,
      selectedPlaceCount: placeIds.length,
    }),
  completeRegisterToRoom: (roomId) => {
    const { selectedPlaceCount, roomPlaceCountDeltas } = get();
    const trimmed = roomId.trim();

    if (!trimmed || selectedPlaceCount <= 0) {
      return false;
    }

    set({
      roomPlaceCountDeltas: {
        ...roomPlaceCountDeltas,
        [trimmed]: (roomPlaceCountDeltas[trimmed] ?? 0) + selectedPlaceCount,
      },
      selectedPlaceIds: [],
      selectedPlaceCount: 0,
    });
    return true;
  },
}));

import { create } from "zustand";

type RegisterRoomState = {
  selectedPlaceIds: string[];
  selectedPlaceCount: number;
  selectedRoomId: string | null;
  confirmModalOpen: boolean;
  roomPlaceCountDeltas: Record<string, number>;
  setSelectedPlaces: (placeIds: string[]) => void;
  setSelectedRoom: (roomId: string | null) => void;
  openConfirm: () => void;
  closeConfirm: () => void;
  completeRegister: () => boolean;
  resetFlow: () => void;
};

export const useRegisterRoomStore = create<RegisterRoomState>((set, get) => ({
  selectedPlaceIds: [],
  selectedPlaceCount: 0,
  selectedRoomId: null,
  confirmModalOpen: false,
  roomPlaceCountDeltas: {},
  setSelectedPlaces: (placeIds) =>
    set({
      selectedPlaceIds: placeIds,
      selectedPlaceCount: placeIds.length,
    }),
  setSelectedRoom: (roomId) => set({ selectedRoomId: roomId }),
  openConfirm: () => set({ confirmModalOpen: true }),
  closeConfirm: () => set({ confirmModalOpen: false }),
  completeRegister: () => {
    const { selectedRoomId, selectedPlaceCount, roomPlaceCountDeltas } = get();

    if (!selectedRoomId || selectedPlaceCount <= 0) {
      return false;
    }

    set({
      roomPlaceCountDeltas: {
        ...roomPlaceCountDeltas,
        [selectedRoomId]: (roomPlaceCountDeltas[selectedRoomId] ?? 0) + selectedPlaceCount,
      },
      selectedPlaceIds: [],
      selectedPlaceCount: 0,
      selectedRoomId: null,
      confirmModalOpen: false,
    });
    return true;
  },
  resetFlow: () =>
    set({
      selectedPlaceIds: [],
      selectedPlaceCount: 0,
      selectedRoomId: null,
      confirmModalOpen: false,
    }),
}));

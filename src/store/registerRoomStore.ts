import { create } from "zustand";

type RegisterRoomState = {
  selectedPlaceIds: string[];
  selectedPlaceCount: number;
  selectedRoomId: string | null;
  confirmModalOpen: boolean;
  successModalOpen: boolean;
  roomPlaceCountDeltas: Record<string, number>;
  setSelectedPlaces: (placeIds: string[]) => void;
  setSelectedRoom: (roomId: string | null) => void;
  openConfirm: () => void;
  closeConfirm: () => void;
  openSuccess: () => void;
  closeSuccess: () => void;
  completeRegister: () => void;
  resetFlow: () => void;
};

export const useRegisterRoomStore = create<RegisterRoomState>((set, get) => ({
  selectedPlaceIds: [],
  selectedPlaceCount: 0,
  selectedRoomId: null,
  confirmModalOpen: false,
  successModalOpen: false,
  roomPlaceCountDeltas: {},
  setSelectedPlaces: (placeIds) =>
    set({
      selectedPlaceIds: placeIds,
      selectedPlaceCount: placeIds.length,
    }),
  setSelectedRoom: (roomId) => set({ selectedRoomId: roomId }),
  openConfirm: () => set({ confirmModalOpen: true }),
  closeConfirm: () => set({ confirmModalOpen: false }),
  openSuccess: () => set({ successModalOpen: true }),
  closeSuccess: () => set({ successModalOpen: false }),
  completeRegister: () => {
    const { selectedRoomId, selectedPlaceCount, roomPlaceCountDeltas } = get();

    if (!selectedRoomId || selectedPlaceCount <= 0) {
      return;
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
      successModalOpen: false,
    });
  },
  resetFlow: () =>
    set({
      selectedPlaceIds: [],
      selectedPlaceCount: 0,
      selectedRoomId: null,
      confirmModalOpen: false,
      successModalOpen: false,
    }),
}));

import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { BottomNavigationBar } from "@/components/common/BottomNavigationBar";
import { FloatingActionButton } from "@/components/common/FloatingActionButton";
import { FriendRoomList } from "@/components/room/FriendRoomList";
import { RoomConfirmModal } from "@/components/room/RoomConfirmModal";
import { RoomMainHeader } from "@/components/room/RoomMainHeader";
import { RoomMainShell } from "@/components/room/RoomMainShell";
import { FRIEND_ROOM_MOCK_ROWS } from "@/pages/room/friend-room-mock";
import type { FriendRoomRow } from "@/shared/types/room";
import { useRegisterRoomStore } from "@/store/register-room-store";

type RegisterSelectRoomLocationState = {
  selectedPlaceIds?: string[];
  selectedPlaceCount?: number;
};

export default function RegisterSelectRoomPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state ?? {}) as RegisterSelectRoomLocationState;
  const selectedRoomId = useRegisterRoomStore((state) => state.selectedRoomId);
  const selectedPlaceCount = useRegisterRoomStore((state) => state.selectedPlaceCount);
  const confirmModalOpen = useRegisterRoomStore((state) => state.confirmModalOpen);
  const roomPlaceCountDeltas = useRegisterRoomStore((state) => state.roomPlaceCountDeltas);
  const setSelectedPlaces = useRegisterRoomStore((state) => state.setSelectedPlaces);
  const setSelectedRoom = useRegisterRoomStore((state) => state.setSelectedRoom);
  const openConfirm = useRegisterRoomStore((state) => state.openConfirm);
  const closeConfirm = useRegisterRoomStore((state) => state.closeConfirm);
  const completeRegister = useRegisterRoomStore((state) => state.completeRegister);

  useEffect(() => {
    if (routeState.selectedPlaceIds && selectedPlaceCount === 0) {
      setSelectedPlaces(routeState.selectedPlaceIds);
    }
    // Router state is only used as an entry payload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(
    () =>
      FRIEND_ROOM_MOCK_ROWS.map((row) => ({
        ...row,
        placeCount: row.placeCount + (roomPlaceCountDeltas[row.id] ?? 0),
      })),
    [roomPlaceCountDeltas],
  );
  const selectedRoom = useMemo(
    () => rows.find((row) => row.id === selectedRoomId) ?? null,
    [rows, selectedRoomId],
  );

  const handleSelectRoom = (row: FriendRoomRow) => {
    setSelectedRoom(row.id);
    openConfirm();
  };

  return (
    <RoomMainShell
      header={
        <RoomMainHeader title="홍길동님의 데이트 지도" searchPlaceholder="공유하고 싶은 방 선택" />
      }
      fab={<FloatingActionButton label="방 추가" />}
      bottomNav={<BottomNavigationBar activeId="room" onSelect={() => undefined} />}
    >
      <FriendRoomList
        rows={rows}
        onRoomNavigate={handleSelectRoom}
        onOpenRoomActions={handleSelectRoom}
      />

      <RoomConfirmModal
        open={confirmModalOpen && selectedRoom != null}
        message={`${selectedRoom?.displayName ?? ""}에\n장소를 등록하시겠습니까?`}
        cancelLabel="취소"
        confirmLabel="확인"
        onCancel={closeConfirm}
        onConfirm={() => {
          if (completeRegister()) {
            navigate("/room", { state: { showPlacesRegisteredToast: true } });
          }
        }}
      />
    </RoomMainShell>
  );
}

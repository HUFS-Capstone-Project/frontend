import { useCallback, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { RoomList } from "@/components/room/RoomList";
import { RoomMainHeader } from "@/components/room/RoomMainHeader";
import { RoomMainShell } from "@/components/room/RoomMainShell";
import { BrandMarkerLoader } from "@/components/ui/BrandMarkerLoader";
import { useRoomsQuery } from "@/features/room";
import { mapRoomSummaryToRoomListRow, sortRoomListRows } from "@/features/room/utils/roomListRows";
import {
  clearPendingSharedLinkUrl,
  peekPendingSharedLinkUrl,
} from "@/features/share-intent/shared-link-storage";
import { APP_ROUTES, ROOM_APP_PATHS } from "@/shared/config/routes";
import type { RoomListRow } from "@/shared/types/room";

export default function ShareRoomSelectPage() {
  const navigate = useNavigate();
  const [sharedUrl] = useState<string | null>(() => peekPendingSharedLinkUrl());
  const [roomSearchKeyword, setRoomSearchKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");

  const roomsQuery = useRoomsQuery({ keyword: submittedKeyword });

  const rows = useMemo(
    () => sortRoomListRows((roomsQuery.data ?? []).map(mapRoomSummaryToRoomListRow)),
    [roomsQuery.data],
  );

  const handleSelectRoom = useCallback(
    (room: RoomListRow) => {
      if (!sharedUrl) {
        navigate(APP_ROUTES.room, { replace: true });
        return;
      }

      clearPendingSharedLinkUrl();
      navigate(ROOM_APP_PATHS.placeFromLink(room.id), {
        replace: true,
        state: { sharedOriginalUrl: sharedUrl },
      });
    },
    [navigate, sharedUrl],
  );

  const handleOpenRoomActions = useCallback(() => {
    // Share flow only needs room selection; long-press actions stay disabled here.
  }, []);

  if (!sharedUrl) {
    return <Navigate to={APP_ROUTES.room} replace />;
  }

  return (
    <RoomMainShell
      header={
        <RoomMainHeader
          title="공유할 방을 선택해주세요"
          searchValue={roomSearchKeyword}
          onSearchValueChange={setRoomSearchKeyword}
          onSubmitSearch={() => setSubmittedKeyword(roomSearchKeyword)}
        />
      }
      bottomNav={null}
    >
      {roomsQuery.isLoading ? (
        <div className="flex min-h-48 items-center justify-center px-6 py-12">
          <BrandMarkerLoader />
        </div>
      ) : null}

      {!roomsQuery.isLoading && rows.length > 0 ? (
        <RoomList
          rows={rows}
          onRoomNavigate={handleSelectRoom}
          onOpenRoomActions={handleOpenRoomActions}
        />
      ) : null}

      {!roomsQuery.isLoading && rows.length === 0 ? (
        <div className="px-page text-muted-foreground py-12 text-center text-sm">
          공유할 수 있는 방이 없습니다.
        </div>
      ) : null}
    </RoomMainShell>
  );
}

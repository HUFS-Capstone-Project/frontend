import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { BottomNavId } from "@/components/common/BottomNavigationBar";
import { useRoomSelectionStore } from "@/store/room-selection-store";

const ROOM_REQUIRED_TOAST = "방을 먼저 선택해주세요.";

const NAV_PATH_BY_ID: Record<BottomNavId, string> = {
  list: "/list",
  room: "/room",
  map: "/map",
  course: "/course",
  mypage: "/mypage",
};

const ROOM_SCOPED_NAVS: BottomNavId[] = ["list", "map", "course"];

export function useBottomNavController() {
  const navigate = useNavigate();
  const selectedRoom = useRoomSelectionStore((s) => s.selectedRoom);
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(""), 1500);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const handleSelectBottomNav = useCallback(
    (id: BottomNavId) => {
      const needsRoom = ROOM_SCOPED_NAVS.includes(id);
      if (needsRoom && !selectedRoom) {
        setToastMessage(ROOM_REQUIRED_TOAST);
        return;
      }

      navigate(NAV_PATH_BY_ID[id]);
    },
    [navigate, selectedRoom],
  );

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  return {
    toastMessage,
    handleSelectBottomNav,
    showToast,
  };
}

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

export type BottomNavToastPlacement = "top" | "bottom";

type ToastState = {
  message: string;
  durationMs: number;
  placement: BottomNavToastPlacement;
};

export function useBottomNavController() {
  const navigate = useNavigate();
  const selectedRoom = useRoomSelectionStore((s) => s.selectedRoom);
  const [toastState, setToastState] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toastState?.message) return;
    const timer = window.setTimeout(() => setToastState(null), toastState.durationMs);
    return () => window.clearTimeout(timer);
  }, [toastState]);

  const handleSelectBottomNav = useCallback(
    (id: BottomNavId) => {
      const needsRoom = ROOM_SCOPED_NAVS.includes(id);
      if (needsRoom && !selectedRoom) {
        setToastState({ message: ROOM_REQUIRED_TOAST, durationMs: 1500, placement: "bottom" });
        return;
      }

      navigate(NAV_PATH_BY_ID[id]);
    },
    [navigate, selectedRoom],
  );

  const showToast = useCallback(
    (message: string, durationMs = 1500, placement: BottomNavToastPlacement = "bottom") => {
      setToastState({ message, durationMs, placement });
    },
    [],
  );

  return {
    toastMessage: toastState?.message ?? "",
    toastPlacement: toastState?.placement ?? "bottom",
    handleSelectBottomNav,
    showToast,
  };
}

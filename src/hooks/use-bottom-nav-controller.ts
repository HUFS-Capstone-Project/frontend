import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  BOTTOM_NAV_ROUTE_BY_ID,
  type BottomNavId,
  isRoomScopedBottomNav,
} from "@/shared/config/navigation";
import { BOTTOM_NAV_TEXT } from "@/shared/config/text";
import { useRoomSelectionStore } from "@/store/room-selection-store";

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
      if (isRoomScopedBottomNav(id) && !selectedRoom) {
        setToastState({
          message: BOTTOM_NAV_TEXT.roomRequiredToast,
          durationMs: 1500,
          placement: "bottom",
        });
        return;
      }

      navigate(BOTTOM_NAV_ROUTE_BY_ID[id]);
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

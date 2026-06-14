import { useCallback, useEffect, useRef, useState } from "react";

import { ROOM_ACTION_MODAL_TRANSITION_MS } from "@/features/room/constants";
import { isRoomPlaceUsedInDateCourseError } from "@/features/room-places";

export function usePlaceUsedInDateCourseAlert() {
  const [open, setOpen] = useState(false);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const close = useCallback(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }

    setOpen(false);
  }, []);

  useEffect(() => {
    return () => {
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
      }
    };
  }, []);

  const handleDeleteError = useCallback((error: unknown) => {
    if (!isRoomPlaceUsedInDateCourseError(error)) {
      return false;
    }

    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
    }

    showTimerRef.current = setTimeout(() => {
      showTimerRef.current = null;
      setOpen(true);
    }, ROOM_ACTION_MODAL_TRANSITION_MS);

    return true;
  }, []);

  return {
    open,
    close,
    handleDeleteError,
  };
}

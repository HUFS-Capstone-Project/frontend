import { useCallback, useEffect, useRef, useState } from "react";

import { ROOM_ACTION_MODAL_TRANSITION_MS } from "@/features/room/constants";

type UseOverlayFlowControllerOptions = {
  open: boolean;
  onClose: () => void;
  historyStateKey: string;
  /** 닫기 후 언마운트 지연. 미지정 시 `ROOM_ACTION_MODAL_TRANSITION_MS`(RoomModalShell·모달 크롬 페이드 180ms) */
  transitionMs?: number;
  enableEscape?: boolean;
  enableHistory?: boolean;
};

type UseOverlayFlowControllerResult = {
  isRendered: boolean;
  isVisible: boolean;
  requestClose: () => void;
};

/**
 * 오버레이 공통 제어:
 * - 브라우저 history(back) 닫기
 * - ESC 닫기
 * - mount/unmount transition presence
 */
export function useOverlayFlowController({
  open,
  onClose,
  historyStateKey,
  transitionMs = ROOM_ACTION_MODAL_TRANSITION_MS,
  enableEscape = true,
  enableHistory = true,
}: UseOverlayFlowControllerOptions): UseOverlayFlowControllerResult {
  const [isRendered, setIsRendered] = useState(open);
  const [isVisible, setIsVisible] = useState(false);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyPushedRef = useRef(false);
  const closedByPopStateRef = useRef(false);

  const requestClose = useCallback(() => {
    if (enableHistory && historyPushedRef.current) {
      historyPushedRef.current = false;
      onClose();
      window.history.back();
      return;
    }

    onClose();
  }, [enableHistory, onClose]);

  useEffect(() => {
    if (open) {
      closedByPopStateRef.current = false;
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }

      queueMicrotask(() => {
        setIsRendered(true);
      });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
      return;
    }

    queueMicrotask(() => {
      setIsVisible(false);
    });

    if (enableHistory && historyPushedRef.current && !closedByPopStateRef.current) {
      historyPushedRef.current = false;
      window.history.back();
    }
    closedByPopStateRef.current = false;

    closeTimerRef.current = setTimeout(() => {
      setIsRendered(false);
      closeTimerRef.current = null;
    }, transitionMs);

    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [enableHistory, open, transitionMs]);

  useEffect(() => {
    if (!open || !enableHistory) {
      return;
    }

    window.history.pushState({ [historyStateKey]: true }, "");
    historyPushedRef.current = true;

    const handlePopState = () => {
      if (!historyPushedRef.current) {
        return;
      }

      closedByPopStateRef.current = true;
      historyPushedRef.current = false;
      onClose();
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [enableHistory, historyStateKey, onClose, open]);

  useEffect(() => {
    if (!open || !enableEscape) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      requestClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enableEscape, open, requestClose]);

  return {
    isRendered,
    isVisible,
    requestClose,
  };
}

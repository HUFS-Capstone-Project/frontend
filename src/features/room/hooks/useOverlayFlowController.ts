import { useCallback, useEffect, useRef, useState } from "react";

type UseOverlayFlowControllerOptions = {
  open: boolean;
  onClose: () => void;
  historyStateKey: string;
  transitionMs?: number;
  enableEscape?: boolean;
};

type UseOverlayFlowControllerResult = {
  isRendered: boolean;
  isVisible: boolean;
  requestClose: () => void;
};

const DEFAULT_TRANSITION_MS = 180;

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
  transitionMs = DEFAULT_TRANSITION_MS,
  enableEscape = true,
}: UseOverlayFlowControllerOptions): UseOverlayFlowControllerResult {
  const [isRendered, setIsRendered] = useState(open);
  const [isVisible, setIsVisible] = useState(false);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyPushedRef = useRef(false);
  const closedByPopStateRef = useRef(false);

  const requestClose = useCallback(() => {
    if (historyPushedRef.current) {
      historyPushedRef.current = false;
      onClose();
      window.history.back();
      return;
    }

    onClose();
  }, [onClose]);

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

    if (historyPushedRef.current && !closedByPopStateRef.current) {
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
  }, [open, transitionMs]);

  useEffect(() => {
    if (!open) {
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
  }, [historyStateKey, onClose, open]);

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

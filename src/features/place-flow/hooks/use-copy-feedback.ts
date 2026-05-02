import { useCallback, useEffect, useRef, useState } from "react";

const IDLE = "복사";
const SUCCESS = "복사됨";
const FAILED = "실패";
const RESET_MS = 1500;

/**
 * 클립보드 복사 후 라벨(복사/복사됨/실패)만 짧게 바꿀 때 — `CopyableLinkBar` 등에서 공통.
 */
export function useCopyFeedback(resetMs = RESET_MS) {
  const [copyLabel, setCopyLabel] = useState(IDLE);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
      }
    },
    [],
  );

  const copyText = useCallback(
    async (text: string) => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      try {
        await navigator.clipboard.writeText(text);
        setCopyLabel(SUCCESS);
      } catch {
        setCopyLabel(FAILED);
      }
      timerRef.current = window.setTimeout(() => {
        setCopyLabel(IDLE);
        timerRef.current = null;
      }, resetMs);
    },
    [resetMs],
  );

  return { copyLabel, copyText };
}

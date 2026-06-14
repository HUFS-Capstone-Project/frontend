import { useEffect } from "react";

import { isAndroidCapacitorApp } from "@/features/auth/lib/capacitor-platform";

const KEYBOARD_OPEN_THRESHOLD_PX = 80;

export function useMobileKeyboardInset() {
  useEffect(() => {
    if (!isAndroidCapacitorApp()) {
      return;
    }

    const root = document.documentElement;
    let frameId: number | null = null;

    root.dataset.androidCapacitor = "true";

    const updateKeyboardInset = () => {
      if (frameId != null) {
        cancelAnimationFrame(frameId);
      }

      frameId = requestAnimationFrame(() => {
        const viewport = window.visualViewport;
        const layoutHeight = window.innerHeight;
        const visualHeight = viewport?.height ?? layoutHeight;
        const visualOffsetTop = viewport?.offsetTop ?? 0;
        const rawInset = Math.max(0, layoutHeight - visualHeight - visualOffsetTop);
        const keyboardInset = rawInset >= KEYBOARD_OPEN_THRESHOLD_PX ? rawInset : 0;
        const systemBarInset = rawInset > 0 && rawInset < KEYBOARD_OPEN_THRESHOLD_PX ? rawInset : 0;

        root.style.setProperty("--app-viewport-height", `${layoutHeight}px`);
        root.style.setProperty("--keyboard-inset-bottom", `${keyboardInset}px`);
        root.style.setProperty("--visual-viewport-inset-bottom", `${systemBarInset}px`);
        root.classList.toggle("keyboard-open", keyboardInset > 0);
        frameId = null;
      });
    };

    updateKeyboardInset();
    window.visualViewport?.addEventListener("resize", updateKeyboardInset);
    window.visualViewport?.addEventListener("scroll", updateKeyboardInset);
    window.addEventListener("resize", updateKeyboardInset);

    return () => {
      if (frameId != null) {
        cancelAnimationFrame(frameId);
      }

      window.visualViewport?.removeEventListener("resize", updateKeyboardInset);
      window.visualViewport?.removeEventListener("scroll", updateKeyboardInset);
      window.removeEventListener("resize", updateKeyboardInset);
      root.style.removeProperty("--app-viewport-height");
      root.style.removeProperty("--keyboard-inset-bottom");
      root.style.removeProperty("--visual-viewport-inset-bottom");
      root.classList.remove("keyboard-open");
      delete root.dataset.androidCapacitor;
    };
  }, []);
}

import { type RefObject, useEffect } from "react";

/**
 * `enabled`일 때 문서에서 pointerdown이 `containerRef` 밖에서 발생하면 `onOutside` 호출.
 * 모달·오버레이·접이 패널의 바깥 클릭 닫기에 사용.
 */
export function usePointerDownOutside(
  containerRef: RefObject<Element | null>,
  enabled: boolean,
  onOutside: () => void,
): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) {
        return;
      }
      if (!containerRef.current?.contains(target)) {
        onOutside();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [containerRef, enabled, onOutside]);
}

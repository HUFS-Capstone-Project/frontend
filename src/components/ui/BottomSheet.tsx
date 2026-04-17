import { type ReactNode, type TouchEvent, useCallback, useEffect, useRef, useState } from "react";

import { useOverlayFlowController } from "@/features/room/hooks/useOverlayFlowController";
import { cn } from "@/lib/utils";

const BOTTOM_SHEET_TRANSITION_MS = 240;
const DRAG_CLOSE_THRESHOLD = 96;

export type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  panelClassName?: string;
  hideHandle?: boolean;
};

export function BottomSheet({
  open,
  onClose,
  children,
  className,
  overlayClassName,
  panelClassName,
  hideHandle = false,
}: BottomSheetProps) {
  const { isRendered, isVisible, requestClose } = useOverlayFlowController({
    open,
    onClose,
    historyStateKey: "bottomSheet",
    transitionMs: BOTTOM_SHEET_TRANSITION_MS,
  });

  const [dragOffsetY, setDragOffsetY] = useState(0);
  const touchStartYRef = useRef<number | null>(null);
  const shouldDragSheetRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      queueMicrotask(() => {
        setDragOffsetY(0);
      });
      touchStartYRef.current = null;
      shouldDragSheetRef.current = false;
    }
  }, [open]);

  const handleTouchStart = useCallback((event: TouchEvent<HTMLElement>) => {
    touchStartYRef.current = event.touches[0]?.clientY ?? null;
    shouldDragSheetRef.current = (scrollContainerRef.current?.scrollTop ?? 0) <= 0;
  }, []);

  const handleTouchMove = useCallback((event: TouchEvent<HTMLElement>) => {
    const startY = touchStartYRef.current;
    if (startY == null) {
      return;
    }

    const currentY = event.touches[0]?.clientY ?? startY;
    const nextOffset = Math.max(currentY - startY, 0);

    if (!shouldDragSheetRef.current) {
      if ((scrollContainerRef.current?.scrollTop ?? 0) <= 0 && nextOffset > 0) {
        shouldDragSheetRef.current = true;
      } else {
        return;
      }
    }

    if (nextOffset > 0 && shouldDragSheetRef.current) {
      event.preventDefault();
      setDragOffsetY(nextOffset);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    touchStartYRef.current = null;
    shouldDragSheetRef.current = false;

    if (dragOffsetY >= DRAG_CLOSE_THRESHOLD) {
      requestClose();
      queueMicrotask(() => {
        setDragOffsetY(0);
      });
      return;
    }

    setDragOffsetY(0);
  }, [dragOffsetY, requestClose]);

  if (!isRendered) {
    return null;
  }

  const isDragging = dragOffsetY > 0;

  return (
    <div
      className={cn("fixed inset-0 z-70 flex items-end justify-center", className)}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="닫기"
        className={cn(
          "bg-overlay-scrim absolute inset-0 transition-opacity duration-240 ease-out",
          isVisible ? "opacity-100" : "opacity-0",
          overlayClassName,
        )}
        onClick={requestClose}
      />

      <section
        className={cn(
          "bg-background relative z-10 mx-auto flex w-full max-w-lg flex-col overflow-hidden rounded-t-[1.7rem]",
          "max-h-[calc(100dvh-3.5rem)] shadow-sheet",
          isDragging ? "transition-none" : "transition-[transform,opacity] duration-240 ease-out",
          panelClassName,
        )}
        style={{
          transform: isVisible ? `translateY(${dragOffsetY}px)` : "translateY(100%)",
          opacity: isVisible ? 1 : 0,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onClick={(event) => event.stopPropagation()}
      >
        {!hideHandle ? (
          <div className="px-5 pt-2 pb-2">
            <div className="bg-muted-foreground/25 mx-auto h-1 w-16 rounded-full" />
          </div>
        ) : null}

        <div
          ref={scrollContainerRef}
          className="scrollbar-hide min-h-0 flex-1 overflow-y-auto pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        >
          {children}
        </div>
      </section>
    </div>
  );
}

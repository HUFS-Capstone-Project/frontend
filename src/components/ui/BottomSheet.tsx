import { type ReactNode, type TouchEvent, useCallback, useEffect, useRef, useState } from "react";

import { useOverlayFlowController } from "@/features/room/hooks/useOverlayFlowController";
import { cn } from "@/lib/utils";

const BOTTOM_SHEET_TRANSITION_MS = 240;
const DRAG_CLOSE_THRESHOLD = 96;

/** 패널(드래그 핸들 포함) 최대 높이 — 모든 BottomSheet 기본값 (상단 여백 최소) */
const BOTTOM_SHEET_PANEL_MAX_HEIGHT_CLASS = "max-h-[calc(100dvh-0.5rem)]";

export type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  panelClassName?: string;
  contentClassName?: string;
  hideHandle?: boolean;
  enableHistory?: boolean;
  /**
   * true면 시트 패널 높이가 콘텐츠만큼 올라가고(max까지), 넘치는 부분만 본문에서 스크롤한다.
   * false면 본문이 남은 영역을 채우듯 늘어나며(레거시) 스크롤한다.
   */
  intrinsicPanelHeight?: boolean;
};

export function BottomSheet({
  open,
  onClose,
  children,
  className,
  overlayClassName,
  panelClassName,
  contentClassName,
  hideHandle = false,
  enableHistory = true,
  intrinsicPanelHeight = false,
}: BottomSheetProps) {
  const { isRendered, isVisible, requestClose } = useOverlayFlowController({
    open,
    onClose,
    historyStateKey: "bottomSheet",
    transitionMs: BOTTOM_SHEET_TRANSITION_MS,
    enableHistory,
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
          "shadow-sheet",
          BOTTOM_SHEET_PANEL_MAX_HEIGHT_CLASS,
          intrinsicPanelHeight && "h-fit",
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
          <div className="px-6 pt-2 pb-2">
            <div className="bg-muted-foreground/25 mx-auto h-1 w-16 rounded-full" />
          </div>
        ) : null}

        <div
          ref={scrollContainerRef}
          className={cn(
            "scrollbar-hide pb-[max(2rem,env(safe-area-inset-bottom))]",
            intrinsicPanelHeight
              ? "max-h-[calc(100dvh-5.5rem)] flex-none overflow-y-auto"
              : "min-h-0 flex-1 overflow-y-auto",
            contentClassName,
          )}
        >
          {children}
        </div>
      </section>
    </div>
  );
}

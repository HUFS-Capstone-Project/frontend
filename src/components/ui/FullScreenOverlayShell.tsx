import type { ReactNode } from "react";

import { useOverlayFlowController } from "@/features/room/hooks/useOverlayFlowController";
import { cn } from "@/lib/utils";

const DEFAULT_TRANSITION_MS = 180;

export type FullScreenOverlayShellProps = {
  open: boolean;
  onClose: () => void;
  historyStateKey: string;
  children: ReactNode;
  className?: string;
  overlayClassName?: string;
  panelClassName?: string;
  transitionMs?: number;
};

export function FullScreenOverlayShell({
  open,
  onClose,
  historyStateKey,
  children,
  className,
  overlayClassName,
  panelClassName,
  transitionMs = DEFAULT_TRANSITION_MS,
}: FullScreenOverlayShellProps) {
  const { isRendered, isVisible, requestClose } = useOverlayFlowController({
    open,
    onClose,
    historyStateKey,
    transitionMs,
  });

  if (!isRendered) {
    return null;
  }

  return (
    <div
      className={cn("fixed inset-0 z-80 flex items-center justify-center", className)}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="닫기"
        className={cn(
          "absolute inset-0 bg-black/20 transition-opacity duration-180 ease-out md:bg-transparent",
          isVisible ? "opacity-100" : "opacity-0",
          overlayClassName,
        )}
        onClick={requestClose}
      />

      <section
        className={cn(
          "relative z-10 flex h-dvh w-full max-w-lg flex-col overflow-hidden bg-white",
          "transition-[opacity,transform] duration-180 ease-out md:max-w-3xl xl:max-w-lg",
          isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
          panelClassName,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </section>
    </div>
  );
}

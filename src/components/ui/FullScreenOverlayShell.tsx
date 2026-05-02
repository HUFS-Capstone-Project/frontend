import type { ReactNode } from "react";

import { useOverlayFlowController } from "@/features/room/hooks/use-overlay-flow-controller";
import { cn } from "@/lib/utils";
import {
  SHELL_CONTENT_FADE_MS,
  SHELL_CONTENT_FADE_TRANSITION_STYLE,
} from "@/shared/config/ui-timing";
import {
  FULLSCREEN_FLOW_MODAL_OUTER_CLASSES,
  FULLSCREEN_FLOW_PANEL_CLASSES,
} from "@/shared/ui/fullscreen-flow-layout";

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
  transitionMs = SHELL_CONTENT_FADE_MS,
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
      className={cn(FULLSCREEN_FLOW_MODAL_OUTER_CLASSES, className)}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="닫기"
        style={SHELL_CONTENT_FADE_TRANSITION_STYLE}
        className={cn(
          "bg-overlay-scrim absolute inset-0 md:bg-transparent",
          isVisible ? "opacity-100" : "opacity-0",
          overlayClassName,
        )}
        onClick={requestClose}
      />

      <section
        style={SHELL_CONTENT_FADE_TRANSITION_STYLE}
        className={cn(
          FULLSCREEN_FLOW_PANEL_CLASSES,
          isVisible ? "opacity-100" : "opacity-0",
          panelClassName,
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </section>
    </div>
  );
}

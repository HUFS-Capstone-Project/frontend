import type { ReactNode } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";
import {
  FULLSCREEN_FLOW_PANEL_CLASSES,
  FULLSCREEN_FLOW_ROUTE_OUTER_CLASSES,
} from "@/shared/ui/fullscreen-flow-layout";

export type FullscreenFlowRouteMountProps = {
  children: ReactNode;
  panelClassName?: string;
};

/**
 * 라우트가 렌더하는 풀스크린 플로우를 `#root` 밖 레이아웃(패딩·transform 등)과 분리하여
 * `FullScreenOverlayShell`과 같은 패널 기하를 씁니다. Outlet 상위 flex 높이는 spacer로 유지합니다.
 */
export function FullscreenFlowRouteMount({
  children,
  panelClassName,
}: FullscreenFlowRouteMountProps) {
  return (
    <>
      <div className="min-h-0 w-full flex-[1_1_0]" aria-hidden />
      {createPortal(
        <div className={FULLSCREEN_FLOW_ROUTE_OUTER_CLASSES}>
          <section className={cn(FULLSCREEN_FLOW_PANEL_CLASSES, panelClassName)}>
            {children}
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}

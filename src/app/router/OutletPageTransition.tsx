import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useOutlet } from "react-router-dom";

import { getOutletPresenceBranchKey } from "@/app/router/outlet-presence-branch";
import { SHELL_CONTENT_FADE_SECONDS } from "@/shared/config/ui-timing";

/**
 * 라우트 전환 페이드 래퍼.
 * 부모에 `overflow-hidden`을 두면 `-m-page` 마진 확장 영역이 잘리므로 `overflow-visible` 유지한다.
 */
const ROUTER_SHELL_OUTLET_CLASS =
  "flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col items-stretch overflow-visible";

/** 모듈 스코프: motion에 안정 레퍼런스 부여해 불필요한 diff 방지 */
const ROUTE_SHELL_FADE_VARIANT = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
} as const;

const ROUTE_SHELL_FADE_TRANSITION = {
  duration: SHELL_CONTENT_FADE_SECONDS,
  ease: "easeOut" as const,
};

export type OutletTransitionMode = "pathname" | "branch-stable";

type OutletPageTransitionProps = {
  mode?: OutletTransitionMode;
};

export function OutletPageTransition({ mode = "pathname" }: OutletPageTransitionProps) {
  const location = useLocation();
  const element = useOutlet();

  const presenceKey =
    mode === "branch-stable"
      ? getOutletPresenceBranchKey(location.pathname)
      : `${location.pathname}${location.search}`;

  return (
    <div className={ROUTER_SHELL_OUTLET_CLASS}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={presenceKey}
          className={ROUTER_SHELL_OUTLET_CLASS}
          {...ROUTE_SHELL_FADE_VARIANT}
          transition={ROUTE_SHELL_FADE_TRANSITION}
        >
          {element}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

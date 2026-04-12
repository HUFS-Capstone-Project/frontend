import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import { useDocumentVisible } from "@/hooks/use-document-visible";
import { appHeadlineSizeClassName } from "@/lib/app-typography";
import { cn } from "@/lib/utils";

const DEFAULT_DURATION_MS = 550;
/** 한~두 줄 기준 레이아웃 고정 */
const SLOT_CLASS = "min-h-[5rem]";
const EASE_SOFT = [0.4, 0, 0.2, 1] as const;
/** reduced-motion 시 페이드만 (초) */
const REDUCED_MOTION_DURATION_SEC = 0.2;

export type AnimatedTextProps = {
  /** 예: `aria-labelledby` */
  id?: string;
  prefix?: string;
  /** 접근성·라이브; `slotChildren`과 길이·순서 일치 */
  texts: string[];
  /** 전환 시작 간격(ms). 애니 duration과 별개 */
  interval: number;
  durationMs?: number;
  className?: string;
  slotClassName?: string;
  textsClassName?: string;
  /** 있으면 해당 인덱스는 `texts[i]` 대신 렌더 */
  slotChildren?: ReactNode[];
};

const slideMotion = {
  initial: { y: "-100%", opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: "100%", opacity: 0 },
} as const;

const fadeMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
} as const;

/** 순환 영역만 슬라이드·페이드 (Framer Motion). */
export function AnimatedText({
  id,
  prefix,
  texts,
  interval,
  durationMs = DEFAULT_DURATION_MS,
  className,
  slotClassName,
  textsClassName,
  slotChildren,
}: AnimatedTextProps) {
  const safeTexts = useMemo(() => (texts.length > 0 ? texts : [""]), [texts]);
  const [index, setIndex] = useState(0);
  const documentVisible = useDocumentVisible();
  const prefersReducedMotion = useReducedMotion();

  const safeIndex = safeTexts.length > 0 ? Math.min(index, safeTexts.length - 1) : 0;

  useEffect(() => {
    if (import.meta.env.DEV && slotChildren && slotChildren.length !== safeTexts.length) {
      console.warn("AnimatedText: `slotChildren.length` must match `texts.length`.");
    }
  }, [slotChildren, safeTexts.length]);

  useEffect(() => {
    if (safeTexts.length <= 1 || !documentVisible) return;

    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % safeTexts.length);
    }, interval);

    return () => clearInterval(timer);
  }, [documentVisible, interval, safeTexts.length]);

  const useFadeOnly = prefersReducedMotion === true;
  const motionPreset = useFadeOnly ? fadeMotion : slideMotion;
  const durationSec = useFadeOnly ? REDUCED_MOTION_DURATION_SEC : durationMs / 1000;
  const transition = useMemo(
    () => ({
      duration: durationSec,
      ease: EASE_SOFT,
    }),
    [durationSec],
  );

  const lineClass = cn(appHeadlineSizeClassName, "text-foreground", textsClassName);

  const prefixLine = prefix ? (
    <p className={cn(appHeadlineSizeClassName, "text-foreground")}>{prefix}</p>
  ) : null;

  const currentLabel = safeTexts[safeIndex] ?? "";
  const slideKey = currentLabel || `empty-${safeIndex}`;

  if (safeTexts.length <= 1) {
    const rich0 = slotChildren?.[0];
    return (
      <div id={id} className={cn("w-full text-left", className)}>
        {prefixLine}
        <p className={lineClass}>{rich0 !== undefined ? rich0 : safeTexts[0]}</p>
      </div>
    );
  }

  return (
    <div id={id} className={cn("w-full text-left", className)}>
      {prefixLine}

      <div
        className={cn("relative w-full overflow-hidden", SLOT_CLASS, slotClassName)}
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={slideKey}
            className="absolute inset-x-0 top-0 w-full"
            initial={motionPreset.initial}
            animate={motionPreset.animate}
            exit={motionPreset.exit}
            transition={transition}
          >
            <p className={lineClass}>
              {slotChildren?.[safeIndex] !== undefined
                ? slotChildren[safeIndex]
                : safeTexts[safeIndex]}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

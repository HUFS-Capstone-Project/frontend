import { useEffect, useState } from "react";

import { BrandMarkerLoader } from "@/components/ui/BrandMarkerLoader";
import {
  LINK_FLOW_HEADLINE_STACK_CLASS,
  LINK_FLOW_PAGE_CLASS,
} from "@/features/place-flow/link-flow-layout";
import { PLACE_FLOW_COPY } from "@/features/place-flow/place-flow-copy";

function randomDelayMs(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function LinkProcessingScreen() {
  const { titleLine1, titleLine2, processingCarousel, processingCarouselDelayMs } =
    PLACE_FLOW_COPY.linkFromUrl;
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    if (processingCarousel.length <= 1) {
      return;
    }

    let timeoutId: number | undefined;
    let cancelled = false;
    let index = 0;

    const step = () => {
      const { min, max } = processingCarouselDelayMs;
      timeoutId = window.setTimeout(() => {
        if (cancelled) {
          return;
        }
        index += 1;
        setLineIndex(index);
        if (index < processingCarousel.length - 1) {
          step();
        }
      }, randomDelayMs(min, max));
    };

    const run = () => {
      if (cancelled) {
        return;
      }
      setLineIndex(0);
      index = 0;
      step();
    };

    queueMicrotask(run);

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [processingCarousel.length, processingCarouselDelayMs]);

  const line = processingCarousel[lineIndex] ?? processingCarousel[0];

  return (
    <div className={LINK_FLOW_PAGE_CLASS}>
      <div className={LINK_FLOW_HEADLINE_STACK_CLASS}>
        <h2 className="text-foreground text-xl leading-tight font-bold">{titleLine1}</h2>
        <p className="text-foreground text-xl leading-tight font-bold">{titleLine2}</p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-2 pb-8">
        <div className="flex shrink-0 flex-col items-center">
          <BrandMarkerLoader />
        </div>
        <p
          className="text-muted-foreground mt-12 max-w-sm text-center text-sm leading-snug font-normal"
          aria-live="polite"
        >
          {line}
        </p>
      </div>
    </div>
  );
}

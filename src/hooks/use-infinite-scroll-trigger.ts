import { type RefObject, useEffect, useRef } from "react";

type UseInfiniteScrollTriggerOptions = {
  enabled: boolean;
  rootRef?: RefObject<HTMLElement | null>;
  rootMargin?: string;
  onLoadMore: () => void;
};

export function useInfiniteScrollTrigger<TElement extends HTMLElement = HTMLDivElement>({
  enabled,
  rootRef,
  rootMargin = "160px",
  onLoadMore,
}: UseInfiniteScrollTriggerOptions) {
  const targetRef = useRef<TElement | null>(null);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    const target = targetRef.current;
    if (!enabled || !target || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMoreRef.current();
        }
      },
      {
        root: rootRef?.current ?? null,
        rootMargin,
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [enabled, rootMargin, rootRef]);

  return targetRef;
}

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { isHmString } from "@/components/course-planner/course-date-time";
import { cn } from "@/lib/utils";

const ITEM_HEIGHT_PX = 44;
const WHEEL_HEIGHT_PX = 216;
const EDGE_PADDING_PX = (WHEEL_HEIGHT_PX - ITEM_HEIGHT_PX) / 2;

type Period = "AM" | "PM";
type Minute = "00" | "30";

type CompleteTriplet = {
  period: Period;
  hour12: string;
  minute: Minute;
};

const DEFAULT_TRIPLET: CompleteTriplet = {
  period: "AM",
  hour12: "12",
  minute: "00",
};

const PERIOD_ITEMS: { value: Period; label: string }[] = [
  { value: "AM", label: "오전" },
  { value: "PM", label: "오후" },
];

const HOUR_ORDER = ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"] as const;

const MINUTE_ITEMS: { value: Minute; label: string }[] = [
  { value: "00", label: "00" },
  { value: "30", label: "30" },
];

function hmToTriplet(hm: string): CompleteTriplet {
  const [hs, ms] = hm.split(":");
  const h24 = Number(hs);
  const minute: Minute = ms === "30" ? "30" : "00";
  const period: Period = h24 >= 12 ? "PM" : "AM";
  let hour12 = h24 % 12;
  if (hour12 === 0) hour12 = 12;
  return { period, hour12: String(hour12), minute };
}

function tripletToHm(t: CompleteTriplet): string {
  const hour12 = Number(t.hour12);
  let h24 = hour12;
  if (t.period === "AM") {
    if (hour12 === 12) h24 = 0;
  } else if (hour12 !== 12) {
    h24 = hour12 + 12;
  }

  const mm = t.minute === "30" ? "30" : "00";
  return `${String(h24).padStart(2, "0")}:${mm}`;
}

function parseTripletFromValue(value: string | null): CompleteTriplet {
  if (!value || !isHmString(value)) return { ...DEFAULT_TRIPLET };
  return hmToTriplet(value);
}

function scrollTopForIndex(index: number) {
  return index * ITEM_HEIGHT_PX;
}

type WheelColumnProps<T extends string> = {
  ariaLabel: string;
  items: readonly { value: T; label: string }[];
  selected: T;
  onSelect: (next: T) => void;
  disabled?: boolean;
};

function WheelColumn<T extends string>({
  ariaLabel,
  items,
  selected,
  onSelect,
  disabled,
}: WheelColumnProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const syncingRef = useRef(false);
  const settleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [centerIdx, setCenterIdx] = useState(0);

  const scrollToIndex = useCallback(
    (index: number, instant: boolean) => {
      const el = scrollRef.current;
      if (!el) return;
      const clamped = Math.min(items.length - 1, Math.max(0, index));
      const top = scrollTopForIndex(clamped);
      syncingRef.current = true;
      const finishSync = () => {
        queueMicrotask(() => {
          syncingRef.current = false;
        });
      };

      if (instant) {
        el.scrollTop = top;
        setCenterIdx(clamped);
        requestAnimationFrame(() => {
          el.scrollTop = top;
          setCenterIdx(clamped);
          finishSync();
        });
        return;
      }

      setCenterIdx(clamped);
      el.scrollTo({ top, behavior: "smooth" });
      window.setTimeout(() => {
        syncingRef.current = false;
      }, 280);
    },
    [items.length],
  );

  useLayoutEffect(() => {
    if (disabled) return;
    const el = scrollRef.current;
    if (!el) return;
    const idx = items.findIndex((it) => Object.is(it.value, selected));
    const safeIdx = idx >= 0 ? idx : 0;
    const top = scrollTopForIndex(safeIdx);
    syncingRef.current = true;
    el.scrollTop = top;
    const rafId = requestAnimationFrame(() => {
      el.scrollTop = top;
      setCenterIdx(safeIdx);
      queueMicrotask(() => {
        syncingRef.current = false;
      });
    });
    return () => cancelAnimationFrame(rafId);
  }, [disabled, items, selected]);

  const commitScrollPosition = useCallback(() => {
    const el = scrollRef.current;
    if (!el || disabled || syncingRef.current) return;

    const raw = el.scrollTop / ITEM_HEIGHT_PX;
    const idx = Math.min(items.length - 1, Math.max(0, Math.round(raw)));
    const snappedTop = scrollTopForIndex(idx);

    const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
    const clampedTop = Math.min(maxScroll, Math.max(0, snappedTop));

    if (Math.abs(el.scrollTop - clampedTop) > 0.5) {
      el.scrollTop = clampedTop;
    }

    setCenterIdx(idx);
    const next = items[idx]?.value as T;
    if (!Object.is(next, selected)) {
      onSelect(next);
    }
  }, [disabled, items, onSelect, selected]);

  const scheduleCommit = useCallback(
    (delay: number) => {
      if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = window.setTimeout(() => {
        settleTimerRef.current = null;
        commitScrollPosition();
      }, delay);
    },
    [commitScrollPosition],
  );

  const handleScroll = useCallback(() => {
    if (syncingRef.current) return;
    const el = scrollRef.current;
    if (!el || disabled) return;

    const idx = Math.min(items.length - 1, Math.max(0, Math.round(el.scrollTop / ITEM_HEIGHT_PX)));
    setCenterIdx(idx);

    scheduleCommit(140);
  }, [disabled, items.length, scheduleCommit]);

  const handleScrollEnd = useCallback(() => {
    if (syncingRef.current) return;
    scheduleCommit(80);
  }, [scheduleCommit]);

  if (disabled) {
    return (
      <div
        className="bg-muted/20 text-muted-foreground flex flex-1 items-center justify-center text-center text-xs"
        style={{ height: WHEEL_HEIGHT_PX }}
        aria-hidden
      />
    );
  }

  return (
    <div className="relative min-h-0 min-w-0 flex-1" style={{ height: WHEEL_HEIGHT_PX }}>
      <div
        ref={scrollRef}
        className="scrollbar-hide h-full min-h-0 overflow-y-auto overscroll-y-contain"
        style={{
          scrollSnapType: "y mandatory",
          scrollPaddingBlock: `${EDGE_PADDING_PX}px`,
          WebkitOverflowScrolling: "touch",
        }}
        onScroll={handleScroll}
        onScrollEnd={handleScrollEnd}
        onTouchEnd={handleScrollEnd}
        onPointerUp={handleScrollEnd}
        onPointerCancel={handleScrollEnd}
        role="listbox"
        aria-label={ariaLabel}
      >
        <div style={{ paddingTop: EDGE_PADDING_PX, paddingBottom: EDGE_PADDING_PX }}>
          {items.map((item, index) => {
            const atCenter = index === centerIdx;
            const dist = Math.abs(index - centerIdx);
            return (
              <div
                key={`${item.value}-${index}`}
                role="option"
                aria-selected={Object.is(item.value, selected)}
                onClick={() => {
                  setCenterIdx(index);
                  scrollToIndex(index, false);
                  onSelect(item.value);
                }}
                className={cn(
                  "flex shrink-0 cursor-pointer snap-center snap-always items-center justify-center text-[15px] tracking-tight",
                  atCenter && "text-brand-coral font-semibold",
                  !atCenter &&
                    dist === 1 &&
                    "text-muted-foreground/55 dark:text-muted-foreground/50 font-normal",
                  !atCenter &&
                    dist >= 2 &&
                    "text-muted-foreground/38 dark:text-muted-foreground/35 font-normal",
                )}
                style={{
                  height: ITEM_HEIGHT_PX,
                  scrollSnapAlign: "center",
                  scrollSnapStop: "always",
                }}
              >
                {item.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

type AmPmTimeWheelGroupProps = {
  label: string;
  value: string | null;
  onChange: (next: string | null) => void;
};

export function AmPmTimeWheelGroup({ label, value, onChange }: AmPmTimeWheelGroupProps) {
  const [triplet, setTriplet] = useState<CompleteTriplet>(() => parseTripletFromValue(value));
  const hasUserAdjustedRef = useRef(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (value !== null && isHmString(value)) {
        setTriplet(hmToTriplet(value));
        return;
      }
      setTriplet({ ...DEFAULT_TRIPLET });
      hasUserAdjustedRef.current = false;
    });
    return () => cancelAnimationFrame(id);
  }, [value]);

  const hourItems = useMemo(() => HOUR_ORDER.map((h) => ({ value: h, label: h })), []);

  const tryCommit = useCallback(
    (next: CompleteTriplet) => {
      const hm = tripletToHm(next);
      if (value === null && !hasUserAdjustedRef.current) return;
      onChange(hm);
    },
    [onChange, value],
  );

  const markUserAdjusted = useCallback(() => {
    hasUserAdjustedRef.current = true;
  }, []);

  const handlePeriod = useCallback(
    (next: Period) => {
      markUserAdjusted();
      setTriplet((prev) => {
        const nt = { ...prev, period: next };
        tryCommit(nt);
        return nt;
      });
    },
    [markUserAdjusted, tryCommit],
  );

  const handleHour = useCallback(
    (next: string) => {
      markUserAdjusted();
      setTriplet((prev) => {
        const nt = { ...prev, hour12: next };
        tryCommit(nt);
        return nt;
      });
    },
    [markUserAdjusted, tryCommit],
  );

  const handleMinute = useCallback(
    (next: Minute) => {
      markUserAdjusted();
      setTriplet((prev) => {
        const nt = { ...prev, minute: next };
        tryCommit(nt);
        return nt;
      });
    },
    [markUserAdjusted, tryCommit],
  );

  return (
    <div className="grid w-full min-w-0 gap-1.5">
      <span className="text-muted-foreground w-full px-0.5 text-center text-[0.62rem] leading-snug font-semibold whitespace-normal">
        {label}
      </span>

      <div className="relative overflow-hidden rounded-2xl">
        <div
          className="from-background via-background/85 pointer-events-none absolute inset-x-0 top-0 z-20 h-16 bg-linear-to-b to-transparent"
          aria-hidden
        />
        <div
          className="from-background via-background/85 pointer-events-none absolute inset-x-0 bottom-0 z-20 h-16 bg-linear-to-t to-transparent"
          aria-hidden
        />

        <div
          className="divide-border/25 relative z-0 flex min-h-0 divide-x"
          onPointerDownCapture={markUserAdjusted}
          onWheelCapture={markUserAdjusted}
        >
          <WheelColumn<Period>
            ariaLabel={`${label} 오전·오후`}
            items={PERIOD_ITEMS}
            selected={triplet.period}
            onSelect={handlePeriod}
          />
          <WheelColumn<string>
            ariaLabel={`${label} 시`}
            items={hourItems}
            selected={triplet.hour12}
            onSelect={handleHour}
          />
          <WheelColumn<Minute>
            ariaLabel={`${label} 분`}
            items={MINUTE_ITEMS}
            selected={triplet.minute}
            onSelect={handleMinute}
          />
        </div>
      </div>
    </div>
  );
}

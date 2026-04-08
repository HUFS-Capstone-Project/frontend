import { cn } from "@/lib/utils";

type PageIndicatorProps = {
  /** 전체 단계 수 */
  total: number;
  /** 현재 단계 (0부터 시작) */
  activeIndex: number;
  className?: string;
};

/**
 * 하단 점 인디케이터 (온보딩 단계 확장용).
 */
export function PageIndicator({
  total,
  activeIndex,
  className,
}: PageIndicatorProps) {
  return (
    <div
      className={cn("flex items-center justify-center gap-2", className)}
      role="status"
      aria-label={`온보딩 ${activeIndex + 1} / ${total} 단계`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={`page-dot-${i}`}
          className={cn(
            "h-2 w-2 rounded-full transition-colors",
            i === activeIndex ? "bg-onboarding-point" : "bg-zinc-300/90",
          )}
        />
      ))}
    </div>
  );
}

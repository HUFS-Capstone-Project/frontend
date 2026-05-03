import { RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";

type CoursePlannerActionsProps = {
  canGenerate: boolean;
  onGenerate: () => void;
  onReset: () => void;
};

export function CoursePlannerActions({
  canGenerate,
  onGenerate,
  onReset,
}: CoursePlannerActionsProps) {
  return (
    <div className="mt-4 flex gap-2">
      <button
        type="button"
        onClick={onReset}
        className="border-border bg-background text-muted-foreground hover:bg-muted/50 focus-visible:ring-ring/50 inline-flex size-11 items-center justify-center rounded-lg border transition-colors focus-visible:ring-3 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        aria-label="다시 설정하기"
      >
        <RotateCcw className="size-4" aria-hidden />
      </button>

      <button
        type="button"
        onClick={onGenerate}
        disabled={!canGenerate}
        className={cn(
          "focus-visible:ring-ring/50 text-primary-foreground inline-flex h-11 flex-1 items-center justify-center rounded-lg text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none disabled:pointer-events-none",
          canGenerate ? "bg-primary hover:bg-primary/90" : "bg-muted-foreground/45",
        )}
      >
        데이트 코스 만들기
      </button>
    </div>
  );
}

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
    <div className="mt-5 flex gap-2">
      <button
        type="button"
        onClick={onReset}
        className="focus-visible:ring-ring/50 inline-flex size-11 items-center justify-center rounded-lg border border-[#d9d9d9] bg-white text-[#5f6368] transition-colors hover:bg-[#f8f8f8] focus-visible:ring-3 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        aria-label="다시 설정하기"
      >
        <RotateCcw className="size-4" aria-hidden />
      </button>

      <button
        type="button"
        onClick={onGenerate}
        disabled={!canGenerate}
        className={cn(
          "focus-visible:ring-ring/50 inline-flex h-11 flex-1 items-center justify-center rounded-lg text-sm font-semibold text-white transition-colors focus-visible:ring-3 focus-visible:outline-none disabled:pointer-events-none",
          canGenerate ? "bg-[#f06f6b] hover:bg-[#e86460]" : "bg-[#aaaaaa]",
        )}
      >
        데이트코스 생성하기
      </button>
    </div>
  );
}

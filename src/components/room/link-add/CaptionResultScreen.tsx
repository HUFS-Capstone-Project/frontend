import type { ReactNode } from "react";

import { PillButton } from "@/components/ui/PillButton";
import type { CaptionResult } from "@/features/room/link-add";
import { cn } from "@/lib/utils";

export type CaptionResultScreenProps = {
  roomName: string;
  result: CaptionResult;
  onClose: () => void;
  onRetry: () => void;
  onSave?: () => void;
  isSavePending?: boolean;
  hasSaved?: boolean;
  onMoveToMockPlaces?: () => void;
};

export function CaptionResultScreen({
  roomName,
  result,
  onClose,
  onRetry,
  onSave,
  isSavePending = false,
  hasSaved = false,
  onMoveToMockPlaces,
}: CaptionResultScreenProps) {
  const isSucceeded = result.status === "SUCCEEDED";
  const isFailed = result.status === "FAILED";
  const canSave = isSucceeded && onSave != null;

  return (
    <div className="scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-16 pb-8">
      <div className="space-y-1">
        <h2 className="text-foreground text-xl leading-tight font-bold">{roomName}</h2>
        <p className="text-foreground text-xl leading-tight font-bold">캡션 추출 결과</p>
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="space-y-3">
          <ResultRow label="linkId" value={String(result.linkId)} />
          <ResultRow label="originalUrl" value={result.originalUrl} />
          <ResultRow label="status">
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                isSucceeded && "bg-emerald-50 text-emerald-700",
                isFailed && "bg-red-50 text-red-700",
                !isSucceeded && !isFailed && "bg-zinc-100 text-zinc-700",
              )}
            >
              {result.status}
            </span>
          </ResultRow>
          <ResultRow label="caption" value={result.caption ?? "(없음)"} />
        </div>
      </div>

      {onMoveToMockPlaces ? (
        <button
          type="button"
          className="text-brand-coral mt-4 self-start text-xs font-semibold underline underline-offset-4"
          onClick={onMoveToMockPlaces}
        >
          (Mock) 장소 후보 화면으로 이동
        </button>
      ) : null}

      <div
        className={cn(
          "mt-auto grid gap-2.5 pt-6",
          canSave || !isSucceeded ? "grid-cols-2" : "grid-cols-1",
        )}
      >
        <PillButton type="button" variant="outline" onClick={onClose}>
          닫기
        </PillButton>
        {canSave ? (
          <PillButton
            type="button"
            variant={hasSaved ? "onboardingMuted" : "onboarding"}
            disabled={hasSaved || isSavePending}
            onClick={onSave}
          >
            {hasSaved ? "저장됨" : isSavePending ? "저장 중..." : "저장하기"}
          </PillButton>
        ) : !isSucceeded ? (
          <PillButton
            type="button"
            variant={isFailed ? "onboarding" : "onboardingMuted"}
            disabled={!isFailed}
            onClick={onRetry}
          >
            재시도
          </PillButton>
        ) : null}
      </div>
    </div>
  );
}

type ResultRowProps = {
  label: string;
  value?: string;
  children?: ReactNode;
};

function ResultRow({ label, value, children }: ResultRowProps) {
  return (
    <div className="grid grid-cols-[88px_minmax(0,1fr)] items-start gap-2 text-sm">
      <span className="text-muted-foreground text-xs font-semibold uppercase">{label}</span>
      <div className="min-w-0 break-all text-zinc-700">{children ?? value}</div>
    </div>
  );
}

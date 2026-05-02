import type { ReactNode } from "react";

import { PillButton } from "@/components/ui/PillButton";
import { canRetryLinkAnalysis } from "@/features/link-analysis";
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
  const isDispatchFailed = result.status === "DISPATCH_FAILED";
  const canRetry = canRetryLinkAnalysis(result.status);
  const canSave = isSucceeded && onSave != null;

  return (
    <div className="scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pt-16 pb-8">
      <div className="space-y-1">
        <h2 className="text-foreground text-xl leading-tight font-bold">{roomName}</h2>
        <p className="text-foreground text-xl leading-tight font-bold">캡션 추출 결과</p>
      </div>

      <div className="bg-card border-border mt-6 rounded-2xl border p-4">
        <div className="space-y-3">
          <ResultRow label="linkId" value={String(result.linkId)} />
          <ResultRow label="originalUrl" value={result.originalUrl} />
          <ResultRow label="status">
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                isSucceeded && "bg-success-soft text-success-foreground",
                (isFailed || isDispatchFailed) && "bg-error-soft text-error-foreground",
                !isSucceeded && !isFailed && !isDispatchFailed && "bg-muted text-foreground",
              )}
            >
              {result.status}
            </span>
          </ResultRow>
          <ResultRow label="caption" value={result.caption ?? "(없음)"} />
          {result.errorMessage ? <ResultRow label="error" value={result.errorMessage} /> : null}
        </div>
      </div>

      {onMoveToMockPlaces ? (
        <button
          type="button"
          className="text-primary mt-4 self-start text-xs font-semibold underline underline-offset-4"
          onClick={onMoveToMockPlaces}
        >
          (Mock) 장소 후보 화면으로 이동
        </button>
      ) : null}

      <div
        className={cn(
          "mt-auto grid gap-2.5 pt-6",
          canSave || canRetry ? "grid-cols-2" : "grid-cols-1",
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
        ) : canRetry ? (
          <PillButton type="button" variant="onboarding" onClick={onRetry}>
            다시 시도
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
      <div className="text-foreground min-w-0 break-all">{children ?? value}</div>
    </div>
  );
}

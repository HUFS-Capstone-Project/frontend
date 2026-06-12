import { cn } from "@/lib/utils";

type CharacterLimitFeedbackProps = {
  currentLength: number;
  maxLength: number;
  warning?: string | null;
  warningId?: string;
  className?: string;
};

export function CharacterLimitFeedback({
  currentLength,
  maxLength,
  warning,
  warningId,
  className,
}: CharacterLimitFeedbackProps) {
  const hasWarning = Boolean(warning);
  const displayedLength = Math.min(currentLength, maxLength);

  return (
    <div className={cn("mt-2 grid min-h-5 grid-cols-[minmax(0,1fr)_auto] gap-3 px-1", className)}>
      <p
        id={warningId}
        className={cn("text-destructive min-w-0 text-xs", !hasWarning && "invisible")}
        aria-hidden={!hasWarning}
        aria-live={hasWarning ? "polite" : undefined}
      >
        {warning ?? " "}
      </p>
      <p
        className="text-muted-foreground shrink-0 text-xs tabular-nums"
        aria-label="Character count"
      >
        {displayedLength}/{maxLength}
      </p>
    </div>
  );
}

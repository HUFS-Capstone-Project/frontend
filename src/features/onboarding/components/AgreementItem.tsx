import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type AgreementItemProps = {
  id: string;
  label: string;
  /** true: (필수), false: (선택), `showBadge`가 true일 때만 표시 */
  required: boolean;
  /** false면 전체동의처럼 배지 없음 */
  showBadge?: boolean;
  checked: boolean;
  onToggle: () => void;
  className?: string;
};

/**
 * 약관 한 줄 — 원형 체크 + 라벨 + (필수)/(선택).
 */
export function AgreementItem({
  id,
  label,
  required,
  showBadge = true,
  checked,
  onToggle,
  className,
}: AgreementItemProps) {
  const labelId = `${id}-label`;

  return (
    <div className={cn(className)}>
      <button
        type="button"
        id={id}
        role="checkbox"
        aria-checked={checked}
        aria-labelledby={labelId}
        onClick={onToggle}
        className="text-foreground active:bg-tap-highlight flex w-full cursor-pointer items-start gap-3 rounded-xl py-2.5 text-left text-[0.98rem] leading-snug"
      >
        <span
          className={cn(
            "mt-0.5 flex h-[1.375rem] w-[1.375rem] shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            checked
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card",
          )}
          aria-hidden
        >
          {checked ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
        </span>
        <span id={labelId} className="min-w-0 flex-1 pt-0.5">
          {label}
          {showBadge ? (
            <>
              {" "}
              {required ? (
                <span className="text-onboarding-point font-medium">(필수)</span>
              ) : (
                <span className="text-muted-foreground">(선택)</span>
              )}
            </>
          ) : null}
        </span>
      </button>
    </div>
  );
}

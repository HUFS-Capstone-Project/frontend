import { useCallback, useId } from "react";

import { cn } from "@/lib/utils";

import {
  nicknameLimitExceededMessage,
  resolveNicknamePlaceholder,
} from "../constants";
import { useControlledMaxLengthWarning } from "../hooks/use-controlled-max-length-warning";
import { UnderlineTextField } from "./UnderlineTextField";

/** 주의 문구 영역: `invisible`로 가릴 때도 레이아웃 유지 */
const HINT_SLOT_CLASS = "mt-2 min-h-11";

type NicknameInputSectionProps = {
  /** 접근성 라벨 · clear 버튼 문구에 사용 */
  label: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  maxLength?: number;
};

/**
 * 닉네임 온보딩 입력 블록 (값·변경·지우기만 상위에서 제어).
 */
export function NicknameInputSection({
  label,
  value,
  onChange,
  onClear,
  placeholder,
  className,
  autoFocus,
  maxLength,
}: NicknameInputSectionProps) {
  const id = useId();
  const hintId = `${id}-hint`;

  const {
    limitWarning,
    notifyLimitAttempt,
    applyChange,
    handleCompositionStart,
    handleCompositionEnd,
  } = useControlledMaxLengthWarning(maxLength, value);

  const handleFieldChange = useCallback(
    (next: string) => {
      applyChange(next, onChange);
    },
    [applyChange, onChange],
  );

  const resolvedPlaceholder = resolveNicknamePlaceholder(
    placeholder,
    maxLength,
  );

  return (
    <section
      className={cn("w-full", className)}
      aria-label={label}
    >
      <UnderlineTextField
        id={id}
        label={label}
        value={value}
        onChange={handleFieldChange}
        onClear={onClear}
        placeholder={resolvedPlaceholder}
        autoComplete="nickname"
        autoFocus={autoFocus}
        maxLength={maxLength}
        onLimitAttempt={maxLength !== undefined ? notifyLimitAttempt : undefined}
        describedById={
          maxLength !== undefined && limitWarning ? hintId : undefined
        }
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
      />
      {maxLength !== undefined ? (
        <div className={HINT_SLOT_CLASS}>
          <p
            id={hintId}
            className={cn(
              "text-sm text-destructive",
              !limitWarning && "invisible",
            )}
            aria-hidden={!limitWarning}
            aria-live={limitWarning ? "polite" : undefined}
          >
            {nicknameLimitExceededMessage(maxLength)}
          </p>
        </div>
      ) : null}
    </section>
  );
}

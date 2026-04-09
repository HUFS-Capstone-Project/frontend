import { X } from "lucide-react";
import * as React from "react";

import { appFormInputTextClassName } from "@/lib/app-typography";
import { lengthAfterInsertAtSelection } from "@/lib/string-max-length";
import { cn } from "@/lib/utils";

const CLEAR_SLOT =
  "flex h-8 w-8 shrink-0 items-center justify-center";

type UnderlineTextFieldProps = {
  id: string;
  /** 스크린리더용 라벨 */
  label: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
  autoComplete?: string;
  maxLength?: number;
  /** `maxLength`보다 길어지는 입력·붙여넣기 시도 시 */
  onLimitAttempt?: () => void;
  describedById?: string;
  onCompositionStart?: () => void;
  onCompositionEnd?: (e: React.CompositionEvent<HTMLInputElement>) => void;
};

/**
 * 밑줄 입력 + clear 슬롯 고정 너비(레이아웃 시프트 방지).
 */
export function UnderlineTextField({
  id,
  label,
  value,
  onChange,
  onClear,
  placeholder = "",
  className,
  inputClassName,
  autoFocus,
  autoComplete = "off",
  maxLength,
  onLimitAttempt,
  describedById,
  onCompositionStart,
  onCompositionEnd,
}: UnderlineTextFieldProps) {
  const hasValue = value.length > 0;

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (maxLength === undefined || !onLimitAttempt) return;
      if ((e.nativeEvent as KeyboardEvent).isComposing) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.length !== 1) return;
      const el = e.currentTarget;
      const nextLen = lengthAfterInsertAtSelection(
        value,
        el.selectionStart,
        el.selectionEnd,
        1,
      );
      if (nextLen > maxLength) onLimitAttempt();
    },
    [maxLength, onLimitAttempt, value],
  );

  const handlePaste = React.useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (maxLength === undefined || !onLimitAttempt) return;
      const text = e.clipboardData.getData("text");
      if (!text) return;
      const el = e.currentTarget;
      const nextLen = lengthAfterInsertAtSelection(
        value,
        el.selectionStart,
        el.selectionEnd,
        text.length,
      );
      if (nextLen > maxLength) onLimitAttempt();
    },
    [maxLength, onLimitAttempt, value],
  );

  const clear = () => {
    if (onClear) onClear();
    else onChange("");
  };

  return (
    <div className={cn("relative", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="flex min-h-11 items-center gap-2 border-b border-zinc-200 pb-2 transition-colors focus-within:border-onboarding-point/70">
        <input
          id={id}
          type="text"
          value={value}
          autoComplete={autoComplete}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          autoFocus={autoFocus}
          maxLength={maxLength}
          aria-describedby={describedById}
          onChange={(e) => onChange(e.target.value)}
          onCompositionStart={onCompositionStart}
          onCompositionEnd={onCompositionEnd}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          className={cn(
            "min-h-0 min-w-0 flex-1 bg-transparent py-1 placeholder:text-zinc-400 focus:outline-none",
            appFormInputTextClassName,
            inputClassName,
          )}
        />
        <div className={CLEAR_SLOT} aria-hidden={!hasValue}>
          <button
            type="button"
            aria-label={`${label} 지우기`}
            tabIndex={hasValue ? 0 : -1}
            className={cn(
              "flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-zinc-400 transition-colors active:bg-zinc-100",
              !hasValue && "pointer-events-none invisible",
            )}
            onClick={() => {
              if (!hasValue) return;
              clear();
            }}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white">
              <X className="h-3.5 w-3.5" strokeWidth={2.5} />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

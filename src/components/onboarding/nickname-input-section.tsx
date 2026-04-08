import * as React from "react";

import { cn } from "@/lib/utils";

import { UnderlineTextField } from "./underline-text-field";

type NicknameInputSectionProps = {
  /** 접근성 라벨 · clear 버튼 문구에 사용 */
  label: string;
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
};

/**
 * 닉네임 온보딩 입력 블록 (값·변경·지우기만 상위에서 제어).
 */
export function NicknameInputSection({
  label,
  value,
  onChange,
  onClear,
  placeholder = "닉네임 입력",
  className,
  autoFocus,
}: NicknameInputSectionProps) {
  const id = React.useId();

  return (
    <section
      className={cn("w-full", className)}
      aria-label={label}
    >
      <UnderlineTextField
        id={id}
        label={label}
        value={value}
        onChange={onChange}
        onClear={onClear}
        placeholder={placeholder}
        autoComplete="nickname"
        autoFocus={autoFocus}
      />
    </section>
  );
}

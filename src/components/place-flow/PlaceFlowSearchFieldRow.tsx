import type { Ref } from "react";

import { SearchField } from "@/components/common/SearchField";
import { cn } from "@/lib/utils";

export type PlaceFlowSearchFieldRowProps = {
  id: string;
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  searchButtonLabel: string;
  onSubmitSearch: () => void;
  searchButtonDisabled: boolean;
  inputRef?: Ref<HTMLInputElement>;
  className?: string;
  inputClassName?: string;
  readOnly?: boolean;
  onClick?: () => void;
  onFocus?: () => void;
};

/** 풀스크린 검색 라벨 + `SearchField` — 동일 패딩·높이 */
export function PlaceFlowSearchFieldRow({
  id,
  value,
  onChange,
  placeholder,
  searchButtonLabel,
  onSubmitSearch,
  searchButtonDisabled,
  inputRef,
  className,
  inputClassName,
  readOnly = false,
  onClick,
  onFocus,
}: PlaceFlowSearchFieldRowProps) {
  return (
    <label className={cn("flex min-h-14 items-center gap-2", className)} htmlFor={id}>
      <SearchField
        ref={inputRef}
        id={id}
        className="min-w-0 flex-1"
        inputClassName={inputClassName}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        placeholder={placeholder}
        searchButtonLabel={searchButtonLabel}
        onSubmitSearch={onSubmitSearch}
        searchButtonDisabled={searchButtonDisabled}
        readOnly={readOnly}
        onClick={onClick}
        onFocus={onFocus}
      />
    </label>
  );
}

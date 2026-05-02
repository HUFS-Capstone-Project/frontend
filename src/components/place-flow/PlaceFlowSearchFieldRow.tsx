import { SearchField } from "@/components/common/SearchField";

export type PlaceFlowSearchFieldRowProps = {
  id: string;
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  searchButtonLabel: string;
  onSubmitSearch: () => void;
  searchButtonDisabled: boolean;
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
}: PlaceFlowSearchFieldRowProps) {
  return (
    <label className="flex min-h-14 items-center gap-2" htmlFor={id}>
      <SearchField
        id={id}
        className="min-w-0 flex-1"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        placeholder={placeholder}
        searchButtonLabel={searchButtonLabel}
        onSubmitSearch={onSubmitSearch}
        searchButtonDisabled={searchButtonDisabled}
      />
    </label>
  );
}

import { X } from "lucide-react";

const MAX_MEMO_LENGTH = 50;

type SavedPlaceMemoEditorProps = {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onClear: () => void;
};

export function SavedPlaceMemoEditor({
  value,
  onChange,
  onSave,
  onClear,
}: SavedPlaceMemoEditorProps) {
  return (
    <div className="mt-2 flex items-center rounded-md border border-[#7da4ff] bg-white px-3 py-1.5">
      <input
        type="text"
        value={value}
        maxLength={MAX_MEMO_LENGTH}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onSave}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
        className="min-w-0 flex-1 bg-transparent text-xs font-medium text-[#222222] outline-none placeholder:text-[#9a9a9a]"
        placeholder="메모를 남겨주세요."
        autoFocus
      />
      {value ? (
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onClear}
          className="ml-2 text-[#777777]"
        >
          <X className="size-3.5" aria-hidden />
          <span className="sr-only">메모 지우기</span>
        </button>
      ) : null}
      <span className="ml-2 text-[0.6rem] font-medium text-[#777777]">{value.length}/50</span>
    </div>
  );
}

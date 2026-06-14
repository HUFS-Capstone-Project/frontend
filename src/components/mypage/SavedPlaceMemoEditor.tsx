import { X } from "lucide-react";

import { CharacterLimitFeedback } from "@/components/common/CharacterLimitFeedback";
import { cn } from "@/lib/utils";

export const MAX_MEMO_LENGTH = 50;

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
  const displayValue = value.slice(0, MAX_MEMO_LENGTH);

  return (
    <div className="mt-2">
      <div
        className={cn(
          "border-input bg-background flex h-9 w-full items-center gap-1.5 rounded-lg border px-2.5 outline-none",
          "ring-0 focus-within:ring-0",
        )}
      >
        <label htmlFor="saved-place-memo-input" className="sr-only">
          장소 메모
        </label>
        <input
          id="saved-place-memo-input"
          type="text"
          value={displayValue}
          maxLength={MAX_MEMO_LENGTH}
          autoComplete="off"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="none"
          aria-describedby="saved-place-memo-count"
          onChange={(event) => onChange(event.target.value.slice(0, MAX_MEMO_LENGTH))}
          onBlur={onSave}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur();
            }
          }}
          className="text-foreground placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent py-1 text-xs font-medium ring-0 outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="메모를 남겨주세요"
          autoFocus
        />
        {displayValue ? (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onClear}
            className="text-muted-foreground hover:text-foreground hover:bg-muted/55 inline-flex size-7 shrink-0 items-center justify-center rounded-full ring-0 transition-colors outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <X className="size-3" aria-hidden />
            <span className="sr-only">메모 지우기</span>
          </button>
        ) : null}
      </div>
      <CharacterLimitFeedback
        warningId="saved-place-memo-count"
        currentLength={displayValue.length}
        maxLength={MAX_MEMO_LENGTH}
        className="mt-1 min-h-4 px-0.5"
      />
    </div>
  );
}

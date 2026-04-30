import { MoreVertical } from "lucide-react";
import { useCallback, useRef } from "react";

import { usePointerDownOutside } from "@/hooks/use-pointer-down-outside";

import type { SavedPlace } from "./mypage-mock-data";
import { SavedPlaceMemoEditor } from "./SavedPlaceMemoEditor";

type SavedPlaceItemProps = {
  place: SavedPlace;
  isMenuOpen: boolean;
  isEditing: boolean;
  memoDraft: string;
  onToggleMenu: (id: string) => void;
  onStartMemo: (place: SavedPlace) => void;
  onChangeMemo: (value: string) => void;
  onSaveMemo: () => void;
  onClearMemo: () => void;
  onDelete: (id: string) => void;
  onSelect: (place: SavedPlace) => void;
};

export function SavedPlaceItem({
  place,
  isMenuOpen,
  isEditing,
  memoDraft,
  onToggleMenu,
  onStartMemo,
  onChangeMemo,
  onSaveMemo,
  onClearMemo,
  onDelete,
  onSelect,
}: SavedPlaceItemProps) {
  const menuChromeRef = useRef<HTMLDivElement>(null);
  const closeMenu = useCallback(() => {
    onToggleMenu(place.id);
  }, [onToggleMenu, place.id]);
  usePointerDownOutside(menuChromeRef, isMenuOpen, closeMenu);

  return (
    <article className="rounded-lg border border-[#e8e8e8] bg-white px-3 py-3">
      <div className="flex gap-3">
        <button type="button" onClick={() => onSelect(place)} className="min-w-0 flex-1 text-left">
          <h3 className="truncate text-sm font-semibold text-[#222222]">{place.name}</h3>
          <p className="mt-1 truncate text-[0.68rem] font-medium text-[#777777]">{place.address}</p>
        </button>

        <div ref={menuChromeRef} className="relative -mt-2 -mr-2 shrink-0 self-start">
          <button
            type="button"
            onClick={() => onToggleMenu(place.id)}
            className="touch-target-min flex shrink-0 items-center justify-center rounded-full text-[#222222]"
          >
            <MoreVertical className="size-4" aria-hidden />
            <span className="sr-only">장소 메뉴 열기</span>
          </button>

          {isMenuOpen ? (
            <div className="absolute top-[calc(100%-6px)] right-2 z-10 w-24 overflow-hidden rounded-md border border-[#eaeaea] bg-white py-0.5 shadow-[0_2px_8px_rgb(0_0_0/_0.07)]">
              <button
                type="button"
                onClick={() => onStartMemo(place)}
                className="block w-full px-4 py-2.5 text-left text-xs font-medium text-[#595959] active:bg-[#f7f7f7]"
              >
                메모
              </button>
              <button
                type="button"
                onClick={() => onDelete(place.id)}
                className="block w-full px-4 py-2.5 text-left text-xs font-medium text-[#595959] active:bg-[#f7f7f7]"
              >
                삭제
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {place.memo && !isEditing ? (
        <p className="text-foreground border-border/50 bg-muted/20 mt-2 rounded-lg border px-3 py-2 text-xs leading-relaxed font-medium">
          {place.memo}
        </p>
      ) : null}

      {isEditing ? (
        <SavedPlaceMemoEditor
          value={memoDraft}
          onChange={onChangeMemo}
          onSave={onSaveMemo}
          onClear={onClearMemo}
        />
      ) : null}
    </article>
  );
}

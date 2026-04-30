import { MoreVertical } from "lucide-react";

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
  return (
    <article className="relative rounded-lg border border-[#e8e8e8] bg-white px-3 py-3">
      <div className="flex gap-3">
        <button type="button" onClick={() => onSelect(place)} className="min-w-0 flex-1 text-left">
          <h3 className="truncate text-sm font-semibold text-[#222222]">{place.name}</h3>
          <p className="mt-1 truncate text-[0.68rem] font-medium text-[#777777]">{place.address}</p>
        </button>

        <button
          type="button"
          onClick={() => onToggleMenu(place.id)}
          className="touch-target-min -mt-2 -mr-2 flex shrink-0 items-center justify-center rounded-full text-[#222222]"
        >
          <MoreVertical className="size-4" aria-hidden />
          <span className="sr-only">장소 메뉴 열기</span>
        </button>
      </div>

      {place.memo && !isEditing ? (
        <p className="mt-2 rounded-md bg-[#ffecea] px-3 py-2 text-xs font-medium text-[#333333]">
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

      {isMenuOpen ? (
        <div className="absolute top-9 right-8 z-10 w-24 overflow-hidden rounded-md border border-[#e5e5e5] bg-white shadow-[0_8px_20px_rgb(0_0_0_/_0.12)]">
          <button
            type="button"
            onClick={() => onStartMemo(place)}
            className="block w-full px-4 py-2 text-left text-xs font-medium text-[#222222] active:bg-[#f7f7f7]"
          >
            메모
          </button>
          <button
            type="button"
            onClick={() => onDelete(place.id)}
            className="block w-full px-4 py-2 text-left text-xs font-medium text-[#222222] active:bg-[#f7f7f7]"
          >
            삭제
          </button>
        </div>
      ) : null}
    </article>
  );
}

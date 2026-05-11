import { MapPin, MoreVertical } from "lucide-react";
import { useCallback, useRef } from "react";

import { renderMapPrimaryCategoryIcon } from "@/components/map/filters/map-category-icons";
import { usePointerDownOutside } from "@/hooks/use-pointer-down-outside";
import { cn } from "@/lib/utils";
import { sharePlace } from "@/shared/lib/share-place";
import type { SavedPlace } from "@/shared/types/my-page";

import { SavedPlaceMemoEditor } from "./SavedPlaceMemoEditor";

type SavedPlaceItemProps = {
  place: SavedPlace;
  /** 카테고리 코드 → 표시명 (지도 필터 taxonomy와 동일). 없으면 `place.category` 문자열 그대로 표시 */
  categoryNameByCode?: Record<string, string>;
  /** true면 마이페이지용 메뉴·메모 편집 없이 카드만 표시(목록 탭 등) */
  readOnly?: boolean;
  isMenuOpen?: boolean;
  isEditing?: boolean;
  memoDraft?: string;
  onToggleMenu?: (id: string) => void;
  onStartMemo?: (place: SavedPlace) => void;
  onChangeMemo?: (value: string) => void;
  onSaveMemo?: () => void;
  onClearMemo?: () => void;
  onDelete?: (id: string) => void;
  onSelect: (place: SavedPlace) => void;
};

export function SavedPlaceItem({
  place,
  categoryNameByCode,
  readOnly = false,
  isMenuOpen = false,
  isEditing = false,
  memoDraft = "",
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
    onToggleMenu?.(place.id);
  }, [onToggleMenu, place.id]);
  usePointerDownOutside(menuChromeRef, !readOnly && isMenuOpen, closeMenu);

  const handleShare = useCallback(() => {
    onToggleMenu?.(place.id);
    sharePlace(place);
  }, [onToggleMenu, place]);

  const categoryRaw = place.category.trim();
  const categoryLabel =
    categoryRaw.length === 0 ? "" : (categoryNameByCode?.[categoryRaw]?.trim() ?? categoryRaw);

  return (
    <article className="rounded-lg border border-[#e8e8e8] bg-white px-3 py-3">
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => onSelect(place)}
          className="min-w-0 flex-1 space-y-2 text-left"
        >
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="min-w-0 shrink truncate text-sm leading-snug font-semibold tracking-[-0.01em] text-[#222222]">
              {place.name}
            </h3>
            {categoryLabel ? (
              <span
                className={cn(
                  "text-muted-foreground border-border/55 bg-muted/45 inline-flex size-6 shrink-0 items-center justify-center rounded-full",
                )}
                title={categoryLabel}
                aria-label={`카테고리 ${categoryLabel}`}
              >
                {renderMapPrimaryCategoryIcon(categoryLabel, "size-3 shrink-0 opacity-100")}
              </span>
            ) : null}
          </div>

          <p className="flex min-w-0 items-start gap-1.5 text-[0.7rem] leading-snug font-medium text-[#777777]">
            <MapPin className="mt-0.5 size-3.5 shrink-0 text-neutral-400" aria-hidden />
            <span className="min-w-0 truncate">{place.address}</span>
          </p>
        </button>

        {!readOnly ? (
          <div ref={menuChromeRef} className="relative -mr-1 shrink-0 pt-px">
            <button
              type="button"
              onClick={() => onToggleMenu?.(place.id)}
              className="text-foreground/85 hover:bg-muted/55 active:bg-muted/70 inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors"
            >
              <MoreVertical className="size-4.5" aria-hidden />
              <span className="sr-only">장소 메뉴 열기</span>
            </button>

            {isMenuOpen ? (
              <div className="absolute top-full right-0 z-10 mt-1 w-24 overflow-hidden rounded-md border border-[#eaeaea] bg-white py-0.5 shadow-[0_1px_4px_rgb(0_0_0/_0.035)]">
                <button
                  type="button"
                  onClick={handleShare}
                  className="block w-full px-4 py-2.5 text-left text-xs font-medium text-[#595959] active:bg-[#f7f7f7]"
                >
                  공유
                </button>
                <button
                  type="button"
                  onClick={() => onStartMemo?.(place)}
                  className="block w-full px-4 py-2.5 text-left text-xs font-medium text-[#595959] active:bg-[#f7f7f7]"
                >
                  메모
                </button>
                <button
                  type="button"
                  onClick={() => onDelete?.(place.id)}
                  className="block w-full px-4 py-2.5 text-left text-xs font-semibold text-(--brand-coral-solid) active:bg-[#f7f7f7]"
                >
                  삭제
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {place.memo && !isEditing ? (
        <p className="text-foreground border-border/50 bg-muted/20 mt-2 rounded-lg border px-3 py-2 text-xs leading-relaxed font-medium">
          {place.memo}
        </p>
      ) : null}

      {!readOnly && isEditing ? (
        <SavedPlaceMemoEditor
          value={memoDraft}
          onChange={onChangeMemo ?? (() => {})}
          onSave={onSaveMemo ?? (() => {})}
          onClear={onClearMemo ?? (() => {})}
        />
      ) : null}
    </article>
  );
}

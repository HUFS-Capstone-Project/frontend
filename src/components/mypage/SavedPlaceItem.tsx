import { MapPin, MoreVertical } from "lucide-react";
import { useCallback, useRef } from "react";

import { renderMapPrimaryCategoryIcon } from "@/components/map/filters/map-category-icons";
import { PlaceMemoList } from "@/components/place/PlaceMemoList";
import { PlaceOptionsMenu, PlaceOptionsMenuItem } from "@/components/place/PlaceOptionsMenu";
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

  const categoryRaw = place.categoryName?.trim() || place.category.trim();
  const categoryLabel =
    categoryRaw.length === 0 ? "" : (categoryNameByCode?.[categoryRaw]?.trim() ?? categoryRaw);
  const tagLabel = getPrimaryTagLabel(place);

  return (
    <article className="bg-card rounded-[1.15rem] px-3.5 py-3.5 shadow-[0_8px_24px_rgba(15,23,42,0.045)]">
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => onSelect(place)}
          className="min-w-0 flex-1 space-y-2 text-left"
        >
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="text-foreground min-w-0 shrink truncate text-sm leading-snug font-semibold tracking-[-0.01em]">
              {place.name}
            </h3>
            {categoryLabel ? (
              <span className="inline-flex shrink-0 items-center gap-2">
                <span
                  className={cn(
                    "text-muted-foreground border-border/55 bg-muted/45 inline-flex size-6 shrink-0 items-center justify-center rounded-full",
                  )}
                  title={categoryLabel}
                  aria-label={`카테고리 ${categoryLabel}`}
                >
                  {renderMapPrimaryCategoryIcon(categoryLabel, "size-3 shrink-0 opacity-100")}
                </span>
                {tagLabel ? (
                  <span className="text-muted-foreground text-[0.7rem] leading-none font-medium">
                    {tagLabel}
                  </span>
                ) : null}
              </span>
            ) : null}
          </div>

          <p className="text-muted-foreground flex min-w-0 items-start gap-1.5 text-[0.7rem] leading-snug font-medium">
            <MapPin className="text-muted-foreground mt-0.5 size-3.5 shrink-0" aria-hidden />
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
              <PlaceOptionsMenu>
                <PlaceOptionsMenuItem onClick={handleShare}>공유</PlaceOptionsMenuItem>
                <PlaceOptionsMenuItem onClick={() => onStartMemo?.(place)}>
                  메모
                </PlaceOptionsMenuItem>
                <PlaceOptionsMenuItem variant="danger" onClick={() => onDelete?.(place.id)}>
                  삭제
                </PlaceOptionsMenuItem>
              </PlaceOptionsMenu>
            ) : null}
          </div>
        ) : null}
      </div>

      {!isEditing ? <PlaceMemoList memos={place.memos} className="mt-2" /> : null}

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

function getPrimaryTagLabel(place: Pick<SavedPlace, "tagKeys" | "tagNames">): string {
  const tagName = place.tagNames?.find((name) => name.trim().length > 0)?.trim();
  if (tagName) {
    return tagName;
  }

  const tagKey = place.tagKeys?.find((key) => key.trim().length > 0)?.trim();
  if (!tagKey) {
    return "";
  }

  const segments = tagKey.split(/[-_/]/).map((segment) => segment.trim());
  return segments.at(-1) || tagKey;
}

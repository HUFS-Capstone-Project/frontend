import { renderMapPrimaryCategoryIcon } from "@/components/map/filters/map-category-icons";
import { cn } from "@/lib/utils";
import { getServiceCategoryName, isServiceCategoryCode } from "@/shared/lib/service-category";
import type { SavedPlace } from "@/shared/types/map-home";

type PlaceCategoryIconChipProps = {
  place: Pick<SavedPlace, "category" | "categoryName">;
  className?: string;
};

export function PlaceCategoryIconChip({ place, className }: PlaceCategoryIconChipProps) {
  const categoryCode = place.category.trim();
  const categoryLabel =
    place.categoryName?.trim() ||
    (isServiceCategoryCode(categoryCode) ? getServiceCategoryName(categoryCode) : categoryCode);

  if (!categoryLabel) {
    return null;
  }

  return (
    <span
      className={cn(
        "text-muted-foreground border-border/55 bg-muted/45 inline-flex size-5 shrink-0 items-center justify-center rounded-full",
        className,
      )}
      title={categoryLabel}
      aria-label={`카테고리 ${categoryLabel}`}
    >
      {renderMapPrimaryCategoryIcon(categoryCode || categoryLabel, "size-3 shrink-0 opacity-100")}
    </span>
  );
}

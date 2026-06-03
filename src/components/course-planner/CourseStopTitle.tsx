import { PlaceCategoryIconChip } from "@/components/link-place/PlaceCategoryIconChip";
import { cn } from "@/lib/utils";
import type { CourseStop } from "@/shared/types/course";

type CourseStopTitleProps = {
  stop: Pick<CourseStop, "name" | "category" | "categoryName" | "tagName">;
  /** 조회 모드 장소 제목은 `h2`, 편집 행은 `span` */
  asHeading?: boolean;
  className?: string;
};

export function CourseStopTitle({ stop, asHeading = false, className }: CourseStopTitleProps) {
  const tagLabel = stop.tagName?.trim() ?? "";
  const NameTag = asHeading ? "h2" : "span";

  return (
    <div className={cn("flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1", className)}>
      <NameTag className="text-foreground min-w-0 shrink truncate text-sm font-bold">
        {stop.name}
      </NameTag>
      <PlaceCategoryIconChip
        place={{ category: stop.category, categoryName: stop.categoryName }}
        className="size-6"
      />
      {tagLabel ? (
        <span className="text-muted-foreground text-xs leading-none font-medium">{tagLabel}</span>
      ) : null}
    </div>
  );
}

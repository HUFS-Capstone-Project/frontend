import { CalendarDays, Plus, RefreshCcw, Trash2 } from "lucide-react";

import { CoursePlannerField } from "@/components/course-planner/CoursePlannerField";
import { CategoryChipGrid, CategoryChipSkeletonList } from "@/components/map/CategoryChipGrid";
import { TagChipGroup } from "@/components/map/TagChipGroup";
import { isDefaultGroup, isEmptyGroup } from "@/features/map/utils/filter-panel-group";
import { cn } from "@/lib/utils";

export type PlaceTypeId = string;

export type CoursePlannerTag = {
  code: string;
  name: string;
  sortOrder: number;
};

export type CoursePlannerCategory = {
  id: PlaceTypeId;
  label: string;
  tagGroups: {
    code: string;
    name: string | null;
    sortOrder: number;
    tags: CoursePlannerTag[];
  }[];
  tags: CoursePlannerTag[];
};

export type CourseCategoryOrder = {
  id: number;
  category: PlaceTypeId;
  tags: string[];
};

type CoursePlannerPanelProps = {
  regionValue: string;
  dateTimeValue: string;
  courseOrders: CourseCategoryOrder[];
  categoryOptions: CoursePlannerCategory[];
  isCategoryLoading?: boolean;
  isCategoryError?: boolean;
  className?: string;
  onOpenRegionSelect: () => void;
  onOpenDateTimeSelect: () => void;
  onAddOrder: () => void;
  onRemoveOrder: (orderId: number) => void;
  onSelectOrderCategory: (orderId: number, placeTypeId: PlaceTypeId) => void;
  onToggleOrderTag: (orderId: number, tag: string) => void;
  onRetryLoadCategories?: () => void;
};

export function CoursePlannerPanel({
  regionValue,
  dateTimeValue,
  courseOrders,
  categoryOptions,
  isCategoryLoading = false,
  isCategoryError = false,
  className,
  onOpenRegionSelect,
  onOpenDateTimeSelect,
  onAddOrder,
  onRemoveOrder,
  onSelectOrderCategory,
  onToggleOrderTag,
  onRetryLoadCategories,
}: CoursePlannerPanelProps) {
  const categoryCodes = categoryOptions.map((category) => category.id);
  const showAddButton = !isCategoryLoading && !(isCategoryError && categoryOptions.length === 0);

  return (
    <section className={cn("bg-background w-full max-w-full min-w-0 px-6 pt-8 pb-0", className)}>
      <h1 className="text-foreground text-[1.25rem] leading-tight font-semibold">
        맞춤 데이트 코스 만들기
      </h1>

      <div className="mt-6 grid gap-5">
        <CoursePlannerField
          label="지역 설정"
          required
          value={regionValue}
          placeholder="지역을 선택해 주세요."
          onClick={onOpenRegionSelect}
        />

        <CoursePlannerField
          label="날짜 및 시간 설정"
          value={dateTimeValue}
          placeholder="날짜 및 시간을 설정해 주세요."
          icon={<CalendarDays className="size-4" aria-hidden />}
          onClick={onOpenDateTimeSelect}
        />

        <div className="grid gap-3">
          <div>
            <span className="text-foreground text-sm font-semibold">
              어떤 장소를 넣을까요?
              <span className="ml-0.5 text-[#f06f6b]">*</span>
            </span>
            <p className="text-muted-foreground mt-1 text-xs">
              코스에 넣고 싶은 장소를 순서대로 골라주세요.
            </p>
          </div>

          {isCategoryLoading ? (
            <CategoryChipSkeletonList
              keyPrefix="course-category-chip-skeleton"
              itemClassName="bg-background/85"
            />
          ) : isCategoryError && categoryOptions.length === 0 ? (
            <div className="rounded-lg border border-dashed px-4 py-4">
              <p className="text-muted-foreground text-sm">카테고리를 불러오지 못했어요.</p>
              {onRetryLoadCategories ? (
                <button
                  type="button"
                  onClick={onRetryLoadCategories}
                  className="text-primary mt-3 inline-flex items-center gap-1.5 text-sm font-semibold"
                >
                  <RefreshCcw className="size-3.5" aria-hidden />
                  다시 불러오기
                </button>
              ) : null}
            </div>
          ) : (
            <div className="grid gap-3">
              {courseOrders.map((order, index) => {
                const selectedCategory = categoryOptions.find((type) => type.id === order.category);

                return (
                  <div
                    key={order.id}
                    className="border-border/55 bg-background/85 rounded-2xl border px-3 py-3.5"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="bg-primary text-primary-foreground inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[0.68rem] font-bold">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-foreground truncate text-sm font-semibold">
                            {index + 1}번째로 갈 장소
                          </p>
                          <p className="text-muted-foreground text-xs">
                            이 순서에 넣을 장소 유형을 골라주세요.
                          </p>
                        </div>
                      </div>

                      {courseOrders.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => onRemoveOrder(order.id)}
                          className="text-muted-foreground hover:bg-muted/45 focus-visible:ring-ring/50 inline-flex size-7 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:ring-3 focus-visible:outline-none"
                          aria-label="방문 순서 삭제"
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      ) : null}
                    </div>

                    <div>
                      <CategoryChipGrid
                        categories={categoryCodes}
                        isLoading={false}
                        getCategoryLabel={(category) =>
                          categoryOptions.find((option) => option.id === category)?.label ??
                          category
                        }
                        isHighlighted={(category) => order.category === category}
                        isPanelFocused={() => false}
                        getSelectedTagCount={(category) =>
                          order.category === category ? order.tags.length : 0
                        }
                        onToggleCategory={(category) => onSelectOrderCategory(order.id, category)}
                      />
                    </div>

                    <div className="border-border/60 mt-3 space-y-3 border-t pt-3">
                      {selectedCategory && selectedCategory.tagGroups.length > 0 ? (
                        selectedCategory.tagGroups.map((group) => {
                          if (isEmptyGroup(group)) {
                            return null;
                          }

                          return (
                            <div key={`${selectedCategory.id}-${group.code}`}>
                              {!isDefaultGroup(group) ? (
                                <div className="text-muted-foreground/90 mb-1.5 text-[0.75rem] font-semibold tracking-tight">
                                  {group.name}
                                </div>
                              ) : null}
                              <TagChipGroup
                                tags={group.tags}
                                selectedKeys={order.tags}
                                onToggleTagKey={(tag) => onToggleOrderTag(order.id, tag)}
                              />
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-muted-foreground text-xs">
                          선택할 수 있는 세부 태그가 없어요.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {showAddButton ? (
            <button
              type="button"
              onClick={onAddOrder}
              className="border-border bg-background text-muted-foreground hover:bg-muted/35 focus-visible:ring-ring/50 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed text-sm font-semibold transition-colors focus-visible:ring-3 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
              disabled={categoryOptions.length === 0}
            >
              <Plus className="size-4" aria-hidden />
              방문할 장소 추가하기
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
